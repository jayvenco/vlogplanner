import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ChecklistPage from "./pages/ChecklistPage";
import VideoPlanner from "./pages/VideoPlanner";
import Tips from "./pages/Tips";
import Ideas from "./pages/Ideas";
import Templates from "./pages/Templates";
import Trends from "./pages/Trends";
import Inspirations from "./pages/Inspirations";
import Tasks from "./pages/Tasks";
import Diary from "./pages/Diary";
import Settings from "./pages/Settings";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p style={{ padding: "2rem" }}>...</p>;
  if (!user) return <Navigate to="/inloggen" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/inloggen" element={<Login />} />
      <Route path="/registreren" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/projecten"
        element={
          <PrivateRoute>
            <Projects />
          </PrivateRoute>
        }
      />
      <Route
        path="/projecten/:id"
        element={
          <PrivateRoute>
            <ProjectDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/checklist"
        element={
          <PrivateRoute>
            <ChecklistPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/video-planner"
        element={
          <PrivateRoute>
            <VideoPlanner />
          </PrivateRoute>
        }
      />
      <Route
        path="/ideeen"
        element={
          <PrivateRoute>
            <Ideas />
          </PrivateRoute>
        }
      />
      <Route
        path="/templates"
        element={
          <PrivateRoute>
            <Templates />
          </PrivateRoute>
        }
      />
      <Route
        path="/trends"
        element={
          <PrivateRoute>
            <Trends />
          </PrivateRoute>
        }
      />
      <Route
        path="/inspiratie"
        element={
          <PrivateRoute>
            <Inspirations />
          </PrivateRoute>
        }
      />
      <Route
        path="/taken"
        element={
          <PrivateRoute>
            <Tasks />
          </PrivateRoute>
        }
      />
      <Route
        path="/tips"
        element={
          <PrivateRoute>
            <Tips />
          </PrivateRoute>
        }
      />
      <Route
        path="/dagboek"
        element={
          <PrivateRoute>
            <Diary />
          </PrivateRoute>
        }
      />
      <Route
        path="/instellingen"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
