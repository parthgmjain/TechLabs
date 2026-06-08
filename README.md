Hey Luis, here's how to connect the frontend to my backend
Follow this step by step. Don't skip anything. At each step there's a way to check it's working before moving on.
---
Part 1 — Starting the Backend
You need Docker Desktop installed. If you don't have it, download it here: https://www.docker.com/products/docker-desktop
Step 1 — Get the latest code
Before anything else, make sure you have the most recent version of the code. However you normally sync your repo (git pull, fetching from upstream, downloading the latest from GitHub), do that now before moving on.
✅ Check: You have the latest code and no conflicts or errors.
---
Step 2 — Start Docker Desktop
Open Docker Desktop on your computer. Wait until you see it say "Docker is running" (there's a whale icon in your taskbar/menu bar). Don't move on until it's fully loaded.
✅ Check: The whale icon in your taskbar is not animating anymore — it's just sitting still.
---
Step 3 — Start the backend
In your terminal, navigate to the root of the project (not inside frontend or backend, the main folder):
```bash
cd path/to/the/project
```
Then run:
```bash
docker-compose up --build
```
This will take a few minutes the first time. A lot of text will scroll by — that's normal. Wait until you see this line appear:
```
backend-1  | INFO:     Uvicorn running on http://0.0.0.0:8000
```
✅ Check: Open your browser and go to `http://localhost:8000`. You should see:
```json
{
  "status": "Backend is running!",
  "graph_engine_loaded": true,
  "content_engine_loaded": true
}
```
If you see that, the backend is working. If not, send me a screenshot of the terminal and I'll fix it.
---
How to stop the backend
Press `CTRL + C` in the terminal where Docker is running.
How to restart the backend (after pulling new code)
```bash
docker-compose down && docker-compose up --build
```
---
Part 2 — Connecting the Frontend
Step 1 — Add the backend URL to your project
In your frontend folder, look for a file called `.env`. If it doesn't exist, create it. Add this line to it:
```
VITE_API_URL=http://localhost:8000
```
✅ Check: The file is saved and sits inside your `frontend` folder, not inside `src`.
---
Step 2 — Create `api.js`
Inside your `src` folder, create a new file called `api.js`. Paste this entire block into it and save:
```js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Gets program recommendations from a student's interests query
export async function getRecommendations(query) {
  const response = await fetch(`${API_URL}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: query,
      k: 3,
      graph_weight: 0.6,
    }),
  });

  if (!response.ok) {
    throw new Error("Something went wrong with the recommendation request.");
  }

  return await response.json();
}

// Saves a student profile to the backend
export async function saveStudentProfile(profile) {
  const response = await fetch(`${API_URL}/api/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error("Something went wrong saving the student profile.");
  }

  return await response.json();
}
```
✅ Check: Open your browser console (press F12, click the Console tab) and paste this:
```js
fetch("http://localhost:8000/")
  .then(r => r.json())
  .then(console.log)
```
You should see the backend status object printed. If you see a red error instead, the backend isn't running — go back to Part 1.
---
Step 3 — Start the frontend
Open a new terminal window (keep the Docker one running). Go into the frontend folder:
```bash
cd frontend
npm install
npm run dev
```
After it starts, the terminal will tell you the exact URL to open. It will say something like:
```
  ➜  Local:   http://localhost:5173/
```
The port number might be different on your machine — just use whatever it says in your terminal.
✅ Check: Open that URL in your browser and your React app loads.
---
Step 4 — Use the recommendation function in your component
⚠️ Important: The import path below (`"../api"`) assumes your component file is inside a subfolder of `src` like `src/components/`. If your component is directly inside `src/`, change the import to `"./api"`. Adjust the path to match where your file actually is.
```jsx
import { useState } from "react";
import { getRecommendations } from "../api"; // ← adjust this path if needed

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecommendations(query);
      setResults(data.recommendations);
    } catch (err) {
      setError("Could not reach the backend. Is Docker running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="What do you want to study?"
      />
      <button onClick={handleSearch}>
        {loading ? "Loading..." : "Find Programs"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {results.map((r) => (
          <li key={r.program_id}>
            {r.program_id} — Score: {r.score}
          </li>
        ))}
      </ul>
    </div>
  );
}
```
✅ Check: Type something in the input, click the button, and you should see 3 programs appear. Open F12 → Console if nothing shows up.
---
Step 5 — Save a student profile
⚠️ Same as above — adjust the import path to match where your file is.
```jsx
import { saveStudentProfile } from "../api"; // ← adjust this path if needed

const handleSave = async () => {
  const profile = {
    id: "student_005",
    name: "Luis Garcia",
    school: "Some Gymnasium",
    year: "Y2",
    gpa: 8.5,
    interest_tags: "Programming, AI, Systems",
    target_programme_1: "UNI-IT_OG_OEKONOMI_DIPLOMINGENIOER",
    motivation_quote: "I want to build cool things",
    what_you_want: "Tech & engineering",
  };

  const result = await saveStudentProfile(profile);
  console.log(result.message);
};
```
Replace the values with whatever the student typed in the form. The `id` field must be unique per student.
✅ Check: Call `handleSave()` once and open F12 → Console. You should see:
```
Profile student_005 created and integrated into graph.
```
---
If something breaks
Problem	What it means	What to do
Docker won't start	Docker Desktop isn't open	Open Docker Desktop, wait for the whale to stop animating
Docker starts but backend errors out	Something wrong with your Docker setup	This is a local machine issue — you'll need to troubleshoot Docker on your end
`Failed to fetch`	Backend is not running	Make sure Docker is running and you see the Uvicorn line in the terminal
Red CORS error in console	Wrong URL being used	Make sure you're using `http://localhost:8000` exactly
Port 8000 already in use	Something else is on that port	You'll need to free up port 8000 on your machine
Import error for `api.js`	Wrong file path in the import	Read the ⚠️ note in Step 4 and adjust the path
Nothing appears after search	Fetch worked but results empty	Check F12 → Console for errors
---
Quick reference
What	How
Start backend	`docker-compose up --build` from root project folder
Stop backend	`CTRL + C` in the Docker terminal
Restart backend	`docker-compose down && docker-compose up --build`
Start frontend	`npm run dev` from the frontend folder
Frontend URL	Check your terminal — it'll tell you the exact port
Backend URL	Always `http://localhost:8000`
