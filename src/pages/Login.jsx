import { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { describeError } from '../utils/formErrors.js';

/**
 * Login.jsx
 * ---------
 * Posts the credentials to POST /auth/login through AuthContext.
 *
 * On success the JWT is stored in localStorage by the API client and the user
 * is sent to the page they came from (`location.state.from`, set by the
 * "log in before applying" link on the job details page) or to the dashboard.
 *
 * On failure the message from the backend is shown as-is — it already says
 * things like "Invalid email or password." or, after five tries in fifteen
 * minutes, "Too many login attempts. Try again in 15 minutes."
 */
export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Send them to the dashboard.
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const fields = [
    {
      name: 'email',
      label: 'Email address',
      type: 'email',
      placeholder: 'you@example.com',
      autoComplete: 'email',
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
      autoComplete: 'current-password',
    },
  ];

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear individual + general errors as the user types.
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setFormError('');
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      // The API requires at least 8 characters (it used to be 6 in the mock
      // version), so checking here first saves a pointless round trip.
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setFormError('');

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      // 401 (wrong credentials), 429 (rate limited) or a network failure.
      setFormError(describeError(error, 'Login failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <p>
      Don&rsquo;t have an account?{' '}
      <Link to="/register" className="auth-link">
        Register here
      </Link>
    </p>
  );

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Log in to your TechJobs account to apply for jobs and track them."
      fields={fields}
      formData={formData}
      onFieldChange={handleFieldChange}
      onSubmit={handleSubmit}
      buttonText="Login"
      busy={submitting}
      fieldErrors={errors}
      error={formError}
      footer={footer}
    />
  );
}
