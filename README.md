
# 🧠 Local ChatGPT-Style App with Ollama (Gemma 2B)

A full-stack ChatGPT-style app that runs locally using open-source LLMs via [Ollama](https://ollama.com), built with Next.js, Node.js, Prisma, and PostgreSQL.

---

## 🚀 Features

- ✅ ChatGPT-style UI with streaming response
- ✅ Chat history stored in PostgreSQL
- ✅ "New Chat", auto-title, and session view
- ✅ Ollama integration with `gemma:2b` model
- ✅ Interrupt generation with "Stop" button
- ✅ Clean, minimal UI with Tailwind CSS
- ✅ Local-only setup (no external APIs)

---

## 🧱 Tech Stack

| Layer      | Technology            |
|------------|------------------------|
| Frontend   | Next.js + React + Tailwind CSS |
| Backend    | Node.js + Express      |
| LLM        | Ollama with `gemma:2b` |
| Database   | PostgreSQL (via Prisma) |
| ORM        | Prisma ORM             |
| Styling    | Tailwind CSS           |

---

## 📁 Project Structure

```
project/
├── app/                 # Next.js App Router
├── backend/             # Node.js + Express backend
├── components/          # React components
├── prisma/              # Prisma schema & migrations
├── .env                 # Environment config
├── package.json         # Scripts & dependencies
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repo

```bash
git clone <your-repo-url>
cd project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup PostgreSQL

Make sure PostgreSQL is installed and running on your system.

Create a new database:

```sql
CREATE DATABASE localchat;
```

Update your `.env`:

```env
DATABASE_URL="postgresql://postgres:<your_password>@localhost:5432/localchat"
```

### 4. Run Prisma Migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

---

## 🧠 Run Ollama (Gemma 2B)

Make sure Ollama is installed. Then run:

```bash
ollama run gemma:2b
```

> If not installed, get it here: https://ollama.com/download

---

## ▶️ Start the App

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: PostgreSQL (view via pgAdmin)

---

## 🧪 Development Tips

- Chats and messages are stored persistently in PostgreSQL
- You don’t need to rerun `prisma migrate` unless the schema changes
- PostgreSQL runs as a service: only start manually if it doesn’t auto-start
- Use pgAdmin to view or query tables (`Chat`, `Message`)

---

## 🐛 Known Issues

- Ollama startup may be slow the first time
- Stream interruption ("Stop" button) works only mid-generation

---

## 📸 Screenshots

> Chat UI, Sidebar, and History stored in PostgreSQL via Prisma.
> <img width="1919" height="962" alt="image" src="https://github.com/user-attachments/assets/e2da06cf-abac-41d1-9c80-26f9e004ed83" />
> <img width="1919" height="958" alt="image" src="https://github.com/user-attachments/assets/fcb5ea1e-6d55-4d68-82b6-0edcd55048f2" />





> https://github.com/user-attachments/assets/ebde4683-d7b3-4962-9a4a-b6ca1daaa549








---

## 📦 Credits

- [Gemma Model by Google](https://ai.google.dev/gemma)
- [Ollama](https://ollama.com)
- [Next.js](https://nextjs.org)
- [Prisma](https://www.prisma.io)

---

## 📄 License

MIT License
