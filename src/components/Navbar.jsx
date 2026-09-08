import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Navbar.jsx
 * ----------
 * Responsive top navigation bar. Collapses into a hamburger menu on
 * smaller screens and adapts its links depending on login state.
 */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    isActive ? 'nav-link active' : 'nav-link';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-logo">TJ</span>
          <span className="brand-text">
            Tech<span className="brand-accent">Jobs</span>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? '\u2715' : '\u2630'}
        </button>

        <nav className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" className={linkClass} end onClick={closeMenu}>
            Home
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={linkClass}
                onClick={closeMenu}
              >
                Dashboard
              </NavLink>
              <span className="nav-user" title={user.email}>
                <span className="nav-user-avatar">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </span>
                {user.fullName?.split(' ')[0]}
              </span>
              <button
                type="button"
                className="nav-link nav-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass} onClick={closeMenu}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-link-cta active' : 'nav-link nav-link-cta'
                }
                onClick={closeMenu}
              >
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
