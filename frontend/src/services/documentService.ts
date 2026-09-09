import type { DocumentList, UploadResponse } from "@/utils/types";
import { clearToken, getToken } from "@/utils/auth-storage";
import { API_BASE_URL, ApiError, request } from "./http";

export async function uploadDocument(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/v1/documents/upload`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 401) {
        clearToken();
        if (typeof window !== "undefined") {
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- same rationale as http.ts
          window.location.href = "/login";
        }
        reject(new ApiError("Your session expired. Please sign in again.", 401));
        return;
      }
      try {
        const parsed = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(parsed as UploadResponse);
        } else {
          reject(new ApiError(parsed?.detail ?? "Upload failed.", xhr.status));
        }
      } catch {
        reject(new ApiError("Upload failed.", xhr.status));
      }
    };

    xhr.onerror = () => reject(new ApiError("Network error during upload.", 0));
    xhr.send(formData);
  });
}

export async function listDocuments(): Promise<DocumentList> {
  return request<DocumentList>("/api/v1/documents/list");
}

export async function deleteDocument(documentId: string): Promise<{ message: string }> {
  return request(`/api/v1/documents/delete/${documentId}`, { method: "DELETE" });
}

export function downloadDocumentUrl(documentId: string): string {
  return `${API_BASE_URL}/api/v1/documents/download/${documentId}`;
}

export async function searchDocuments(query: string): Promise<unknown> {
  return request(`/api/v1/documents/search?query=${encodeURIComponent(query)}`);
}
