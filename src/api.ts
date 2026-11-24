import type { ProjectDetail, ProjectOut, SchemaIR, VersionOut } from "./types";

const BASE = "http://localhost:8000";

export function getToken(): string | null {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  } catch {
    /* storage not available */
  }
}

// The server sends UTC times without a "Z", so add it before showing them.
export function when(s: string): string {
  return new Date(s.endsWith("Z") ? s : s + "Z").toLocaleString();
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const r = await fetch(`${BASE}${path}`, { ...init, headers });

  if (r.status === 401 && !path.startsWith("/auth/")) {
    setToken(null);
    window.location.href = "/login";
  }
  if (!r.ok) {
    let msg = "Something went wrong. Try again.";
    try {
      const d = await r.json();
      msg = Array.isArray(d.detail) ? (d.detail[0]?.msg ?? msg) : (d.detail ?? msg);
    } catch {
      /* the server did not send JSON */
    }
    throw new Error(msg);
  }
  return r;
}

// ----- accounts -----
export async function login(email: string, password: string): Promise<string> {
  const r = await request("/auth/login", { method: "POST", body: new URLSearchParams({ username: email, password }) });
  return (await r.json()).access_token;
}

export async function register(email: string, password: string): Promise<string> {
  const r = await request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return (await r.json()).access_token;
}

// ----- projects -----
export async function listProjects(): Promise<ProjectOut[]> {
  return (await request("/projects")).json();
}

export async function getProject(id: string): Promise<ProjectDetail> {
  return (await request(`/projects/${id}`)).json();
}

export async function createProject(name: string, dialect: string, file: File): Promise<ProjectDetail> {
  const form = new FormData();
  form.append("name", name);
  form.append("dialect", dialect);
  form.append("file", file);
  return (await request("/projects", { method: "POST", body: form })).json();
}

export async function createCsvProject(name: string, files: File[]): Promise<ProjectDetail> {
  const form = new FormData();
  form.append("name", name);
  files.forEach((f) => form.append("files", f));
  return (await request("/projects/csv", { method: "POST", body: form })).json();
}

export async function deleteProject(id: number): Promise<void> {
  await request(`/projects/${id}`, { method: "DELETE" });
}

export async function saveIr(id: number, ir: SchemaIR, note: string): Promise<ProjectDetail> {
  const r = await request(`/projects/${id}/ir`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ir, note }),
  });
  return r.json();
}

// ----- versions and report -----
export async function listVersions(id: string): Promise<VersionOut[]> {
  return (await request(`/projects/${id}/versions`)).json();
}

export async function restoreVersion(id: number, number: number): Promise<ProjectDetail> {
  return (await request(`/projects/${id}/versions/${number}/restore`, { method: "POST" })).json();
}

export async function downloadReport(id: number, name: string): Promise<void> {
  const r = await request(`/projects/${id}/report`);
  const url = URL.createObjectURL(await r.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}_report.md`;
  a.click();
  URL.revokeObjectURL(url);
}