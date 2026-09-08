/**
 * AuthForm.jsx
 * ------------
 * Reusable, presentational authentication form used by both the Login and
 * Register pages. It renders the given fields as controlled inputs and
 * delegates validation/submission to the parent page.
 *
 * Props:
 *  - title, subtitle : card heading text
 *  - fields          : array of { name, label, type, placeholder, autoComplete }
 *  - formData        : object holding the current input values
 *  - onFieldChange   : (event) => void — parent updates its state
 *  - onSubmit        : (event) => void — parent handles validation/login
 *  - buttonText      : label for the submit button
 *  - fieldErrors     : object mapping field name -> error message
 *  - error / success : optional alert strings
 *  - footer          : React node (e.g. link to the other auth page)
 */
export default function AuthForm({
  title,
  subtitle,
  fields,
  formData,
  onFieldChange,
  onSubmit,
  buttonText,
  fieldErrors = {},
  error,
  success,
  footer,
}) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-heading">
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}
        {success && <div className="alert alert-success" role="status">{success}</div>}

        <form onSubmit={onSubmit} noValidate>
          {fields.map((field) => (
            <div className="form-group" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                className={fieldErrors[field.name] ? 'input-error' : ''}
                value={formData[field.name] || ''}
                onChange={onFieldChange}
              />
              {fieldErrors[field.name] && (
                <span className="field-error">{fieldErrors[field.name]}</span>
              )}
            </div>
          ))}

          <button type="submit" className="btn btn-primary btn-block">
            {buttonText}
          </button>
        </form>

        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  );
}
