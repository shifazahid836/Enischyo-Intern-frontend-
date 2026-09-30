import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as authApi from '../api/auth.js';
import {
  UNAUTHORIZED_EVENT,
  clearSession,
  getStoredUser,
  getToken,
  saveSession,
} from '../api/client.js';

/**
 * AuthContext.jsx
 * ---------------
 * The single source of truth for "who is logged in?" — now backed by the real
 * API instead of fake browser-only accounts.
 *
 * What it does:
 *   • login() / register() call POST /auth/login or /auth/register, then keep
 *     the returned JWT + profile (the token itself is written to localStorage
 *     by api/client.js, which also attaches it to every later request);
 *   • on mount it re-validates the stored token with GET /auth/me, so an
 *     expired token (or an account deleted by an admin) cannot leave the UI
 *     stuck in a "logged in, but every request fails" state;
 *   • a 401 coming back from ANY request wipes the session and logs the user
 *     out here as well;
 *   • `role` drives the conditional UI: employers get "Post a Job",
 *     jobseekers get "Apply".
 *
 * `loading` stays true until the stored token has been checked. Protected
 * routes wait for it — otherwise a page refresh would bounce the user to
 * /login for a split second before /auth/me had answered.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  // --- (1) re-validate the stored token once, on mount ----------------------
  useEffect(() => {
    let cancelled = false; // prevents a setState after the component unmounts

    const token = getToken();

    if (!token) {
      // Nothing stored → this is simply a logged-out visitor.
      clearSession();
      setUser(null);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    authApi
      .me()
      .then((profile) => {
        if (cancelled) return;
        // The token is valid: prefer the FRESH profile from the server over
        // the cached copy, so a role change made by an admin takes effect.
        setUser(profile);
        saveSession({ token, user: profile });
      })
      .catch(() => {
        // Expired/tampered token, deleted account, or the API is unreachable.
        if (cancelled) return;
        clearSession();
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // --- (2) log out when the API rejects the token ---------------------------
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  // --- (3) the actions ------------------------------------------------------
  /**
   * Logs in and stores the session.
   *
   * Throws an ApiError carrying the backend's message (wrong credentials,
   * "too many login attempts" after 5 tries, …) — the pages catch it and show
   * it in their alert box, which is why this is `async` instead of returning
   * a `{ success, error }` object like the old mock version did.
   */
  const login = useCallback(async ({ email, password }) => {
    const session = await authApi.login({ email, password });
    saveSession(session);
    setUser(session.user);
    return session.user;
  }, []);

  /**
   * Creates an account. `role` is 'jobseeker' or 'employer' — the backend
   * refuses 'admin' during public registration.
   */
  const register = useCallback(async ({ name, email, password, role }) => {
    const session = await authApi.register({ name, email, password, role });
    saveSession(session);
    setUser(session.user);
    return session.user;
  }, []);

  /**
   * Logs out locally. A JWT cannot be "revoked" server-side without a token
   * blacklist, so discarding the token IS the logout: every protected request
   * will now be answered with 401.
   */
  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  /**
   * Changes the password and stores the FRESH token the API returns, because
   * tokens issued before the change stay valid until they expire.
   */
  const changePassword = useCallback(async ({ oldPassword, newPassword }) => {
    const session = await authApi.changePassword({ oldPassword, newPassword });
    saveSession(session);
    setUser(session.user);
    return session.user;
  }, []);

  // --- (4) the context value ------------------------------------------------
  const value = useMemo(() => {
    const role = user?.role ?? null;

    return {
      user,
      role,
      loading,
      isAuthenticated: Boolean(user),
      // Role helpers keep the conditional rendering in the components readable:
      //   {isEmployer && <PostJobButton />}
      isEmployer: role === 'employer',
      isJobseeker: role === 'jobseeker',
      isAdmin: role === 'admin',
      login,
      register,
      logout,
      changePassword,
    };
  }, [user, loading, login, register, logout, changePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to read the current auth context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>.');
  }
  return context;
}
