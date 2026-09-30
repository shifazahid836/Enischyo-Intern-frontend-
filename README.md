# 🧑‍💻 TechJobs — Tech Job Board (Frontend)

A complete, professional, **responsive Tech Job Board frontend** built with
**React + Vite**, now fully connected to the **secure Job Board REST API**
(Node + Express + MongoDB) that lives in the sibling `../backend` folder.

This is not a mock-up any more: accounts are real, passwords are hashed with
bcrypt on the server, sessions are real JWTs, jobs come out of MongoDB, and the
UI changes according to the role stored on your account.

> 🔗 **Backend repo:** <https://github.com/shifazahid836/Enischyo-Intern-backend>
> 🔗 **Frontend repo:** <https://github.com/shifazahid836/Enischyo-Intern-frontend->

---

## ✨ Features

- 🏠 **Home page** listing **real, active jobs** from `GET /jobs?isActive=true`
- 🔍 **Server-side search** — the search box hits `GET /jobs?keyword=…`
  (debounced 350 ms, cancellable requests) with a job-type filter on top
- 📄 **Job details page** — fetched by id, with a company sidebar and an
  application form that posts to `/applications`
- 🔐 **Real authentication** — Register / Login call `/auth/register` and
  `/auth/login`, and the returned JWT is kept in `localStorage`
- 🔁 **Session restore** — on every page load the stored token is re-validated
  with `GET /auth/me`, so a dead token logs you out instead of failing later
- 🎭 **Role-based UI** — employers get **“Post a Job”**, jobseekers get the
  **Apply** button, and nobody sees an action their role cannot perform
- 🆕 **Post a Job** page — employer-only form that publishes straight to
  MongoDB (company picked from a live `GET /companies` list)
- 👤 **Dashboard** — saved jobs, **my applications** (with status), an employer's
  own postings, and a working **change password** form
- ⚠️ **Centralised error handling** — the API's own validation messages are shown
  as-is (`errors[]`), plus friendly states for “backend not running”
- 📱 **Fully responsive** — desktop, laptop, tablet & mobile friendly
- 🧩 Clean, modular, beginner-friendly architecture

---

## 🛠️ Technologies Used

