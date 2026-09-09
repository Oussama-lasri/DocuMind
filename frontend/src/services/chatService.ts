import type { ChatRequest, ChatResponse } from "@/utils/types";
import { request } from "./http";

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  return request<ChatResponse>("/api/v1/chat/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
