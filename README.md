# 🧠 DocuMind

> **A private AI document assistant that lets you upload your documents and interact with them using semantic search, Retrieval-Augmented Generation (RAG), and multi-agent AI workflows.**

DocuMind turns a collection of documents into an intelligent, searchable knowledge base.

Instead of manually searching through PDFs, contracts, reports, research papers, or administrative documents, users can simply ask questions in natural language and let DocuMind find the relevant information and generate an answer grounded in their documents.

The long-term vision is to go beyond document Q&A: **DocuMind is designed as an AI document agent platform capable of researching documents, summarizing information, generating reports, and executing document-related actions.**

---

## 🎯 What is DocuMind?

Imagine having hundreds of documents:

* Contracts
* Invoices
* Technical documentation
* Research papers
* Reports
* Lecture notes
* Administrative documents
* Company knowledge

Finding one specific piece of information can take minutes or even hours.

With DocuMind, you can ask:

> **"What are the payment terms in my contract with Orange?"**

or:

> **"Summarize the main risks mentioned in these contracts."**

or:

> **"What are the main objectives of this project?"**

DocuMind processes your documents, retrieves the most relevant information, and uses an LLM to generate an answer based on that context.

```text
                  Your Documents
                        │
                        ▼
              ┌──────────────────┐
              │ Document Parsing │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │     Chunking     │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │    Embeddings    │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │   Vector Store   │
              └────────┬─────────┘
                       │
                       │
                User Question
                       │
                       ▼
              ┌──────────────────┐
              │ Semantic Search  │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │ Relevant Chunks  │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │       LLM        │
              └────────┬─────────┘
                       ▼
                Grounded Answer
```

---

# 🚀 Why DocuMind?

Traditional chatbots rely primarily on the knowledge encoded in an LLM.

That becomes problematic when users need to work with **private or domain-specific information**.

DocuMind addresses this with Retrieval-Augmented Generation.

Instead of simply asking:

```text
Question → LLM → Answer
```

DocuMind uses:

```text
Question
   ↓
Retrieve relevant information
   ↓
Provide context to the LLM
   ↓
Generate a grounded answer
```

This helps the assistant answer questions using the user's own knowledge base rather than relying only on the model's general knowledge.

> **RAG does not guarantee zero hallucinations. Instead, it grounds generation in retrieved document context and makes answers more relevant and traceable.**

---

# ✨ Core Features

## 📄 Document Management

Upload and process documents to build a personal knowledge base.

Current document processing supports formats such as:

* PDF
* DOCX
* HTML

The processing pipeline:

```text
Upload
   ↓
Validation
   ↓
Document Loading
   ↓
Text Extraction
   ↓
Metadata Enrichment
   ↓
Chunking
   ↓
Embeddings
   ↓
Vector Storage
```

Each chunk can contain metadata such as:

```json
{
  "user_id": "...",
  "document_id": "...",
  "filename": "...",
  "chunk_index": 0,
  "chunk_count": 20,
  "chunk_size": 950
}
```

This metadata enables document-level and user-level filtering during retrieval.

---

# 🔎 Semantic Search

DocuMind doesn't rely only on keyword matching.

Documents and queries are converted into **vector embeddings**.

For example:

```text
"How much does the employee earn?"
```

can retrieve content containing:

```text
"The employee shall receive a monthly salary..."
```

even though the exact words are different.

The process is:

```text
Document
   ↓
Text Chunk
   ↓
Embedding Model
   ↓
Vector
   ↓
Vector Database
```

When the user asks a question:

```text
User Query
   ↓
Query Embedding
   ↓
Similarity Search
   ↓
Top-K Relevant Chunks
```

This is the foundation of DocuMind's RAG system.

---

# 🧠 Retrieval-Augmented Generation

DocuMind separates **retrieval** from **generation**.

### Retrieval

Find the information that is relevant to the question.

```text
Question
   ↓
Embedding
   ↓
Vector Search
   ↓
Relevant Documents
```

### Generation

Give the retrieved context to the LLM.