| Technology | Purpose |
| --- | --- |
| [React 18](https://reactjs.org/) | UI library (components, Hooks) |
| [Vite](https://vitejs.dev/) | Dev server (with API proxy) & build tool |
| [React Router DOM v6](https://reactrouter.com/) | Client-side routing |
| **Fetch API** (wrapped) | All HTTP calls — see `src/api/client.js` |
| JavaScript (JSX) | Language (no TypeScript) |
| Standard CSS | Styling with CSS custom properties |

No extra HTTP dependency is needed: `src/api/client.js` wraps the built-in
`fetch` and gives it an Axios-style surface (`api.get/post/put/patch/delete`).

---

## 📁 Project Structure

```
backend/                     # sibling folder — start this FIRST
frontend/
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── api/                 # ← the single HTTP layer
│   │   ├── client.js        # fetch wrapper, token storage, ApiError
│   │   ├── auth.js          # register / login / me / change-password
│   │   ├── jobs.js          # jobs + companies endpoints
│   │   └── applications.js  # apply + list applications
│   │
│   ├── components/
│   │   ├── Navbar.jsx       # Role-aware navigation (Post a Job for employers)
│   │   ├── Footer.jsx
│   │   ├── JobCard.jsx      # Reusable job summary card
│   │   └── AuthForm.jsx     # Reusable auth form (inputs + role <select>)
│   │
│   ├── context/
│   │   └── AuthContext.jsx  # Real JWT auth: login, register, logout, roles
│   │
│   ├── pages/
│   │   ├── Home.jsx         # Live job list + backend search (/)
│   │   ├── JobDetails.jsx   # Job + apply form (/jobs/:id)
│   │   ├── Login.jsx        # POST /auth/login (/login)
│   │   ├── Register.jsx     # POST /auth/register + role picker (/register)
│   │   ├── Dashboard.jsx    # Saved / applied / my postings (/dashboard)
│   │   └── PostJob.jsx      # Employer-only form (/post-job)
│   │
│   ├── utils/
│   │   ├── jobAdapter.js    # MongoDB document → view model
│   │   ├── formErrors.js    # ApiError → readable alert text
│   │   ├── helpers.js       # Formatting (salary, dates, truncation)
│   │   └── jobStorage.js    # localStorage: saved + applied job ids
│   │
│   ├── App.jsx              # Routes + layout + protected routes
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
│
├── index.html
├── .env.example
├── package.json
├── vite.config.js           # Dev proxy: /api → http://localhost:5000
└── README.md
```

---

## 🚀 Installation & Running

You need **both** servers running. Start the backend first.

```bash
# --- terminal 1: the API (port 5000) ---
cd backend
npm install
# make sure .env has a reachable MONGODB_URI and a JWT_SECRET (32+ chars)
npm run seed        # optional: 5 companies, 15 jobs, 4 users, ...
npm run dev

# --- terminal 2: the frontend (port 5173) ---
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

### Why no CORS problems?

`vite.config.js` proxies every `/api/*` request to `http://localhost:5000`, so
the browser only ever talks to the Vite dev server (same origin) and the backend
port stays configured in one place. In production, point the app at the deployed
API instead:

```bash
# frontend/.env
VITE_API_BASE_URL=https://my-job-api.example.com/api
```

### Production build

```bash
npm run build      # output goes to dist/
npm run preview    # preview the production build locally
```

---

## 🔐 How authentication works here

1. **Register / Login** → `POST /auth/register` or `/auth/login` returns
   `{ token, user }`. The token is a signed JWT with a **7-day** expiry.
2. **Storage** → `api/client.js` writes the token to
   `localStorage['techjobs_token']` and the profile to
   `localStorage['techjobs_user']`. That is the “securely stored in
   localStorage” requirement of the assignment.
3. **Every protected request** automatically gets
   `Authorization: Bearer <token>` — no component ever builds that header.
4. **Session restore** → on load, `AuthContext` calls `GET /auth/me`. If the
   token is expired or the account was deleted, the session is cleared and you
   are logged out cleanly.
5. **Dead token anywhere** → any `401` from any request clears the session and
   fires an event that `AuthContext` listens to, so the whole UI logs out at once.
6. **Logout** is local by design: a JWT cannot be revoked server-side without a
   token blacklist.

> ⚠️ **Security note.** `localStorage` is readable by any script on the page, so
> it is safe only as long as the app never renders untrusted HTML. For a
> production app prefer an **httpOnly cookie** (which JavaScript cannot read) or
> a short-lived access token plus a refresh token. The token is never put in the
> URL, and passwords only ever travel in the request body over HTTPS.

---

## 🎭 Role-based UI (mirrors the API rules)

| Action | Who sees it in the UI | API rule enforced on the server |
| --- | --- | --- |
| **Post a Job** link + `/post-job` form | `employer` only | `POST /jobs` → `protect, authorize('employer')` |
| **Apply** button + application form | `jobseeker` only | `POST /applications` → `protect, authorize('jobseeker')` |
| **Delete job** button | the owning employer, or an `admin` | `DELETE /jobs/:id` → owner or admin |
| Change status / delete an application | `admin` only | `PUT`/`DELETE /applications/:id` → `authorize('admin')` |
| View jobs, search, open a job | everyone (public routes) | `GET /jobs`, `GET /jobs/:id` are public |

The frontend never *decides* permissions — it only avoids offering actions that
the API would reject with `403`.

---

## 🔌 API endpoints used

| Method | Endpoint | Used by |
| --- | --- | --- |
| `POST` | `/api/auth/register` | `Register.jsx` |
| `POST` | `/api/auth/login` | `Login.jsx` (rate limited: 5 / 15 min) |
| `GET` | `/api/auth/me` | `AuthContext` (session restore) |
| `PATCH` | `/api/auth/change-password` | `Dashboard.jsx` |
| `GET` | `/api/jobs?keyword=&type=&isActive=` | `Home.jsx`, `Dashboard.jsx` |
| `GET` | `/api/jobs/:id` | `JobDetails.jsx` |
| `POST` | `/api/jobs` | `PostJob.jsx` (employer only) |
| `DELETE` | `/api/jobs/:id` | `JobDetails.jsx` (owner / admin) |
| `GET` | `/api/companies` | `PostJob.jsx` (company picker) |
| `POST` | `/api/applications` | `JobDetails.jsx` (jobseeker only) |
| `GET` | `/api/applications` | `Dashboard.jsx` |

---

## 🧭 Available Routes

| Route | Page | Access |
| --- | --- | --- |
| `/` | Home | public — live jobs + backend search |
| `/jobs/:id` | JobDetails | public — Apply form for job seekers |
| `/login` | Login | public |
| `/register` | Register | public — jobseeker or employer |
| `/dashboard` | Dashboard | **protected** — redirects to `/login` |
| `/post-job` | PostJob | **protected** — employers only |

> Any unknown URL shows a friendly **404** page.

---

## 🔎 Search Examples

The search box calls `GET /jobs?keyword=…&type=…&isActive=true`:

- `React` → jobs whose title **or** description matches “React” (case-insensitive)
- `PostgreSQL` → description matches
- Job type **Remote** → `type=remote`
- Clearing the box → the parameter is dropped and all active jobs come back

---

## 👤 Test accounts (created by `npm run seed` in the backend)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@enischyo.test` | `Admin12345!` |
| Employer | `employer1@enischyo.test` | `Employer12345!` |
| Employer | `employer2@enischyo.test` | `Employer12345!` |
| Job seeker | `jobseeker1@enischyo.test` | `Jobseeker12345!` |

Log in as each one in turn — the navbar, the job details page and the dashboard
change accordingly. You can also register brand-new accounts from `/register`.

---

## 🧠 Notes & known limitations

- **Saved jobs** live in `localStorage` (per browser). The API has no bookmark
  endpoint, so nothing is lost — it is simply a personal, local list.
- **“My applications”** is derived from `GET /applications` filtered by the
  logged-in e-mail, because the API exposes no `GET /applications/me` route.
  That route is public today; a production API should add a protected
  “my applications” endpoint and stop returning everybody's applications.
- The **“applied” flag** used to hide the Apply button twice is stored per
  account (`techjobs_applied_ids:<userId>`), while the applications collection in
  MongoDB stays the source of truth.
- The API has **no `experience` field**, so the UI shows a neutral
  “Not specified” rather than inventing data.
- Tokens issued before a password change stay valid until they expire; the app
  swaps in the fresh token the API returns from `PATCH /auth/change-password`.

---

## 🔮 Future Improvements

- A protected `GET /applications/me` endpoint (removes the client-side filter)
- Employer view of applications received per posting
- Refresh tokens / httpOnly cookie sessions
- Filters for location and salary range, plus pagination
- Resume upload instead of a resume URL
- Automated tests with Vitest + React Testing Library

---

> Built for a full-stack assignment. Company and job data in the database is
> fictional sample data created by `backend/seed.js`.

