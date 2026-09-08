import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import JobDetails from './pages/JobDetails.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { useAuth } from './context/AuthContext.jsx';

/**
 * Scrolls the window back to the top whenever the route changes.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Wraps a route and redirects unauthenticated users to /login.
 */
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/**
 * Simple 404 fallback for unknown URLs.
 */
function NotFound() {
  return (
    <div className="container section-pad">
      <div className="empty-state">
        <div className="empty-icon" aria-hidden="true">&#129300;</div>
        <h3>404 — Page not found</h3>
        <p>The page you are looking for doesn&rsquo;t exist or has moved.</p>
        <Link to="/" className="btn btn-primary">
          &#8592; Go to Home
        </Link>
      </div>
    </div>
  );
}

/**
 * App.jsx
 * -------
 * Root component: renders the layout (Navbar + routed content + Footer).
 */
export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