```text
Question + Retrieved Context
             ↓
            LLM
             ↓
       Generated Answer
```

Complete pipeline:

```text
                ┌───────────────┐
                │ User Question │
                └───────┬───────┘
                        ▼
                ┌───────────────┐
                │   Embedding   │
                └───────┬───────┘
                        ▼
                ┌───────────────┐
                │    Search     │
                │   Vector DB   │
                └───────┬───────┘
                        ▼
                ┌───────────────┐
                │   Retrieved   │
                │    Chunks     │
                └───────┬───────┘
                        ▼
                ┌───────────────┐
                │      LLM      │
                └───────┬───────┘
                        ▼
                ┌───────────────┐
                │    Answer     │
                └───────────────┘
```

---

# 🤖 Multi-Agent Architecture

One of the main goals of DocuMind is to move beyond a simple RAG chatbot.

The system uses **LangGraph** to orchestrate specialized AI agents.

Instead of having one agent responsible for everything, different agents can handle different types of tasks.

```text
                         User
                          │
                          ▼
                  ┌──────────────┐
                  │ Router Agent │
                  └──────┬───────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌────────────┐ ┌────────────┐ ┌────────────┐
   │  Research  │ │ Summarizer │ │   Action   │
   │    Agent   │ │    Agent   │ │    Agent   │
   └─────┬──────┘ └─────┬──────┘ └─────┬──────┘
         │              │              │
         ▼              ▼              ▼
    Search Tools    Processing      Action Tools
         │              │              │
         └──────────────┼──────────────┘
                        ▼
                     Response
```

### Router Agent

Determines what the user is trying to accomplish.

For example:

```text
"Find the payment deadline."
        ↓
Research Agent
```

or:

```text
"Summarize this report."
        ↓
Summarizer Agent
```

or:

```text
"Generate a report from these documents."
        ↓
Action Agent
```

---

## 🔬 Research Agent

The Research Agent is responsible for finding relevant information.

It can use retrieval tools to search the user's document collection.

```text
Question
   ↓
Research Agent
   ↓
Search Tool
   ↓
Vector Store
   ↓
Relevant Documents
   ↓
LLM
```

---

## 📝 Summarizer Agent

The Summarizer Agent focuses on transforming retrieved information into concise and useful summaries.

Potential use cases include:

* Summarizing reports
* Summarizing contracts
* Summarizing research papers
* Extracting key points
* Creating executive summaries

---

## ⚙️ Action Agent

The Action Agent is designed to perform tasks beyond answering questions.

Examples:

* Generate reports
* Transform retrieved information
* Execute tools
* Perform document-related actions

The architecture can be extended with additional tools over time.

---

# 🛠️ Tool Calling

DocuMind uses LangChain tools to expose capabilities to AI agents.

For example:

```python
from langchain_core.tools import tool


@tool
def search_documents(query: str, collection_name: str) -> str:
    """Search indexed documents."""
    ...
```

LangGraph can then use a `ToolNode` to execute the tool selected by the model.

Conceptually:

```text
User Request
     ↓
    Agent
     ↓
Does the agent need a tool?
     │
   ┌─┴─┐
  Yes  No
   │    │
   ▼    ▼
ToolNode Answer
   │
   ▼
Tool Result
   │
   ▼
  Agent
   │
   ▼
 Answer
```

This allows DocuMind to evolve from a static RAG pipeline into an **agentic system**.

---

# 🏗️ System Architecture

DocuMind follows a layered backend architecture.

```text
                         ┌───────────────┐
                         │     Client    │
                         │ Web / Mobile  │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │    FastAPI    │
                         │    REST API   │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │    Service    │
                         │     Layer     │
                         └───────┬───────┘
                                 │
                 ┌───────────────┼───────────────┐
                 ▼               ▼               ▼
          ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
          │ PostgreSQL  │ │   ChromaDB  │ │   Storage   │
          │  Metadata   │ │ Vector Store│ │   Files     │
          └─────────────┘ └──────┬──────┘ └─────────────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │   RAG Layer   │
                         │               │
                         │ Embeddings    │
                         │ Retrieval     │
                         │ Generation    │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │   LangGraph   │
                         │ Agent Workflow│
                         └───────────────┘
```

