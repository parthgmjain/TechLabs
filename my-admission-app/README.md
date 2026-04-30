🇩🇰 READ ME: Getting Started (Quick Start)
Hey guys! Here is the step-by-step to get the project running on your computer. Follow this exactly and you’ll be ready to code in 5 minutes.

1. Download Docker Desktop
Docker is the "engine" that runs our app.

Download Docker Desktop

Run it: open up docker thengo to the root folder in this case "my-admission-app" then run this command docker compose up --build in the terminal

2. Launch the Project
Open the project folder in VS Code, open a Terminal, and type this one command:

Bash
docker compose up
Wait a minute for it to load. Once the text stops scrolling, the site is "live" on your machine.

3. Where to see your work
Our project is split into two halves. Open your browser and go to these links:

FRONTEND (Designers/UI): http://localhost:5173

Go here to see the buttons, colors, and layout.

BACKEND (Data/AI): http://localhost:8000/docs

Go here to see the data and the "brain" of the app.

4. How to see your changes
You don't need to restart anything to see your work.

If you're Frontend: Edit files in the /frontend/src folder. The moment you Save (Cmd+S / Ctrl+S), your changes will show up instantly at the link above.

If you're Backend: Edit files in the /backend folder. When you Save, the "brain" updates itself automatically.

5. To Stop the Site
If you want to turn it off, just go to your terminal in VS Code and press:
Ctrl + C

Common Fix: If you see an error saying "executable not found," just run docker compose up --build instead. It fixes 99% of problems.