export function isAdmin(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const session = localStorage.getItem('admin_session');
    if (!session) return false;

    const sessionData = JSON.parse(session);
    const loginTime = new Date(sessionData.loginTime);
    const now = new Date();
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

    // Session expires after 8 hours
    if (hoursDiff > 8) {
      localStorage.removeItem('admin_session');
      return false;
    }

    // Check if it's a valid admin email
    const adminEmails = ['chris@meridianluxury.travel', 'reece@nunezdev.com'];
    return adminEmails.includes(sessionData.email);
  } catch {
    return false;
  }
}

export function getAdminEmails(): string[] {
  return ['chris@meridianluxury.travel', 'reece@nunezdev.com'];
}

export function getAdminEmail(): string {
  return 'chris@meridianluxury.travel';
}

export function isUserAdmin(userEmail?: string): boolean {
  if (!userEmail) return false;
  return getAdminEmails().includes(userEmail);
}