---

# 🔄 End-to-End Workflow

## 1. Upload

The user uploads a document.

```text
User
 ↓
FastAPI
 ↓
Document Service
```

## 2. Processing

The document is loaded and its content is extracted.

```text
PDF / DOCX / HTML
        ↓
Document Loader
        ↓
Extracted Text
```

## 3. Chunking

Large documents are divided into smaller chunks.

```text
Large Document
      ↓
Text Splitter
      ↓
Chunk 1
Chunk 2
Chunk 3
...
Chunk N
```

## 4. Embedding

Each chunk is converted into a vector representation.

```text
Chunk
  ↓
Embedding Model
  ↓
Vector
```

## 5. Storage

Vectors are stored in ChromaDB together with metadata.

```text
Vector
 +
Metadata
   ↓
ChromaDB
```

## 6. User Question

The user asks a natural-language question.

```text
"What are the payment conditions?"
```

## 7. Retrieval

The system searches for the most relevant chunks.

```text
Question
   ↓
Query Embedding
   ↓
Similarity Search
   ↓
Relevant Chunks
```

## 8. Generation

The LLM receives the question together with the retrieved context.

```text
Question
+
Retrieved Context
        ↓
       LLM
        ↓
Generated Answer
```

---

# 🔐 Privacy & Security

DocuMind is designed around the idea of a **private document knowledge base**.

The architecture supports:

* User authentication
* JWT-based authorization
* User-specific document access
* Metadata-based filtering
* Protected document endpoints
* Separation between application data and vector data

Documents can be isolated by user identifiers during retrieval:

```text
User A
  ↓
user_id = A
  ↓
Only User A's documents

User B
  ↓
user_id = B
  ↓
Only User B's documents
```

> Production deployments should additionally enforce infrastructure-level security, encryption, access controls, secure secret management, and appropriate data-retention policies.

---

# 🌍 Real-World Use Cases

## 💼 Freelancers & Companies

Upload:

* Contracts
* Proposals
* Invoices
* Business documents

Ask:

> "What are the payment conditions?"

> "What are my obligations under this contract?"

---

## ⚖️ Legal Professionals

Upload multiple contracts and ask:

> "What are the differences between these contracts?"

> "Which contract contains a termination clause?"

> "What are the potential risks?"

---

## 🎓 Students & Researchers

Upload:

* Lecture notes
* Research papers
* Books
* Course material

Ask:

> "Explain the main concepts from these documents."

> "Summarize chapter 4."

> "What are the main conclusions of these papers?"

---

## 🏢 SMEs & Administrations

DocuMind can eventually support organizations working with large collections of administrative documents in:

* French
* Arabic
* English

This is particularly relevant for organizations that manage large amounts of multilingual documentation.

---

# 🌐 Multi-Language Vision

DocuMind is designed to support multilingual document interaction.

Potential languages include:

* 🇬🇧 English
* 🇫🇷 French
* 🇲🇦 Arabic

A user could ask a question in French about an Arabic document and receive the answer in French.

For example:

```text
Document:
Arabic administrative document

Question:
"Quels sont les délais mentionnés dans le document ?"

Answer:
French answer grounded in the retrieved Arabic content.
```

Multilingual retrieval and generation can be improved further with multilingual embedding models and language-aware prompting.

---

# 🧰 Technology Stack

## Backend

* Python
* FastAPI
* SQLAlchemy
* PostgreSQL
* Pydantic

## AI & RAG

* LangChain
* LangGraph
* LangSmith
* HuggingFace Embeddings
* ChromaDB
* LLM providers

## Document Processing

* PyPDFLoader
* Docx2txtLoader
* UnstructuredHTMLLoader
* RecursiveCharacterTextSplitter

## Authentication

* JWT
* OAuth2
* bcrypt
* FastAPI security dependencies

---

# 📁 Project Structure

