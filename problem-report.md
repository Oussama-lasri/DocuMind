# DocuMind document chat issue report

## Symptom

Questions about an uploaded or selected document could produce an answer asking the user to attach or paste the document. Logging out and signing back in sometimes made the document available again.

## Findings

1. **Retrieval searched the wrong Chroma collection.** Uploads are stored in the shared `documents` collection, with `user_id` and `document_id` metadata. The chat retrieval tool instead opened a collection using a filename supplied by the model, so it could fail to find the uploaded document.
2. **Selected document IDs were not used by retrieval.** The chat request carried document IDs, but the retrieval tool did not filter by those IDs or by the authenticated user.
3. **Summary requests could bypass retrieval.** The router could send a request about an uploaded document to a summarizer that expects the document text in conversation history. Each chat request sends only the latest question to the graph, so that text was not available to the summarizer.
4. **The frontend did not consistently recognize ready documents.** The backend reports completed ingestion as `completed`, while parts of the frontend only treated `processed` documents as ready. The chat source list was also loaded only when the page first mounted, which could leave stale source state after an account change.
5. **The chat endpoint trusted a user ID from the request body.** That value should come from the authenticated session instead.

## Changes made

- Protected the chat endpoint with the existing JWT-backed current-user dependency and use that user ID for retrieval.
- Pass authenticated user ID and selected document IDs through LangGraph state to the retrieval tool.
- Query the same Chroma collection used by ingestion and filter results by both user ID and selected document IDs.
- Route summaries of selected documents through research/retrieval, and instruct the research agent to retrieve before answering.
- Reload source documents when the authenticated user changes; recognize both `completed` and `processed` as ready statuses.

## Files changed

- `backend/app/api/v1/endpoints/chat.py`
- `backend/app/ai/agents/router_agent.py`
- `backend/app/ai/agents/research_agent.py`
- `backend/app/ai/state/state.py`
- `backend/app/ai/tools/retriever_tool.py`
- `backend/app/utils/document_processing_service.py`
- `frontend/src/_pages/ChatPage.tsx`
- `frontend/src/_pages/DocumentsPage.tsx`
- `frontend/src/components/studio/SourcesRail.tsx`

## Verification

Tests were not run. Restart the backend and try asking a question or requesting a summary with the document selected in the Sources panel.
