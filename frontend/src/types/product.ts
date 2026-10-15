export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  category: string;
  stock: number;
  image_url: string | null;
};

export type AgentProduct = {
  id: number;
  name: string;
  price: string | number;
  category: string;
  stock: number;
  image_url: string | null;
};

export type AgentResponse = {
  response: string;
  products: AgentProduct[];
  cross_sell_products: AgentProduct[];
};
