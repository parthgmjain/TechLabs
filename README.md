# Admission Guidance Platform

## Prerequisites

Install the following before starting:

* Git
* Node.js (v18+ recommended)
* npm
* Docker Desktop

Verify installation:

```bash
node -v
npm -v
docker --version
git --version
```

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-folder>
```

Or pull the latest changes:

```bash
git pull origin main
```

---

## 2. Run the Backend

### Start Docker Desktop

Wait until Docker is fully running.

### Start Backend Services

From the project root:

```bash
docker-compose up --build
```

Wait until you see:

```text
INFO: Uvicorn running on http://0.0.0.0:8000
```

### Verify Backend

Open:

```text
http://localhost:8000
```

Expected response:

```json
{
  "status": "Backend is running!",
  "graph_engine_loaded": true,
  "content_engine_loaded": true
}
```

### Stop Backend

```bash
CTRL + C
```

### Restart Backend

```bash
docker-compose down
docker-compose up --build
```

---

## 3. Configure Frontend

Inside the frontend folder create a `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

---

## 4. Run the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown in the terminal:

```text
http://localhost:5173
```

(Port may vary.)

---

## Project Structure

```text
project-root/
│
├── backend/
├── frontend/
│   ├── src/
│   ├── public/
│   └── .env
│
├── docker-compose.yml
└── README.md
```

---

## Common Commands

### Backend

```bash
docker-compose up --build
docker-compose down
```

### Frontend

```bash
npm install
npm run dev
npm run build
```

---

## Troubleshooting

### Backend not reachable

Ensure Docker is running and backend is available at:

```text
http://localhost:8000
```

### Failed to fetch

Check:

```env
VITE_API_URL=http://localhost:8000
```

### Dependency issues

Reinstall packages:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Port already in use

Close the application using the port or change the port configuration.

---

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS

### Backend

* FastAPI
* Docker
* Uvicorn

---

Happy coding 🚀
