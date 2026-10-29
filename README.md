# Assignment 7 — Student Management System (MongoDB)

A full-stack Student Management System for Web Technology Practical No. 7. It uses HTML, CSS and browser JavaScript for the frontend, Node.js/Express for the API, Mongoose for schema validation, and MongoDB Atlas for persistent storage.

## Features

- Create, read, update and delete student records (CRUD).
- Mongoose schema validation, unique PRN/email constraints and helpful error responses.
- Search by student name, PRN or email.
- Filter by department and academic year.
- Sort by name, CGPA, year or creation date.
- Server-side pagination (8 records per page).
- Database health endpoint at `/api/health`.
- Environment-based database configuration; `.env` is ignored by Git.

## Requirements

- Node.js 20 or later
- npm
- A MongoDB Atlas account and database user

## Setup

1. Extract the ZIP and open this folder in VS Code.
2. In the terminal, install packages:

   ```powershell
   npm install
   ```

3. Copy `.env.example` to `.env` in the project root. On Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   On macOS/Linux, use `cp .env.example .env`.

4. In MongoDB Atlas, create a cluster and a database user. In **Network Access**, add your current IP for local testing. For a hosted service, add the host's documented outbound IPs if available. Avoid `0.0.0.0/0` except as a temporary, understood risk; if used for a student demo, use a strong database password and remove the rule after testing.
5. In Atlas, select **Connect → Drivers → Node.js**, copy the connection string and replace the placeholder in `.env`. Replace `<db_username>` and `<db_password>` with URL-encoded credentials if they contain reserved characters. Keep the database name `student_management` in the URI. Never commit or share `.env`.
6. Start the app:

   ```powershell
   npm start
   ```

   For auto-restart during development, use `npm run dev`.
7. Open `http://localhost:3000` in your browser. The sidebar should report **Connected to MongoDB**.
8. Confirm the API health response at `http://localhost:3000/api/health`. Expected JSON includes `"status":"ok"` and `"database":"connected"`.

## MongoDB schema

Collection: `students`

| Field | Type | Rules |
|---|---|---|
| `fullName` | String | Required, trimmed, 2–80 characters |
| `prn` | String | Required, uppercase, unique, 3–30 characters |
| `email` | String | Required, lowercase, valid email, unique |
| `department` | String | Required; one of the listed departments |
| `year` | Number | Required; integer-like enum value 1–4 |
| `cgpa` | Number | Required; 0–10 |
| `createdAt`, `updatedAt` | Date | Added automatically by Mongoose timestamps |

MongoDB also creates `_id` for each document.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Server/database health |
| GET | `/api/students` | List, search, filter, sort and paginate |
| GET | `/api/students/:id` | Read one student |
| POST | `/api/students` | Create a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |

Query examples:

- `GET /api/students?q=aarya`
- `GET /api/students?department=Computer%20Engineering`
- `GET /api/students?year=3`
- `GET /api/students?sortBy=cgpa&order=desc`
- `GET /api/students?page=2&limit=8`
- Combine filters, e.g. `/api/students?department=Computer%20Engineering&year=3&sortBy=cgpa&order=desc`

## Deployment overview

1. Push this project to a GitHub repository **without `.env`**.
2. Deploy the Node app to a Node-compatible host such as Render. Set the start command to `npm start`.
3. Add `MONGODB_URI` and (optionally) `PORT` under the host's environment-variable settings. Do not put credentials in source code.
4. Keep the `public` directory alongside `server.js`; Express serves the frontend and API from the same deployed service, so the same URL hosts both.
5. After deployment, verify `/api/health`, then add and edit a test student through the live UI. Keep the service and database available until marks are published.

Deployment providers can change their dashboard labels and free-tier limits; follow the current provider UI if it differs.

## Submission hygiene

- Do not include `node_modules/` or `.env` in the ZIP.
- Include `.env.example`, this README, the source code and your PDF report separately.
- Take genuine screenshots from your running application and Atlas collection. Do not use sample or fabricated screenshots as proof.
- Add your actual name, PRN, division/batch, GitHub URL and deployed URL to the report.

## Testing checklist

- [ ] Create a student with valid values.
- [ ] Read the record in the table and Atlas collection.
- [ ] Update name or CGPA and verify the change.
- [ ] Delete the test record and verify it is absent.
- [ ] Search by name, PRN and email.
- [ ] Filter by department and year.
- [ ] Sort CGPA descending and name ascending.
- [ ] Navigate to the next page with more than eight records.
- [ ] Try an invalid email, CGPA outside 0–10, missing required field and duplicate PRN/email.
- [ ] Verify the deployed app and `/api/health`.
