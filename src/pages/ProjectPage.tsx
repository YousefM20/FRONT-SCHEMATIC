import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { downloadReport, getProject, listVersions, restoreVersion, saveIr, when } from "../api";
import SchemaGraph, { ROLE_COLOR } from "../SchemaGraph";
import { ThemeToggle } from "../theme";
import type { ProjectDetail, Table, VersionOut } from "../types";

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [versions, setVersions] = useState<VersionOut[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const loadVersions = useCallback(() => {
    if (id) listVersions(id).then(setVersions).catch(() => setVersions([]));
  }, [id]);

  useEffect(() => {
    if (id) getProject(id).then(setProject).catch((e) => setError(e.message));
    loadVersions();
  }, [id, loadVersions]);

  if (error)
    return (
      <div style={{ padding: 32 }}>
        <p className="error">{error}</p>
        <Link to="/projects">Back to projects</Link>
      </div>
    );
  if (!project) return <p style={{ padding: 32 }}>Loading the schema...</p>;

  const projectId = project.id;
  const projectName = project.name;
  const ir = project.ir;
  const facts = ir.tables.filter((t) => t.role === "fact").length;
  const dims = ir.tables.filter((t) => t.role === "dimension").length;
  const selected = ir.tables.find((t) => t.id === selectedId) ?? null;
  const shown = ir.tables.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));

  function exportJson() {
    const blob = new Blob([JSON.stringify(ir, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName}.schema_ir.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function changeRole(t: Table, role: Table["role"]) {
    if (role === t.role) return;
    const tables = ir.tables.map((x) =>
      x.id === t.id
        ? { ...x, role, role_meta: { origin: "user", confidence: 1, reason: `Changed from ${t.role} to ${role} by the user` } }
        : x,
    );
    setSaving(true);
    setNotice("");
    try {
      setProject(await saveIr(projectId, { ...ir, tables }, `Changed ${t.name} to ${role}`));
      loadVersions();
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function restore(number: number) {
    setSaving(true);
    setNotice("");
    try {
      setProject(await restoreVersion(projectId, number));
      loadVersions();
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pp">
      <header className="bar">
        <Link to="/projects">← Projects</Link>
        <h1>{projectName}</h1>
        <div className="legend">
          <span><i style={{ background: ROLE_COLOR.fact }} />Fact</span>
          <span><i style={{ background: ROLE_COLOR.dimension }} />Dimension</span>
          <span><i style={{ background: ROLE_COLOR.bridge }} />Bridge</span>
        </div>
        <button className="btn small ghost" onClick={() => downloadReport(projectId, projectName).catch((e) => setNotice(e.message))}>
          Download report
        </button>
        <button className="btn small ghost" onClick={exportJson}>Export JSON</button>
        <ThemeToggle />
      </header>

      <div className="pp-body">
        <div className="canvas">
          <SchemaGraph ir={ir} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        <aside className="side">
          {notice && <p className="error">{notice}</p>}
          <div className="stats">
            <div className="stat"><b>{ir.tables.length}</b><span>Tables</span></div>
            <div className="stat"><b>{ir.relationships.length}</b><span>Relationships</span></div>
            <div className="stat"><b>{facts}</b><span>Fact tables</span></div>
            <div className="stat"><b>{dims}</b><span>Dimension tables</span></div>
          </div>

          <section>
            <h2>Tables</h2>
            <input className="search" type="search" placeholder="Search tables" value={query} onChange={(e) => setQuery(e.target.value)} />
            <ul className="tlist" style={{ marginTop: 10 }}>
              {shown.map((t) => (
                <li key={t.id}>
                  <button className={`tbtn${t.id === selectedId ? " on" : ""}`} onClick={() => setSelectedId(t.id)}>
                    <span className="dot" style={{ background: ROLE_COLOR[t.role] }} />
                    {t.name}
                  </button>
                </li>
              ))}
              {shown.length === 0 && <li className="empty">No table matches "{query}".</li>}
            </ul>
          </section>

          <section>
            {selected ? (
              <div className="detail">
                <div className="detail-head" style={{ background: ROLE_COLOR[selected.role] }}>
                  <h3>{selected.name}</h3>
                  <small>{selected.role} table, {selected.columns.length} columns</small>
                </div>
                <label className="role-edit">
                  Role
                  <select value={selected.role} disabled={saving} onChange={(e) => changeRole(selected, e.target.value as Table["role"])}>
                    <option value="fact">Fact</option>
                    <option value="dimension">Dimension</option>
                    <option value="bridge">Bridge</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </label>
                {selected.role_meta.reason && (
                  <p>
                    Why: {selected.role_meta.reason}
                    {selected.role_meta.confidence != null && ` (confidence ${Math.round(selected.role_meta.confidence * 100)}%)`}
                  </p>
                )}
                <ul className="cols">
                  {selected.columns.map((c) => (
                    <li key={c.id}>
                      <span>{c.name}</span>
                      <em>{c.original_type ?? c.logical_type}{c.nullable ? "" : " · required"}</em>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="empty">Click a table in the graph or in the list to see its columns and change its role.</div>
            )}
          </section>

          <section>
            <h2>Version history</h2>
            <ul className="ver-list">
              {versions.map((v, i) => (
                <li key={v.number}>
                  <div>
                    <b>Version {v.number}</b> {i === 0 && <span className="badge live">Current</span>}
                    <small>{v.note}</small>
                    <small>{when(v.created_at)}</small>
                  </div>
                  {i > 0 && (
                    <button className="btn small ghost" disabled={saving} onClick={() => restore(v.number)}>Restore</button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}