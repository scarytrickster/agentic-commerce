export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getAccessToken() {
  return typeof window === "undefined" ? null : window.localStorage.getItem("access_token");
}

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem("access_token", token);
  else window.localStorage.removeItem("access_token");
  window.dispatchEvent(new Event("agentic-auth-change"));
}

async function getErrorMessage(response: Response) {
  try {
    const data: unknown = await response.json();
    if (typeof data === "object" && data !== null && "detail" in data) {
      const detail = data.detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail)) {
        return detail.map((item) => {
          if (typeof item === "object" && item !== null && "msg" in item) return String(item.msg);
          return String(item);
        }).join(" ");
      }
    }
  } catch {
    // Fall back to a status-based message when the API did not return JSON.
  }
  return `Request failed (${response.status}). Please try again.`;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("Could not reach the store. Check your connection and try again.", 0);
  }

  if (!response.ok) {
    if (response.status === 401 && token && path !== "/auth/login" && path !== "/auth/signup") setAccessToken(null);
    throw new ApiError(await getErrorMessage(response), response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export type User = { id: number; email: string };
export type CartItem = {
  product_id: number;
  product_name: string;
  price: string | number;
  quantity: number;
  subtotal: string | number;
  category: string;
  image_url: string | null;
  stock: number;
};
export type Cart = { items: CartItem[]; total_amount: string | number };
export type OrderItem = {
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
};
export type Order = {
  id: number;
  created_at: string;
  total_amount: number;
  status: string;
  payment_status: string;
  items: OrderItem[];
};

export function formatPrice(value: string | number) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : String(value);
}