```text
DocuMind/
│
├── backend/
│   │
│   ├── app/
│   │   │
│   │   ├── ai/
│   │   │   ├── agents/
│   │   │   ├── graph/
│   │   │   ├── rag/
│   │   │   ├── tools/
│   │   │   └── state/
│   │   │
│   │   ├── core/
│   │   │   ├── database.py
│   │   │   └── exceptions.py
│   │   │
│   │   ├── models/
│   │   │
│   │   ├── repositories/
│   │   │
│   │   ├── routers/
│   │   │
│   │   ├── schemas/
│   │   │
│   │   ├── services/
│   │   │
│   │   └── utils/
│   │
│   ├── requirements.txt
│   └── ...
│
├── .gitignore
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* Python 3.11+
* PostgreSQL
* Git

Optional:

* Docker
* Docker Compose

---

## 1. Clone the Repository

```bash
git clone https://github.com/Oussama-lasri/DocuMind.git

cd DocuMind
```

---

## 2. Create a Virtual Environment

### Windows

```bash
python -m venv venv

venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv

source venv/bin/activate
```

---

## 3. Install Dependencies

```bash
cd backend

pip install -r requirements.txt
```

---

## 4. Configure Environment Variables

Create:

```text
backend/.env
```

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/documind

SECRET_KEY=your-secret-key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

GOOGLE_API_KEY=your-google-api-key
```

Add any additional environment variables required by the selected LLM provider.

> **Never commit API keys, passwords, JWT secrets, or `.env` files to Git.**

---

# ▶️ Run the Application

From the `backend` directory:

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

---

# 🔑 Authentication Flow

DocuMind uses JWT authentication.

```text
┌──────────┐
│ Register │
└────┬─────┘
     ▼
┌──────────┐
│  Login   │
└────┬─────┘
     ▼
┌──────────────┐
│ Access Token │
└────┬─────────┘
     ▼
┌──────────────┐
│ Protected API│
└──────────────┘
```

Authenticated requests use:

```http
Authorization: Bearer <access_token>
```

---

# 🔌 API Overview

Example endpoints:

| Method   | Endpoint                  | Description                   |
| -------- | ------------------------- | ----------------------------- |
| `POST`   | `/upload`                 | Upload and process a document |
| `GET`    | `/list`                   | List documents                |
| `GET`    | `/search`                 | Search documents              |
| `GET`    | `/download/{document_id}` | Download a document           |
| `DELETE` | `/delete/{document_id}`   | Delete a document             |
| `DELETE` | `/delete/{document_id}`   | Delete a document             |
| `GET`    | `/chat`                   | Chat                          |

The API is documented automatically through FastAPI/OpenAPI.

---

# 🛡️ Error Handling

DocuMind uses application-level exceptions to separate business errors from infrastructure failures.

Example hierarchy:

```text
DocumentError
│
├── UnsupportedFileTypeError
├── DocumentLoadError
├── DocumentProcessingError
├── DocumentStorageError
└── DocumentRetrievalError
```

These can be mapped to appropriate HTTP responses.

```text
UnsupportedFileTypeError
        ↓
      400

DocumentLoadError
        ↓
      422

DocumentStorageError
        ↓
      500

Unexpected Error
        ↓
      500
```

This approach keeps API routes clean and prevents internal implementation details from leaking into client responses.

---

# 📊 Observability

DocuMind can use **LangSmith** to trace and monitor LLM and LangChain workflows.

This makes it possible to inspect:

* Agent execution
* Tool calls
* Retrieval steps
* LLM calls
* Latency
* Errors
* Prompt/output behavior

This is particularly useful when debugging complex LangGraph workflows.

---

# 🧪 Testing

Run tests with:


---

# 🗺️ Roadmap

## Document Intelligence

* [x] Document upload
* [x] PDF processing
* [x] DOCX processing
* [x] HTML processing
* [x] Document chunking
* [x] Metadata enrichment
* [x] Embedding generation
* [x] Vector storage
* [ ] OCR for images
* [ ] Advanced document parsing
* [ ] Table extraction

## RAG

