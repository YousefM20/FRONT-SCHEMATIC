import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./theme";
import { useAuth } from "./auth";

function Brand() {
  return (
    <Link to="/" className="brand">
      <span className="brand-mark">
        <span />
        <span />
        <span />
      </span>
      Schematic
    </Link>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const { pathname } = useLocation();
  const { loggedIn, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
      setShowTop(window.scrollY > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? "active" : "");
  const logout = () => {
    signOut();
    navigate("/");
  };

  return (
    <>
      <div className="progress" style={{ width: `${progress}%` }} />
      <header className="nav">
        <div className="wrap nav-in">
          <Brand />
          <nav className={`links${open ? " open" : ""}`}>
            <NavLink to="/" end className={linkClass}>Home</NavLink>
            <NavLink to="/team" className={linkClass}>Team</NavLink>
            <NavLink to="/projects" className={linkClass}>Projects</NavLink>
            {!loggedIn && <NavLink to="/login" className="only-mobile">Log in</NavLink>}
            {loggedIn && <button className="only-mobile linkbtn" onClick={logout}>Log out</button>}
          </nav>
          <div className="nav-right">
            <ThemeToggle />
            {loggedIn ? (
              <button className="btn small ghost nav-cta" onClick={logout}>Log out</button>
            ) : (
              <>
                <Link to="/login" className="btn small ghost nav-cta">Log in</Link>
                <Link to="/register" className="btn small nav-cta">Sign up</Link>
              </>
            )}
            <button className="burger" onClick={() => setOpen((o) => !o)} aria-label="Open the menu" aria-expanded={open}>
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <Outlet />

      <footer className="foot">
        <div className="wrap foot-grid">
          <div>
            <Brand />
            <p className="foot-text">
              Schematic turns an operational database into a data warehouse design that you can review, edit and export.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <Link to="/">Home</Link>
            <Link to="/team">Team</Link>
            <Link to="/projects">Projects</Link>
          </div>
          <div>
            <h4>Built with</h4>
            <span>FastAPI and PostgreSQL</span>
            <span>React and ReactFlow</span>
            <span>sqlglot and Pydantic</span>
          </div>
        </div>
        <div className="wrap foot-bottom">Capstone project, 2026. Made by the Schematic team.</div>
      </footer>

      <button
        className={`totop${showTop ? " show" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        ↑
      </button>
    </>
  );
}