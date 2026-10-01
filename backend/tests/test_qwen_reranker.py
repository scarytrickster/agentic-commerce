import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

from app.database.session import AsyncSessionLocal
from app.rag.dedup import deduplicate_products
from app.rag.search import search_products
from app.services.product_recommendation import get_products_by_ids
from app.services.query_parser import parse_shopping_query


MODEL_NAME = "Qwen/Qwen3-Reranker-0.6B"

INSTRUCTION = (
    "Given a web search query, retrieve relevant passages "
    "that answer the query"
)

MAX_LENGTH = 8192


# =========================================================
# 1. Load Qwen
# =========================================================

print("Loading tokenizer...")

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME,
    padding_side="left",
)

print("Loading model...")

model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
).eval()

print("Model loaded successfully!")
print("Device:", model.device)


# =========================================================
# 2. Qwen configuration
# =========================================================

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


# =========================================================
# 3. Qwen input formatting
# =========================================================

def format_instruction(
    instruction: str,
    query: str,
    document: str,
) -> str:

    return (
        f"<Instruct>: {instruction}\n"
        f"<Query>: {query}\n"
        f"<Document>: {document}"
    )


def process_inputs(
    pairs: list[tuple[str, str]],
):

    formatted_pairs = [
        format_instruction(
            INSTRUCTION,
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
    
    for key in inputs:
        inputs[key] = inputs[key].to(
            model.device
        )

    return inputs


# =========================================================
# 4. Qwen scoring
# =========================================================

@torch.no_grad()
def compute_scores(inputs):

    batch_scores = model(
        **inputs
    ).logits[:, -1, :]

    true_vector = batch_scores[
        :,
        TOKEN_TRUE_ID,
    ]

    false_vector = batch_scores[
        :,
        TOKEN_FALSE_ID,
    ]

    batch_scores = torch.stack(
        [
            false_vector,
            true_vector,
        ],
        dim=1,
    )

    batch_scores = torch.nn.functional.log_softmax(
        batch_scores,
        dim=1,
    )

    scores = batch_scores[
        :,
        1,
    ].exp()

    return scores.tolist()


# =========================================================
# 5. Main benchmark
# =========================================================

async def main():

    query = "gaming accessories under ₹2000"

    print("\n")
    print("=" * 110)
    print("QUERY")
    print("=" * 110)
    print(query)

    # -----------------------------------------------------
    # Parse query
    # -----------------------------------------------------

    intent = parse_shopping_query(query)

    print("\nParsed intent:")
    print("Category:", intent.category)
    print("Min price:", intent.min_price)
    print("Max price:", intent.max_price)


    # -----------------------------------------------------
    # Jina v3 retrieval
    # -----------------------------------------------------

    print("\nRetrieving candidates with Jina v3...")

    qdrant_results = search_products(
        query,
        limit=20,
    )

    print(
        f"Raw Jina candidates: "
        f"{len(qdrant_results)}"
    )


    # -----------------------------------------------------
    # Extract product IDs
    # -----------------------------------------------------

    product_ids = [
        result.payload["product_id"]
        for result in qdrant_results
    ]


    # -----------------------------------------------------
    # PostgreSQL hard filtering
    # -----------------------------------------------------

    async with AsyncSessionLocal() as db:

        products = await get_products_by_ids(
            db=db,
            product_ids=product_ids,
            category=(
                None
                if intent.category == "accessories"
                else intent.category
            ),
            min_price=intent.min_price,
            max_price=intent.max_price,
            in_stock=True,
        )


    print(
        f"After PostgreSQL filters: "
        f"{len(products)}"
    )


    # -----------------------------------------------------
    # Map PostgreSQL products
    # -----------------------------------------------------

    product_map = {
        product.id: product
        for product in products
    }


    # -----------------------------------------------------
    # Preserve Jina ranking order
    # -----------------------------------------------------

    candidates = []

    for result in qdrant_results:

        product_id = result.payload[
            "product_id"
        ]

        if product_id not in product_map:
            continue

        product = product_map[
            product_id
        ]

        candidates.append(
            {
                "id": product.id,
                "name": product.name,
                "category": product.category,
                "description": product.description,
                "price": str(product.price),
                "stock": product.stock,
                "image_url": product.image_url,
                "semantic_score": result.score,
            }
        )


    # -----------------------------------------------------
    # Deduplicate
    # -----------------------------------------------------

    candidates = deduplicate_products(
        candidates
    )


    print(
        f"After deduplication: "
        f"{len(candidates)}"
    )


    # -----------------------------------------------------
    # Display candidates BEFORE Qwen
    # -----------------------------------------------------

    print("\n")
    print("=" * 110)
    print("CANDIDATES BEFORE QWEN")
    print("=" * 110)

    for index, product in enumerate(
        candidates,
        start=1,
    ):

        print(
            f"{index:2}. "
            f"Jina: {product['semantic_score']:.4f} | "
            f"₹{product['price']} | "
            f"{product['name']}"
        )


    # -----------------------------------------------------
    # Prepare Qwen documents
    # -----------------------------------------------------

    pairs = []

    for product in candidates:

        document = (
            f"Product: {product['name']}\n"
            f"Category: {product['category']}\n"
            f"Description: "
            f"{(product.get('description') or '')[:800]}\n"
            f"Price: ₹{product['price']}\n"
            f"Stock: {product['stock']}"
        )

        pairs.append(
            (
                query,
                document,
            )
        )


    # -----------------------------------------------------
    # Qwen reranking
    # -----------------------------------------------------

    print("\nRunning Qwen reranker...")

    inputs = process_inputs(
        pairs
    )

    scores = compute_scores(
        inputs
    )


    # -----------------------------------------------------
    # Attach scores
    # -----------------------------------------------------

    for product, score in zip(
        candidates,
        scores,
    ):

        product["qwen_score"] = float(
            score
        )


    # -----------------------------------------------------
    # Sort by Qwen
    # -----------------------------------------------------

    candidates.sort(
        key=lambda product:
            product["qwen_score"],
        reverse=True,
    )


    # -----------------------------------------------------
    # Final results
    # -----------------------------------------------------

    print("\n")
    print("=" * 110)
    print("FINAL QWEN RANKING")
    print("=" * 110)

    for index, product in enumerate(
        candidates[:5],
        start=1,
    ):

        print(
            f"{index}. "
            f"Qwen: {product['qwen_score']:.8f} | "
            f"Jina: {product['semantic_score']:.4f} | "
            f"₹{product['price']} | "
            f"{product['name']}"
        )


# =========================================================
# 6. Run
# =========================================================

if __name__ == "__main__":
    import asyncio

    asyncio.run(main())