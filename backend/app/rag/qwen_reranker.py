import torch
from transformers import AutoTokenizer, AutoModelForCausalLM


MODEL_NAME = "Qwen/Qwen3-Reranker-0.6B"

INSTRUCTION = (
    "Given a web search query, retrieve relevant passages "
    "that answer the query"
)

MAX_LENGTH = 8192


print("Loading Qwen reranker...")

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME,
    padding_side="left",
)

model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
).eval()

print("Qwen reranker loaded.")


TOKEN_FALSE_ID = tokenizer.convert_tokens_to_ids("no")
TOKEN_TRUE_ID = tokenizer.convert_tokens_to_ids("yes")


PREFIX = (
    "<|im_start|>system\n"
    'Judge whether the Document meets the requirements based on the Query '
    'and the Instruct provided. Note that the answer can only be "yes" or "no".'
    "<|im_end|>\n"
    "<|im_start|>user\n"
)

SUFFIX = (
    "<|im_end|>\n"
    "<|im_start|>assistant\n"
    "<think>\n\n</think>\n\n"
)


PREFIX_TOKENS = tokenizer.encode(
    PREFIX,
    add_special_tokens=False,
)

SUFFIX_TOKENS = tokenizer.encode(
    SUFFIX,
    add_special_tokens=False,
)


def _format_instruction(
    query: str,
    document: str,
) -> str:

    return (
        f"<Instruct>: {INSTRUCTION}\n"
        f"<Query>: {query}\n"
        f"<Document>: {document}"
    )


def _process_inputs(
    pairs: list[tuple[str, str]],
):

    formatted_pairs = [
        _format_instruction(
            query,
            document,
        )
        for query, document in pairs
    ]

    inputs = tokenizer(
        formatted_pairs,
        padding=False,
        truncation="longest_first",
        return_attention_mask=False,
        max_length=(
            MAX_LENGTH
            - len(PREFIX_TOKENS)
            - len(SUFFIX_TOKENS)
        ),
    )

    for i, input_ids in enumerate(
        inputs["input_ids"]
    ):

        inputs["input_ids"][i] = (
            PREFIX_TOKENS
            + input_ids
            + SUFFIX_TOKENS
        )

    inputs = tokenizer.pad(
        inputs,
        padding=True,
        return_tensors="pt",
    )

    inputs = {
        key: value.to(model.device)
        for key, value in inputs.items()
    }

    return inputs


@torch.no_grad()
def rerank_products(
    query: str,
    products: list[dict],
    limit: int = 5,
) -> list[dict]:

    if not products:
        return []

    documents = []

    for product in products:

        document = (
            f"Product: {product['name']}\n"
            f"Category: {product['category']}\n"
            f"Description: "
            f"{(product.get('description') or '')[:800]}\n"
            f"Price: ₹{product['price']}\n"
            f"Stock: {product['stock']}"
        )

        documents.append(document)

    pairs = [
        (query, document)
        for document in documents
    ]

    inputs = _process_inputs(pairs)

    outputs = model(**inputs)

    final_logits = outputs.logits[:, -1, :]

    true_logits = final_logits[
        :,
        TOKEN_TRUE_ID,
    ]

    false_logits = final_logits[
        :,
        TOKEN_FALSE_ID,
    ]

    logits = torch.stack(
        [
            false_logits,
            true_logits,
        ],
        dim=1,
    )

    scores = torch.nn.functional.log_softmax(
        logits,
        dim=1,
    )[:, 1].exp()

    ranked = []

    for product, score in zip(
        products,
        scores,
    ):

        product_copy = product.copy()

        product_copy["rerank_score"] = float(
            score
        )

        ranked.append(product_copy)

    ranked.sort(
        key=lambda product:
            product["rerank_score"],
        reverse=True,
    )

    return ranked[:limit]