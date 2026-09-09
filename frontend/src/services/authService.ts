import type { Token, UserCreate } from "@/utils/types";
import { request } from "./http";

export async function login(email: string, password: string): Promise<Token> {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  return request<Token>("/api/v1/auth/login", {
    method: "POST",
    auth: false,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
}

export async function register(data: UserCreate): Promise<Token> {
  return request<Token>("/api/v1/auth/register", {
    method: "POST",
    auth: false,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
