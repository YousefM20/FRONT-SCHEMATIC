import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Counter, Reveal } from "../ui";
import { TEAM } from "../data";

type Kind = "fact" | "dim";
type DemoTable = { id: string; x: number; y: number; fks: number; kind: Kind };

const TABLES: DemoTable[] = [
  { id: "customer", x: 10, y: 18, fks: 0, kind: "dim" },
  { id: "film", x: 330, y: 18, fks: 0, kind: "dim" },
  { id: "store", x: 10, y: 238, fks: 0, kind: "dim" },
  { id: "staff", x: 330, y: 238, fks: 0, kind: "dim" },
  { id: "rental", x: 170, y: 128, fks: 4, kind: "fact" },
];

function why(t: DemoTable) {
  return t.kind === "fact"
    ? `${t.id} points to ${t.fks} other tables (customer, film, store and staff). A table that references two or more others records events, so Schematic marks it as a fact table.`
    : `${t.id} has no foreign keys of its own, and other tables point to it. It describes something (who, what or where), so Schematic marks it as a dimension table.`;
}

const STEPS = [
  { title: "Upload", text: "Drop in a SQL file with your CREATE TABLE statements. PostgreSQL, MySQL and SQL Server are supported." },
  { title: "Parse", text: "sqlglot reads every table, column, key and foreign key, then the backend turns them into one shared format." },
  { title: "Classify", text: "Each table becomes a fact, dimension or bridge table, with a confidence score and a written reason." },
  { title: "Review", text: "Open the schema as a graph, check the labels, and export your warehouse design." },
];

const FEATURES = [
  { title: "Fact and dimension detection", text: "Every table gets a role and a reason you can read, so nothing is a black box.", live: true },
  { title: "Interactive schema graph", text: "Tables, columns and relationships laid out automatically, with a details panel for each table.", live: true },
  { title: "SQL file upload", text: "Upload a dump and get a stored, versioned schema back in about a second.", live: true },
  { title: "CSV upload", text: "No database? Upload CSV files. Schematic guesses the types, keys and relationships.", live: true },
  { title: "AI suggestions you control", text: "An LLM proposes new tables and columns. Every answer is validated before it touches your schema.", live: false },
  { title: "DDL and dbt export", text: "Generate the warehouse as SQL scripts and dbt models, ready for your team.", live: false },
];

const IR_SAMPLE = `{
  "id": "t_rental",
  "name": "rental",
  "role": "fact",
  "role_meta": {
    "origin": "inferred",
    "confidence": 0.5,
    "reason": "placeholder rule: 2+ foreign keys = fact"
  },
  "primary_key": ["c_rental_rental_id"]
}`;

const STACK = ["FastAPI", "PostgreSQL", "sqlglot", "Pydantic", "SQLAlchemy", "Alembic", "React", "TypeScript", "ReactFlow", "Docker", "GitHub Actions"];

const FAQ = [
  { q: "What is a fact table and a dimension table?", a: "A fact table records events or measurements, like one row per rental. A dimension table describes the things around them, like the customer, the film or the store. A star schema is one fact table in the middle with dimensions around it." },
  { q: "Does Schematic change my database?", a: "No. It only reads the SQL file you upload. Your real database is never touched." },
  { q: "How accurate is the classification?", a: "Right now it uses a simple rule, so every label shows a low confidence score. The team is building a better classifier and measuring it on Pagila, Northwind and AdventureWorks." },
  { q: "Is my data safe?", a: "You upload table definitions, not rows of data. Each project is stored in a PostgreSQL database that runs on your own machine." },
];

