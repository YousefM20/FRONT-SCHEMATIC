import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./theme";
import { AuthProvider, RequireAuth } from "./auth";
import Layout from "./Layout";
import Home from "./pages/Home";
import Team from "./pages/Team";
import AuthPage from "./pages/AuthPage";
import Projects from "./pages/Projects";
import ProjectPage from "./pages/ProjectPage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/team" element={<Team />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/register" element={<AuthPage mode="register" />} />
              <Route path="/projects" element={<RequireAuth><Projects /></RequireAuth>} />
            </Route>
            <Route path="/projects/:id" element={<RequireAuth><ProjectPage /></RequireAuth>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}