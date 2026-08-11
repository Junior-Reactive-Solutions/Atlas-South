import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextValue {
  /**
   * Fetches an admin API endpoint with the Bearer token injected automatically.
   * On a 401, silently attempts one token refresh via the httpOnly cookie before
   * redirecting to /admin/login. Callers never touch localStorage.
   */
  authFetch: (url: string, opts?: RequestInit) => Promise<Response>;
  /**
   * Step 1 of login: email + password only.
   * Returns `{ requiresTotp: true }` if 2FA is enabled — caller should show the
   * TOTP input and call loginWithTotp() to complete the flow.
   * Returns `{ mustChangePassword }` when login is fully complete.
   */
  login: (email: string, password: string) => Promise<
    { requiresTotp: true } | { requiresTotp?: false; mustChangePassword: boolean }
  >;
  /**
   * Step 2 of login (2FA path only): re-submits credentials + TOTP code.
   * Call this only when login() returned `{ requiresTotp: true }`.
   */
  loginWithTotp: (email: string, password: string, totpCode: string) => Promise<{ mustChangePassword: boolean }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  /** true while the initial silent refresh is in flight — suppress redirects until resolved */
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Admin session context — Sprint 8 security hardening.
 *
 * Design decisions:
 *  - Access token lives in React state (tokenRef keeps it readable in closures).
 *    Never touches localStorage, so XSS cannot exfiltrate it.
 *  - Refresh token lives in an httpOnly SameSite=Strict cookie managed by the API.
 *  - On mount, one silent /refresh call restores an existing session so the user
 *    doesn't need to log in again on every page reload.
 *  - authFetch retries once after a 401 (single silent refresh) before giving up
 *    and redirecting to login — transparent to the calling component.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  // tokenRef always holds the current token so authFetch closures don't go stale.
  const tokenRef = useRef<string | null>(null);
  const navigate = useNavigate();

  function applyToken(t: string | null) {
    tokenRef.current = t;
    setIsAuthenticated(!!t);
  }

  /** Exchange the httpOnly refresh-token cookie for a fresh access token. */
  const silentRefresh = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/admin/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        applyToken(null);
        return null;
      }
      const { accessToken } = (await res.json()) as { accessToken: string };
      applyToken(accessToken);
      return accessToken;
    } catch {
      applyToken(null);
      return null;
    }
  }, []);

  // On mount: try to restore session from the refresh-token cookie.
  useEffect(() => {
    silentRefresh().finally(() => setIsAuthLoading(false));
  }, [silentRefresh]);

  const authFetch = useCallback(
    async (url: string, opts: RequestInit = {}): Promise<Response> => {
      const withToken = (token: string | null): RequestInit => ({
        ...opts,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(opts.headers as Record<string, string> | undefined),
        },
      });

      let res = await fetch(url, withToken(tokenRef.current));

      // One silent-refresh on 401 before redirecting to login.
      if (res.status === 401) {
        const newToken = await silentRefresh();
        if (!newToken) {
          navigate('/admin/login');
          return res;
        }
        res = await fetch(url, withToken(newToken));
      }

      return res;
    },
    [silentRefresh, navigate],
  );

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      throw new Error(err.error ?? 'Login failed');
    }
    const data = (await res.json()) as
      | { requiresTotp: true }
      | { accessToken: string; mustChangePassword: boolean };
    if ('requiresTotp' in data && data.requiresTotp) {
      return { requiresTotp: true as const };
    }
    applyToken((data as { accessToken: string }).accessToken);
    return { mustChangePassword: (data as { mustChangePassword: boolean }).mustChangePassword };
  }, []);

  /** Step 2 — only called when login() returns { requiresTotp: true }. */
  const loginWithTotp = useCallback(async (email: string, password: string, totpCode: string) => {
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, totpCode }),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      throw new Error(err.error ?? 'Invalid code');
    }
    const data = (await res.json()) as { accessToken: string; mustChangePassword: boolean };
    applyToken(data.accessToken);
    return { mustChangePassword: data.mustChangePassword };
  }, []);

  const logout = useCallback(async () => {
    applyToken(null);
    // Best-effort: clear the httpOnly refresh-token cookie server-side.
    await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' }).catch(
      () => {/* ignore — token already cleared in memory */},
    );
    navigate('/admin/login');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ authFetch, login, loginWithTotp, logout, isAuthenticated, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
