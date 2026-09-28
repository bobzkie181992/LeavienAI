import { useState, useEffect, useRef, useCallback } from 'react';
import { logAltTabViolation, isMobileDevice } from '../lib/violationLogger';
import { getIntegritySettings } from '../lib/integritySettings';
import { playWarningSound } from '../utils/audioEffects';
import { AltTabViolationLog } from '../types';

export interface UseAcademicIntegrityMonitorOptions {
  isActive: boolean;
  userUid?: string;
  assessmentType: 'Diagnostic' | 'Formative' | 'Summative';
  assessmentTitle: string;
  currentQuestionNumber?: number;
  currentQuestionText?: string;
  initialViolations?: number;
  onViolationDetected?: (newViolationCount: number, log: AltTabViolationLog) => void;
}

export function useAcademicIntegrityMonitor({
  isActive,
  userUid,
  assessmentType,
  assessmentTitle,
  currentQuestionNumber,
  currentQuestionText,
  initialViolations = 0,
  onViolationDetected
}: UseAcademicIntegrityMonitorOptions) {
  const [violationCount, setViolationCount] = useState<number>(initialViolations);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [lastViolationLog, setLastViolationLog] = useState<AltTabViolationLog | null>(null);

  const isAwayRef = useRef<boolean>(false);
  const awayStartTimeRef = useRef<number>(0);
  const lastViolationTimeRef = useRef<number>(0);

  // Sync initialViolations if changed from outside
  useEffect(() => {
    if (initialViolations > 0 && violationCount === 0) {
      setViolationCount(initialViolations);
    }
  }, [initialViolations]);

  const recordViolation = useCallback(() => {
    const now = Date.now();
    // Debounce: prevent duplicate count if multiple events fire within 1200ms
    if (now - lastViolationTimeRef.current < 1200) {
      return;
    }
    lastViolationTimeRef.current = now;

    const timeAway = awayStartTimeRef.current > 0 
      ? Math.max(1, Math.round((now - awayStartTimeRef.current) / 1000))
      : 3;

    setViolationCount(prev => {
      const nextCount = prev + 1;
      
      let log: AltTabViolationLog | null = null;
      if (userUid) {
        const isMobile = isMobileDevice();
        const reason = isMobile 
          ? "Mobile App Switch / Backgrounded (Switched to external app, home screen or another tab)"
          : "System Desktop / Windows Task Switch (Alt+Tab or Window Blur)";

        log = logAltTabViolation(
          userUid,
          assessmentType,
          assessmentTitle,
          currentQuestionNumber,
          currentQuestionText,
          timeAway,
          reason
        );
        setLastViolationLog(log);
      }

      try {
        playWarningSound();
      } catch (e) {}

      setShowWarningModal(true);

      if (onViolationDetected && log) {
        onViolationDetected(nextCount, log);
      }

      return nextCount;
    });
  }, [userUid, assessmentType, assessmentTitle, currentQuestionNumber, currentQuestionText, onViolationDetected]);

  useEffect(() => {
    if (!isActive) {
      isAwayRef.current = false;
      awayStartTimeRef.current = 0;
      return;
    }

    const handleUserLeft = () => {
      if (!isAwayRef.current) {
        isAwayRef.current = true;
        awayStartTimeRef.current = Date.now();
      }
    };

    const handleUserReturned = () => {
      if (isAwayRef.current) {
        recordViolation();
        isAwayRef.current = false;
        awayStartTimeRef.current = 0;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleUserLeft();
      } else {
        handleUserReturned();
      }
    };

    const handleBlur = () => {
      handleUserLeft();
    };

    const handleFocus = () => {
      handleUserReturned();
    };

    const handlePageHide = () => {
      handleUserLeft();
    };

    const handlePageShow = () => {
      handleUserReturned();
    };

    // Attach all cross-platform listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [isActive, recordViolation]);

  const deductionRate = getIntegritySettings().violationDeductionPoints;
  const totalDeductionPoints = violationCount * deductionRate;

  const calculateDeductedScore = useCallback((rawScore: number): number => {
    return Math.max(0, rawScore - totalDeductionPoints);
  }, [totalDeductionPoints]);

  const dismissWarning = useCallback(() => {
    setShowWarningModal(false);
  }, []);

  const resetViolations = useCallback(() => {
    setViolationCount(0);
    setShowWarningModal(false);
    setLastViolationLog(null);
  }, []);

  return {
    violationCount,
    showWarningModal,
    dismissWarning,
    lastViolationLog,
    deductionRate,
    totalDeductionPoints,
    calculateDeductedScore,
    resetViolations
  };
}