export default function Home() {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState("rental");
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const timer = useRef(0);

  function run() {
    window.clearInterval(timer.current);
    setStep(0);
    let n = 0;
    timer.current = window.setInterval(() => {
      n += 1;
      setStep(n);
      if (n >= TABLES.length) window.clearInterval(timer.current);
    }, 550);
  }

  useEffect(() => {
    const first = window.setTimeout(run, 900);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer.current);
    };
  }, []);

  function spotlight(e: MouseEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(IR_SAMPLE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const selected = TABLES.find((t) => t.id === sel)!;
  const selectedDone = TABLES.indexOf(selected) < step;

  return (
    <main>
      <section className="hero" onMouseMove={spotlight}>
        <div className="wrap hero-grid">
          <div>
            <h1>Design a data warehouse from the database you already have.</h1>
            <p className="lead">
              Upload a SQL file. Schematic finds the fact and dimension tables, explains each decision, and draws the schema for you to review.
            </p>
            <div className="hero-cta">
              <Link to="/projects" className="btn big">Upload a SQL file</Link>
              <Link to="/team" className="btn big ghost">Meet the team</Link>
            </div>
            <p className="hero-note">Works with PostgreSQL, MySQL and SQL Server files.</p>
          </div>

          <div className="demo">
            <div className="demo-top">
              <b>Example: a video rental store</b>
              <button className="btn small" onClick={run}>{step >= TABLES.length ? "Run again" : "Run classifier"}</button>
            </div>
            <svg viewBox="0 0 460 300" role="img" aria-label="Example schema with one fact table and four dimension tables">
              {TABLES.filter((t) => t.kind === "dim").map((t) => (
                <line key={t.id} x1={230} y1={150} x2={t.x + 60} y2={t.y + 22} className="sv-line" />
              ))}
              {TABLES.map((t, i) => {
                const done = i < step;
                const cls = `sv ${done ? t.kind : "unknown"}${sel === t.id ? " sel" : ""}`;
                return (
                  <g
                    key={t.id}
                    className={cls}
                    onClick={() => setSel(t.id)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setSel(t.id);
                    }}
                  >
                    <rect x={t.x} y={t.y} width={120} height={44} rx={8} />
                    <text x={t.x + 60} y={t.y + 19} textAnchor="middle" className="sv-name">{t.id}</text>
                    <text x={t.x + 60} y={t.y + 34} textAnchor="middle" className="sv-sub">
                      {done ? (t.kind === "fact" ? "fact" : "dimension") : "unclassified"}
                    </text>
                  </g>
                );
              })}
            </svg>
            <p className="demo-note">
              {selectedDone ? why(selected) : "Press Run classifier, then click any table to see why it got its label."}
            </p>
          </div>
        </div>
      </section>

      <section className="strip">
        <div className="wrap strip-grid">
          <div><b><Counter to={3} /></b><span>Input doors planned: SQL, CSV and text</span></div>
          <div><b><Counter to={3} /></b><span>Benchmark databases for testing</span></div>
          <div><b><Counter to={6} /></b><span>People on the team</span></div>
          <div><b><Counter to={6} /></b><span>Months of work</span></div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal>
            <div className="sec-head">
              <h2>From a SQL file to a warehouse design in four steps</h2>
              <p>The whole pipeline runs on one shared format, so every part of the tool speaks the same language.</p>
            </div>
            <div className="steps">
              {STEPS.map((s, i) => (
                <div className="step" key={s.title}>
                  <span className="step-n">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <Reveal>
            <div className="sec-head">
              <h2>What Schematic does</h2>
              <p>Three features work today. The rest are on the roadmap.</p>
            </div>
            <div className="feat-grid">
              {FEATURES.map((f) => (
                <div className="feat" key={f.title}>
                  <span className={`badge ${f.live ? "live" : "soon"}`}>{f.live ? "Available" : "Planned"}</span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="sec">
        <div className="wrap split">
          <Reveal>
            <div className="sec-head">
              <h2>Every decision carries its reason</h2>
              <p>
                Each table stores who decided its role (the parser, a rule, the AI or you), how sure that decision is, and why. You can check any label before you trust it.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="code">
              <div className="code-top">
                <span>schema_ir.json</span>
                <button onClick={copyCode}>{copied ? "Copied" : "Copy"}</button>
              </div>
              <pre>{IR_SAMPLE}</pre>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <Reveal>
            <div className="sec-head">
              <h2>Built with tools that teams actually use</h2>
            </div>
            <div className="chips">
              {STACK.map((s) => (
                <span className="chip" key={s}>{s}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal>
            <div className="sec-head">
              <h2>The people behind it</h2>
              <p>Six students, six roles, one shared schema format.</p>
            </div>
            <div className="avatars">
              {TEAM.map((m, i) => (
                <Link to="/team" className="mini" key={m.name + i}>
                  <span className="avatar sm" style={{ background: `hsl(${m.hue} 55% 46%)` }}>{m.name[0]}</span>
                  <b>{m.name}</b>
                  <small>{m.role}</small>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap narrow">
          <Reveal>
            <div className="sec-head">
              <h2>Questions people ask</h2>
            </div>
            <div className="faq">
              {FAQ.map((f, i) => (
                <div className={`faq-item${openFaq === i ? " open" : ""}`} key={f.q}>
                  <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}>
                    {f.q}
                    <span>{openFaq === i ? "−" : "+"}</span>
                  </button>
                  <div className="faq-body">
                    <p>{f.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="cta">
            <h2>Try it with your own SQL file</h2>
            <p>It takes about a second to see your first schema.</p>
            <Link to="/projects" className="btn big accent">Upload a SQL file</Link>
          </div>
        </div>
      </section>
    </main>
  );
}