import { useState, useEffect } from "react";
import { API_URL } from "./config.js";

// Small helper: calls the backend and attaches the JWT token if we have one.
async function api(path, method = "GET", body, token) {
  const res = await fetch(API_URL + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

export default function App() {
  // Login state is kept in localStorage so refresh doesn't log you out.
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userName, setUserName] = useState(localStorage.getItem("name"));

  const saveLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("name", data.name);
    setToken(data.token);
    setUserName(data.name);
  };
  const logout = () => {
    localStorage.clear();
    setToken(null);
  };

  return (
    <div className="page">
      <header>
        <h1>Secure Task Manager</h1>
        {token && (
          <div>
            Hi, {userName} <button onClick={logout}>Logout</button>
          </div>
        )}
      </header>
      <main>
        {token ? <Tasks token={token} onLogout={logout} /> : <AuthForm onLogin={saveLogin} />}
      </main>
      <footer>Divija Sheth | KU ID: 23BSCS11</footer>
    </div>
  );
}

// ---------- Login / Register ----------
function AuthForm({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api(isRegister ? "/api/auth/register" : "/api/auth/login", "POST", form);
      onLogin(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <form className="card auth" onSubmit={submit}>
      <h2>{isRegister ? "Create account" : "Login"}</h2>
      {isRegister && <input name="name" placeholder="Name" value={form.name} onChange={change} required />}
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={change} required />
      <input name="password" type="password" placeholder="Password (min 6)" value={form.password} onChange={change} required />
      {error && <p className="error">{error}</p>}
      <button disabled={loading}>{loading ? "Please wait..." : isRegister ? "Register" : "Login"}</button>
      <p className="link" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Already have an account? Login" : "New here? Register"}
      </p>
    </form>
  );
}

// ---------- Task list ----------
function Tasks({ token, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("");
  const [newTask, setNewTask] = useState({ title: "", priority: "medium", dueDate: "" });
  const [error, setError] = useState("");

  // GET tasks (re-runs whenever the filter changes)
  const load = async () => {
    try {
      setTasks(await api("/api/tasks" + (filter ? "?status=" + filter : ""), "GET", null, token));
    } catch (err) {
      if (err.message === "Invalid token") onLogout();
      setError(err.message);
    }
  };
  useEffect(() => { load(); }, [filter]);

  // POST create
  const add = async (e) => {
    e.preventDefault();
    try {
      await api("/api/tasks", "POST", newTask, token);
      setNewTask({ title: "", priority: "medium", dueDate: "" });
      load();
    } catch (err) { setError(err.message); }
  };

  // PUT update (status change or edit title)
  const update = async (id, changes) => {
    await api("/api/tasks/" + id, "PUT", changes, token);
    load();
  };

  // DELETE
  const remove = async (id) => {
    await api("/api/tasks/" + id, "DELETE", null, token);
    load();
  };

  const edit = (t) => {
    const title = prompt("Edit task title", t.title);
    if (title && title.trim()) update(t._id, { title });
  };

  return (
    <>
      <form className="card add" onSubmit={add}>
        <input placeholder="New task..." value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
        <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
        <button>Add Task</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="filters">
        {[["", "All"], ["todo", "To Do"], ["in-progress", "In Progress"], ["done", "Done"]].map(([v, label]) => (
          <button key={v} className={filter === v ? "active" : ""} onClick={() => setFilter(v)}>{label}</button>
        ))}
      </div>

      {tasks.length === 0 && <p className="empty">No tasks here yet.</p>}
      {tasks.map((t) => (
        <div className={"card task " + t.status} key={t._id}>
          <div>
            <strong>{t.title}</strong>
            <div className="meta">
              <span className={"badge " + t.priority}>{t.priority}</span>
              {t.dueDate && <span> Due: {new Date(t.dueDate).toLocaleDateString()}</span>}
            </div>
          </div>
          <div className="actions">
            <select value={t.status} onChange={(e) => update(t._id, { status: e.target.value })}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <button onClick={() => edit(t)}>Edit</button>
            <button className="danger" onClick={() => remove(t._id)}>Delete</button>
          </div>
        </div>
      ))}
    </>
  );
}
