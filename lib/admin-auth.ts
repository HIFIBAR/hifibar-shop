'use client';

export function setAdminSession(email: string, id: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_session', JSON.stringify({ email, id, timestamp: Date.now() }));
  }
}

export function getAdminSession() {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem('admin_session');
  if (!session) return null;

  try {
    const parsed = JSON.parse(session);
    const hoursSinceLogin = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
    if (hoursSinceLogin > 24) {
      clearAdminSession();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_session');
  }
}

export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null;
}
