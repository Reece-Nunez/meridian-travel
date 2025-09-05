'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseSessionTimeoutOptions {
  timeout: number; // in milliseconds
  warningTime: number; // in milliseconds before timeout
  onWarning: () => void;
  onTimeout: () => void;
  excludeEvents?: string[];
}

interface SessionTimeoutReturn {
  timeLeft: number;
  isWarningActive: boolean;
  extendSession: () => void;
  resetTimer: () => void;
}

export function useSessionTimeout({
  timeout = 30 * 60 * 1000, // 30 minutes default
  warningTime = 2 * 60 * 1000, // 2 minutes warning default
  onWarning,
  onTimeout,
  excludeEvents = []
}: UseSessionTimeoutOptions): SessionTimeoutReturn {
  const { user, signOut } = useAuth();
  const [timeLeft, setTimeLeft] = useState(timeout);
  const [isWarningActive, setIsWarningActive] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();
    setTimeLeft(timeout);
    setIsWarningActive(false);

    // Start countdown interval
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1000));
    }, 1000);

    // Set warning timer
    warningRef.current = setTimeout(() => {
      setIsWarningActive(true);
      onWarning();
    }, timeout - warningTime);

    // Set timeout timer
    timeoutRef.current = setTimeout(async () => {
      setIsWarningActive(false);
      clearTimers();
      await signOut();
      onTimeout();
    }, timeout);
  }, [timeout, warningTime, onWarning, onTimeout, signOut, clearTimers]);

  const resetTimer = useCallback(() => {
    if (user) {
      startTimers();
    }
  }, [user, startTimers]);

  const extendSession = useCallback(() => {
    setIsWarningActive(false);
    resetTimer();
  }, [resetTimer]);

  // Activity event listeners
  const handleActivity = useCallback(() => {
    if (user && !isWarningActive) {
      resetTimer();
    }
  }, [user, isWarningActive, resetTimer]);

  // Handle tab visibility changes
  const handleVisibilityChange = useCallback(() => {
    if (!document.hidden && user && !isWarningActive) {
      // Tab became visible again, reset timer
      resetTimer();
    }
  }, [user, isWarningActive, resetTimer]);

  useEffect(() => {
    if (!user) {
      clearTimers();
      setIsWarningActive(false);
      return;
    }

    // Start initial timer
    startTimers();

    // Activity events to reset timer
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ].filter(event => !excludeEvents.includes(event));

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimers();
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, handleActivity, handleVisibilityChange, excludeEvents, startTimers, clearTimers]);

  return {
    timeLeft,
    isWarningActive,
    extendSession,
    resetTimer
  };
}