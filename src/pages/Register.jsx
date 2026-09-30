import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { describeError } from '../utils/formErrors.js';

/**
 * Register.jsx
 * ------------
 * Creates a real account with POST /auth/register.
 *
 * Two things worth pointing out:
 *   • `fullName` (the label the UI shows) is sent as `name`, which is what the
 *     User model expects — the API contract wins over the old mock wording;
 *   • the role picker is NOT cosmetic: it is stored on the account and decides
 *     what the user can do later (an employer may post jobs, a jobseeker may
 *     apply). The backend accepts only 'jobseeker' and 'employer' here and
 *     rejects 'admin', so those are the only options offered.
 *
 * A successful registration returns a JWT immediately, so the user is logged
 * in and lands on the dashboard without a second step.
 */
export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'jobseeker',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Send them to the dashboard.
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const fields = [
    {
      name: 'fullName',
      label: 'Full name',
      type: 'text',
      placeholder: 'e.g. Ayesha Khan',
      autoComplete: 'name',
    },
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
      placeholder: 'Create a password',
      autoComplete: 'new-password',
      hint: 'At least 8 characters.',
    },
    {
      name: 'confirmPassword',
      label: 'Confirm password',
      type: 'password',
      placeholder: 'Re-enter your password',
      autoComplete: 'new-password',
    },
    {
      name: 'role',
      label: 'I am joining as',
      type: 'select',
      options: [
        { value: 'jobseeker', label: 'Job seeker — I want to apply for jobs' },
        { value: 'employer', label: 'Employer — I want to post jobs' },
      ],
      hint: 'This decides what you can do: employers post jobs, job seekers apply.',
    },
  ];

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setFormError('');
  };

  const validate = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    } else if (formData.fullName.trim().length < 3) {
      errors.fullName = 'Full name must be at least 3 characters.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      // The API requires 8 characters (12 salt rounds of bcrypt are applied to
      // it server-side — the password never travels or is stored as plain text).
      errors.password = 'Password must be at least 8 characters.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setFormError('');

    try {
      await register({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      navigate('/dashboard', { replace: true });
    } catch (error) {
      // 409 = that e-mail is taken, 400 = the field list from the API.
      setFormError(
        describeError(error, 'Registration failed. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <p>
      Already have an account?{' '}
      <Link to="/login" className="auth-link">
        Login here
      </Link>
    </p>
  );

  return (
    <AuthForm
      title="Create your account"
      subtitle="Join TechJobs to apply for roles or to publish your own job openings."
      fields={fields}
      formData={formData}
      onFieldChange={handleFieldChange}
      onSubmit={handleSubmit}
      buttonText="Register"
      busy={submitting}
      fieldErrors={fieldErrors}
      error={formError}
      footer={footer}
    />
  );
}
