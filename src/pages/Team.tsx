import { useRef, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "../ui";
import { TEAM, type Member } from "../data";

function TiltCard({ m }: { m: Member }) {
  const ref = useRef<HTMLDivElement>(null);

  function move(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
  }

  function leave() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <div className="tcard" ref={ref} onMouseMove={move} onMouseLeave={leave}>
      <span className="avatar" style={{ background: `hsl(${m.hue} 55% 46%)` }}>{m.name[0]}</span>
      <h3>{m.name}</h3>
      <span className="role">{m.role}</span>
      <p>{m.tasks}</p>
    </div>
  );
}

const RULES = [
  { title: "Nobody pushes to main", text: "Every task gets its own branch, and every change is reviewed in a pull request." },
  { title: "One shared format", text: "The schema format is a contract for all six roles, so changing it is a team decision." },
  { title: "Tests on every change", text: "GitHub Actions runs the tests and builds the frontend before anything is merged." },
];

export default function Team() {
  return (
    <main>
      <section className="page-head">
        <div className="wrap">
          <h1>The Schematic team</h1>
          <p className="lead">
            Six students building a tool that designs data warehouses. Each person owns a part of the pipeline and can explain and rewrite it.
          </p>
        </div>
      </section>

      <section className="sec tight">
        <div className="wrap">
          <div className="team-grid">
            {TEAM.map((m, i) => (
              <TiltCard m={m} key={m.name + i} />
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <Reveal>
            <div className="sec-head">
              <h2>How we work</h2>
            </div>
            <div className="rules">
              {RULES.map((r) => (
                <div className="feat" key={r.title}>
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="cta">
            <h2>See what we built</h2>
            <p>Upload a SQL file and watch the schema appear.</p>
            <Link to="/projects" className="btn big accent">Open the app</Link>
          </div>
        </div>
      </section>
    </main>
  );
}