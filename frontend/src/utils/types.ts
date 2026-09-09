// Mirrors backend/app/schemas/*.py

export interface UserCreate {
  full_name: string;
  email: string;
  role?: string; // defaults to "user" server-side
  password: string;
}

export interface UserResponse {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export type DocumentStatus = "processing" | "processed" | "failed" | string;

export interface DocumentResponse {
  id: string;
  filename: string;
  upload_date: string;
  file_size: number;
  status: DocumentStatus;
}

export interface DocumentList {
  documents: DocumentResponse[];
  total: number;
}

export interface UploadResponse {
  message: string;
  filename: string;
  document_id: string;
  status: DocumentStatus;
}

export interface Source {
  document_name: string;
  page?: number | null;
  score?: number | null;
}

export interface ChatRequest {
  query: string;
  user_id: string;
  session_id?: string | null;
  temperature?: number;
  /** Limit retrieval to these document ids when provided. */
  document_ids?: string[] | null;
  /** Allow the assistant to consult the open web. */
  use_web?: boolean;
  /** Extra URLs treated as sources for this turn. */
  web_urls?: string[] | null;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
  agent_used?: string | null;
  processing_time?: number | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  agentUsed?: string | null;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface ApiErrorBody {
  detail?: string | { msg: string }[] | Record<string, unknown>;
}