* [x] Semantic search
* [x] Vector retrieval
* [x] Metadata filtering
* [x] RAG pipeline
* [ ] Hybrid search
* [ ] Reranking
* [ ] Improved context compression
* [ ] Source citations
* [ ] Retrieval evaluation

## AI Agents

* [x] LangGraph workflow
* [x] Router Agent
* [x] Research Agent
* [x] Summarizer Agent
* [x] Action Agent
* [x] Tool calling
* [ ] More specialized agents
* [ ] Human-in-the-loop workflows
* [ ] Advanced agent memory

## User Experience

* [ ] Next.js frontend
* [ ] Conversational chat UI
* [ ] Conversation history
* [ ] Streaming responses
* [ ] Document preview
* [ ] Source highlighting
* [ ] Multilingual interface

## Infrastructure

* [ ] Docker
* [ ] Docker Compose
* [ ] CI/CD
* [ ] AWS deployment
* [ ] Kubernetes
* [ ] ArgoCD
* [ ] Production monitoring

---

# 🔮 Future Vision

The ultimate goal is to transform DocuMind from a **document Q&A application** into an **AI-powered document operating system**.

```text
                         ┌───────────────┐
                         │     User      │
                         └───────┬───────┘
                                 │
                                 ▼
                       ┌──────────────────┐
                       │   AI Assistant   │
                       └────────┬─────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │    LangGraph     │
                       │ Agent Orchestrator│
                       └────────┬─────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
        ┌───────────┐     ┌───────────┐     ┌───────────┐
        │ Research  │     │ Analysis  │     │  Actions  │
        │   Agent   │     │   Agent   │     │   Agent   │
        └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
              │                 │                 │
              ▼                 ▼                 ▼
        ┌───────────┐     ┌───────────┐     ┌───────────┐
        │ Retrieval │     │    LLM    │     │   Tools   │
        │   Tools   │     │           │     │   / APIs  │
        └─────┬─────┘     └───────────┘     └───────────┘
              │
              ▼
        ┌─────────────┐
        │ User's      │
        │ Documents   │
        └─────────────┘
```

The vision is for users to be able to say:

> **"Analyze these contracts, identify the major differences, summarize the risks, and generate a report."**

Instead of simply returning text, DocuMind would orchestrate multiple AI capabilities to complete the entire workflow.

---

# 💡 Why This Project?

DocuMind combines several areas of modern software engineering and AI:

### Full-Stack Engineering

Building APIs, authentication, databases, document processing, and eventually a complete user interface.

### Generative AI

Working with LLMs, prompts, embeddings, context, and generation.

### RAG

Building a knowledge retrieval system that connects LLMs to private data.

### AI Agents

Using LangGraph to create stateful, tool-using agent workflows.

### Backend Architecture

Applying service, repository, schema, and exception-handling patterns.

---

# 📚 Key Concepts Demonstrated

This project demonstrates practical experience with:

* Retrieval-Augmented Generation (RAG)
* Semantic Search
* Vector Databases
* Embeddings
* Document Chunking
* Metadata Filtering
* LLM Integration
* LangChain
* LangGraph
* Langsmith
* Tool Calling
* AI Agent Orchestration
* FastAPI
* REST APIs
* PostgreSQL
* SQLAlchemy
* JWT Authentication
* OAuth2
* Application Exception Handling
* Observability
* Production-oriented Architecture

---

# 🤝 Contributing

Contributions, ideas, issues, and feature requests are welcome.

### 1. Fork the repository

### 2. Create a feature branch

```bash
git checkout -b feature/my-feature
```

### 3. Commit your changes

```bash
git commit -m "feat: add my feature"
```

### 4. Push your branch

```bash
git push origin feature/my-feature
```

### 5. Open a Pull Request

---

# 👨‍💻 Author

## Ousama LASRI

**Full Stack Developer | AI & RAG Engineer**

GitHub:
https://github.com/Oussama-lasri

---

# ⭐ Support

If you find DocuMind interesting, consider giving the repository a ⭐.

---

> **DocuMind — Turn your documents into an intelligent knowledge base.**
