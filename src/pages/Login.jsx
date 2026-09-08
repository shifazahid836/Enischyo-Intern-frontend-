import { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Login.jsx
 * ---------
 * Professional login form with client-side validation. Simulates login
 * locally (no backend) and redirects to the dashboard on success.
 */
export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

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
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }
    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const result = login({
      email: formData.email.trim(),
      password: formData.password,
    });

    if (result.success) {
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    } else {
      setFormError(result.error || 'Something went wrong. Please try again.');
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
      subtitle="Log in to your TechJobs account to apply and track jobs."
      fields={fields}
      formData={formData}
      onFieldChange={handleFieldChange}
      onSubmit={handleSubmit}
      buttonText="Login"
      fieldErrors={errors}
      error={formError}
      footer={footer}
    />
  );
}
