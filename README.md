# 🧑‍💻 TechJobs — Tech Job Board (Frontend)

A complete, professional, **responsive Tech Job Board frontend** built with
**React + Vite**. Users can browse tech jobs, search them in real time, view
full job details, save jobs, apply to jobs, and create a local account.

> ⚠️ **Frontend-only project.** There is **no backend and no database** — all
> job data is mocked in `src/mockData.js` and user actions are simulated with
> React state + `localStorage`.

---

## ✨ Features

- 🏠 **Home page** with a prominent search bar and a responsive grid of `JobCard`s
- 🔍 **Live search** — filters by job title, company, keywords, skills, and
  description (case-insensitive), with a friendly *"No jobs found"* state
- 📄 **Job details page** — title, company, location, type, salary, experience,
  full description, responsibilities, required skills, company info, plus an
  **Apply** button
- 🔐 **Login & Register** pages with clean professional forms and client-side
  validation (password confirmation, email format, required fields)
- 👤 **User dashboard** — welcome message, profile summary, saved & applied jobs,
  and account information
- ⭐ **Save / Apply** actions persisted in `localStorage` and reflected on the
  dashboard
- 📱 **Fully responsive** — desktop, laptop, tablet & mobile friendly
- 🧩 Clean, modular, beginner-friendly component architecture

---

## 🛠️ Technologies Used

| Technology | Purpose |
| --- | --- |
| [React 18](https://reactjs.org/) | UI library (components, Hooks) |
| [Vite](https://vitejs.dev/) | Fast dev server & build tool |
| [React Router DOM v6](https://reactrouter.com/) | Client-side routing |
| JavaScript (JSX) | Language (no TypeScript) |
| Standard CSS | Styling with CSS custom properties |

---

## 📁 Project Structure

```
tech-job-board/frontend/
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx        # Responsive top navigation
│   │   ├── Footer.jsx        # Site-wide footer
│   │   ├── JobCard.jsx       # Reusable job summary card
│   │   └── AuthForm.jsx      # Reusable auth form shell (Login/Register)
│   │
│   ├── context/
│   │   └── AuthContext.jsx   # Simulated auth (context + localStorage)
│   │
│   ├── pages/
│   │   ├── Home.jsx          # Job list + search (/)
│   │   ├── JobDetails.jsx    # Single job details (/jobs/:id)
│   │   ├── Login.jsx         # Login form (/login)
│   │   ├── Register.jsx      # Register form (/register)
│   │   └── Dashboard.jsx     # User dashboard (/dashboard)
│   │
│   ├── utils/
│   │   ├── helpers.js        # Formatting helpers
│   │   └── jobStorage.js     # localStorage helpers for saved/applied jobs
│   │
│   ├── mockData.js           # 12 realistic mock tech jobs
│   ├── App.jsx               # Routes + layout
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Installation

Make sure you have [Node.js](https://nodejs.org/) (v18+) installed, then:

```bash
# 1. Go to the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Vite will start the app (usually at `http://localhost:5173`) and open it in
your browser automatically.

### Production build

```bash
npm run build      # output goes to dist/
npm run preview    # preview the production build locally
```

---

## 🧭 Available Routes

| Route | Page | Description |
| --- | --- | --- |
| `/` | Home | Browse + search all jobs |
| `/jobs/:id` | JobDetails | Full details of one job (e.g. `/jobs/1`) |
| `/login` | Login | Log in (simulated locally) |
| `/register` | Register | Create an account (simulated locally) |
| `/dashboard` | Dashboard | Protected user dashboard |

> Any unknown URL shows a friendly **404** page.

---

## 🔎 Search Examples

Typing in the Home search bar filters live:

- `React` → shows jobs mentioning **React** in title, description, or keywords
- `Node.js` → shows matching backend/Node.js roles
- `Remote` → shows remote roles
- Leave it empty → shows **all** jobs

---

## 👤 Login / Register Behaviour

Because there is **no backend**:

- **Register** saves the account into `localStorage` and logs you straight in.
- **Login** matches a registered email/password; otherwise any well-formed
  credentials create a temporary **guest session** so the demo always works.
- **Saved** and **Applied** jobs are also stored in `localStorage` and shown on
  the dashboard.
- The dashboard route is **protected** — visiting it while logged out redirects
  to `/login`.

---

## 🔮 Future Improvements

- Add a real REST API + database (see the sibling `../backend` scaffold)
- Real authentication with JWT / OAuth
- Job filtering by type, location, and experience
- Pagination for large job lists
- Resume upload & richer application flow
- Employer/recruiter portals to post jobs
- Notifications & email alerts for saved searches
- Unit tests with Vitest / React Testing Library

---

> Built for a frontend-only assignment. All companies and jobs are fictional.
