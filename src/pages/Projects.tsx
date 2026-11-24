import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createCsvProject, createProject, deleteProject, listProjects, when } from "../api";
import type { ProjectOut } from "../types";

type Mode = "sql" | "csv";

export default function Projects() {
  const [projects, setProjects] = useState<ProjectOut[]>([]);
  const [mode, setMode] = useState<Mode>("sql");
  const [name, setName] = useState("");
  const [dialect, setDialect] = useState("postgres");
  const [files, setFiles] = useState<File[]>([]);
  const [over, setOver] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    listProjects().then(setProjects).catch((e) => setError(e.message));
  }, []);

  function chooseMode(m: Mode) {
    setMode(m);
    setFiles([]);
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      setError(mode === "sql" ? "Choose a .sql file first." : "Choose at least one .csv file first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const p = mode === "sql" ? await createProject(name, dialect, files[0]) : await createCsvProject(name, files);
      navigate(`/projects/${p.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: ProjectOut) {
    if (!window.confirm(`Delete "${p.name}"? This also deletes its version history.`)) return;
    try {
      await deleteProject(p.id);
      setProjects((list) => list.filter((x) => x.id !== p.id));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <main className="wrap app-page">
      <section>
        <h1>New project</h1>
        <p className="lead">
          Upload a SQL file or a set of CSV files. Schematic finds the fact and dimension tables and draws the schema for you to review.
        </p>

        <form className="upload" onSubmit={onSubmit}>
          <div className="tabs" role="tablist">
            <button type="button" className={mode === "sql" ? "on" : ""} onClick={() => chooseMode("sql")}>SQL file</button>
            <button type="button" className={mode === "csv" ? "on" : ""} onClick={() => chooseMode("csv")}>CSV files</button>
          </div>
          <label className="field">
            Project name
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Video rental store" required />
          </label>
          {mode === "sql" && (
            <label className="field">
              SQL dialect
              <select value={dialect} onChange={(e) => setDialect(e.target.value)}>
                <option value="postgres">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="tsql">SQL Server</option>
                <option value="">Detect automatically</option>
              </select>
            </label>
          )}
          <label
            className={`drop${over ? " over" : ""}${files.length ? " has-file" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              const dropped = Array.from(e.dataTransfer.files);
              setFiles(mode === "sql" ? dropped.slice(0, 1) : dropped);
            }}
          >
            <input
              type="file"
              accept={mode === "sql" ? ".sql" : ".csv"}
              multiple={mode === "csv"}
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
            {files.length ? (
              <>
                <strong>{files.length === 1 ? files[0].name : `${files.length} files selected`}</strong>
                <span>{files.length > 1 ? files.map((f) => f.name).join(", ") : "Click to choose a different file"}</span>
              </>
            ) : (
              <>
                <strong>{mode === "sql" ? "Drop your .sql file here" : "Drop your .csv files here"}</strong>
                <span>{mode === "sql" ? "or click to browse" : "One file per table. Name each file after its table."}</span>
              </>
            )}
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn" disabled={busy}>{busy ? "Analyzing..." : "Analyze database"}</button>
        </form>
      </section>

      <section className="recent">
        <h2>Your projects</h2>
        {projects.length === 0 ? (
          <div className="empty">No projects yet. Upload a file and your first schema will show up here.</div>
        ) : (
          <ul className="recent-list">
            {projects.map((p) => (
              <li key={p.id} className="recent-item">
                <Link className="recent-row" to={`/projects/${p.id}`}>
                  <b>{p.name}</b>
                  <small>{when(p.created_at)}</small>
                </Link>
                <button className="btn small ghost" onClick={() => remove(p)} aria-label={`Delete ${p.name}`}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}