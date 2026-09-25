# Secure Task Management Application (Full Stack)

Divija Sheth | KU ID: 23BSCS11

**Stack:** React (Hooks) + Vite, Node.js, Express, MongoDB (Mongoose), JWT, bcrypt

## Features
- Register / Login with JWT authentication (passwords hashed with bcrypt)
- Create, view, edit, delete tasks (GET, POST, PUT, DELETE)
- Task status updates (To Do / In Progress / Done) and priority + due date
- Filter tasks by status
- Each user sees only their own tasks

## API
| Method | Route | Purpose |
|---|---|---|
| POST | /api/auth/register | create account |
| POST | /api/auth/login | login, returns JWT |
| GET | /api/tasks?status= | list (filter) my tasks |
| POST | /api/tasks | create task |
| PUT | /api/tasks/:id | update task / status |
| DELETE | /api/tasks/:id | delete task |

## Run locally
```
cd server && npm install && (create .env from .env.example) && npm start
cd client && npm install && npm run dev
```
