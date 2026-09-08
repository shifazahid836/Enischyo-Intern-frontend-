import { createContext, useContext, useEffect, useState } from 'react';

/**
 * AuthContext.jsx
 * ---------------
 * Simulates authentication locally using React state + localStorage.
 * There is NO real backend: accounts are stored in the browser only.
 */

const AuthContext = createContext(null);

const USERS_KEY = 'techjobs_users';
const CURRENT_USER_KEY = 'techjobs_current_user';

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readCurrentUser);

  // Keep the current session in sync with localStorage.
  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [user]);

  /**
   * Register a new account locally. Returns { success, error? }.
   */
  const register = ({ fullName, email, password }) => {
    const users = readUsers();
    const emailExists = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      return {
        success: false,
        error: 'An account with this email already exists. Please log in.',
      };
    }

    const newUser = {
      id: Date.now(),
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      joinedAt: new Date().toISOString().slice(0, 10),
    };

    users.push(newUser);
    saveUsers(users);
    setUser({
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      joinedAt: newUser.joinedAt,
    });

    return { success: true };
  };

  /**
   * Simulate a login. Registered users are matched by email + password.
   * To keep the demo usable without signing up first, any other
   * well-formed credentials create a temporary "guest" session.
   */
  const login = ({ email, password }) => {
    const users = readUsers();
    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existing && existing.password === password) {
      setUser({
        id: existing.id,
        fullName: existing.fullName,
        email: existing.email,
        joinedAt: existing.joinedAt,
      });
      return { success: true };
    }

    const guestName =
      email.split('@')[0].replace(/[._-]+/g, ' ').trim() || 'Guest';
    const prettyName = guestName.replace(/\b\w/g, (c) => c.toUpperCase());

    setUser({
      id: Date.now(),
      fullName: prettyName,
      email: email.trim(),
      joinedAt: new Date().toISOString().slice(0, 10),
      guest: true,
    });

    return { success: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
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
