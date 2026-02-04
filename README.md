# 🧙‍♂️ Volos Codex

**Volos Codex** is an intelligent AI-powered assistant designed for Tabletop RPG players and Game Masters. It leverages **Retrieval-Augmented Generation (RAG)** to provide accurate, context-aware answers based on your own RPG rulebooks. 📚✨

Whether you are playing **D&D 5e**, **D&D 2024**, **Daggerheart**, or **Iron Kingdoms**, Volos Codex helps you find rules, generate ideas, and clarify mechanics instantly by searching through your PDF library. 🎲

---

## 🚀 Features

### 🧠 Context-Aware AI
Volos Codex doesn't just guess; it reads. It uses **local embeddings** to semantically search through your PDF rulebooks, retrieving the exact pages needed to answer your questions accurately.

### 📚 Multi-System Support
The system automatically detects and categorizes your rulebooks based on filenames, supporting multiple RPG systems simultaneously:
- 🐉 **Dungeons & Dragons 5th Edition** (e.g., `dnd5e_phb.pdf`)
- 🆕 **Dungeons & Dragons 2024** (e.g., `dnd2024_phb.pdf`)
- 🗡️ **Daggerheart** (e.g., `daggerheart_core.pdf`)
- ⚙️ **Iron Kingdoms (Reinos de Ferro)** (e.g., `reinos_core.pdf`)

### 💬 Interactive Chat Interface
- **Natural Language Queries:** Ask questions like "How does grappling work?" or "Generate a level 5 goblin encounter."
- **Session History:** Keeps track of your conversations so you can refer back to previous answers.
- **User Authentication:** Secure login (Google Auth) to save your personal chat history.

### 📂 Automatic Indexing
Simply drop your PDF files into the `Books` directory. On startup or request, the system reads, parses, and indexes the content for semantic search.

---

## 🛠️ Tech Stack

- **Backend:** .NET 8 / ASP.NET Core 🖥️
- **Frontend:** React ⚛️
- **AI & Search:** SmartComponents.LocalEmbeddings (Local RAG implementation) 🤖
- **Containerization:** Docker & Docker Compose 🐳

---

## ⚙️ Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/) (Optional, for containerized deployment)

### 📥 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/volos-codex.git
    cd volos-codex
    ```

2.  **Prepare your Books:**
    - Create a folder named `Books` in the root or `VolosCodex.Domain` directory.
    - Add your PDF files. Ensure filenames contain system keywords (e.g., `dnd5e`, `daggerheart`) for auto-detection.

3.  **Run with Docker (Recommended):**
    ```bash
    docker-compose up --build
    ```

4.  **Manual Run:**
    - **Backend:**
      ```bash
      cd VolosCodex.API
      dotnet run
      ```
    - **Frontend:**
      ```bash
      cd volos-codex-front-react
      npm install
      npm start
      ```

---

## 📖 Usage

1.  Open your browser and navigate to the frontend (usually `http://localhost:3000`).
2.  Log in (if authentication is configured) or start a guest session.
3.  Select the **RPG System** you are inquiring about.
4.  Type your question in the chat box.
5.  **Volos Codex** will search your books and generate an answer based on the text found.

---

## 🤝 Contributing

Contributions are welcome! Whether it's adding support for new RPG systems, improving the UI, or optimizing the search algorithms, feel free to open issues or submit pull requests. 🛠️

---

## 📜 License

This project is licensed under the MIT License. 📄

---

*May your rolls be high and your adventures epic!* ⚔️🛡️
