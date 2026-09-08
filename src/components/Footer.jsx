import { Link } from 'react-router-dom';

/**
 * Footer.jsx
 * ----------
 * Simple site-wide footer shown on every page.
 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="brand brand-footer">
            <span className="brand-logo">TJ</span>
            <span className="brand-text">
              Tech<span className="brand-accent">Jobs</span>
            </span>
          </Link>
          <p className="footer-tagline">
            Find your next career in technology. Explore roles from frontend
            to DevOps — all in one place.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Browse Jobs</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Contact</h4>
          <ul className="footer-links">
            <li>hello@techjobs.dev</li>
            <li>Karachi, Pakistan</li>
            <li>+92 300 0000000</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>&copy; {new Date().getFullYear()} TechJobs. All rights reserved.</p>
          <p className="footer-note">Frontend demo — data is mocked, no backend.</p>
        </div>
      </div>
    </footer>
  );
}
