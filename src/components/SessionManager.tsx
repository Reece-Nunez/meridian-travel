'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import SessionTimeoutDialog from './SessionTimeoutDialog';

interface SessionManagerProps {
  timeout?: number; // in minutes
  warningTime?: number; // in minutes
}

export default function SessionManager({ 
  timeout = 30, // 30 minutes default
  warningTime = 2 // 2 minutes warning default
}: SessionManagerProps) {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleWarning = () => {
    // Dialog will show automatically via isWarningActive state
  };

  const handleTimeout = () => {
    router.push('/auth/signin?message=Session expired. Please sign in again.');
  };

  const handleLogoutNow = async () => {
    await signOut();
    router.push('/auth/signin');
  };

  const {
    timeLeft,
    isWarningActive,
    extendSession
  } = useSessionTimeout({
    timeout: timeout * 60 * 1000, // convert to milliseconds
    warningTime: warningTime * 60 * 1000, // convert to milliseconds
    onWarning: handleWarning,
    onTimeout: handleTimeout
  });

  return (
    <SessionTimeoutDialog
      isOpen={isWarningActive}
      timeLeft={timeLeft}
      onExtendSession={extendSession}
      onLogout={handleLogoutNow}
    />
  );
}