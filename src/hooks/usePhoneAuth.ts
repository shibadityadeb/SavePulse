import { useRef, useState, useCallback } from 'react';
import { authService, PhoneAuthError, PhoneAuthErrorCode } from '@/src/services/authService';

export interface UsePhoneAuthState {
  phoneNumber: string;
  otp: string;
  step: 'phone' | 'otp';
  loading: boolean;
  error: string | null;
  errorCode: PhoneAuthErrorCode | null;
}

export interface UsePhoneAuthReturn extends UsePhoneAuthState {
  setPhoneNumber: (phone: string) => void;
  setOtp: (code: string) => void;
  sendOTP: () => Promise<void>;
  verifyOTP: () => Promise<void>;
  resetError: () => void;
  reset: () => void;
  recaptchaRef: React.RefObject<any>;
}

/**
 * Custom hook for phone authentication with OTP
 * Manages state, error handling, and side effects
 *
 * @returns UsePhoneAuthReturn with auth methods and state
 *
 * @example
 * const {
 *   phoneNumber,
 *   setPhoneNumber,
 *   otp,
 *   setOtp,
 *   step,
 *   loading,
 *   error,
 *   sendOTP,
 *   verifyOTP,
 * } = usePhoneAuth();
 */
export function usePhoneAuth(): UsePhoneAuthReturn {
  const recaptchaRef = useRef(null);

  const [state, setState] = useState<UsePhoneAuthState>({
    phoneNumber: '',
    otp: '',
    step: 'phone',
    loading: false,
    error: null,
    errorCode: null,
  });

  const setPhoneNumber = useCallback((phone: string) => {
    setState((prev) => ({ ...prev, phoneNumber: phone }));
  }, []);

  const setOtp = useCallback((code: string) => {
    setState((prev) => ({ ...prev, otp: code }));
  }, []);

  const resetError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null, errorCode: null }));
  }, []);

  const sendOTP = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null, errorCode: null }));

      await authService.sendOTP(state.phoneNumber, recaptchaRef.current);

      setState((prev) => ({
        ...prev,
        step: 'otp',
        loading: false,
      }));
    } catch (err) {
      if (err instanceof PhoneAuthError) {
        setState((prev) => ({
          ...prev,
          error: err.message,
          errorCode: err.code,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: 'An unexpected error occurred',
          errorCode: PhoneAuthErrorCode.UNKNOWN_ERROR,
          loading: false,
        }));
      }
    }
  }, [state.phoneNumber]);

  const verifyOTP = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null, errorCode: null }));

      await authService.verifyOTP(state.otp);

      setState((prev) => ({
        ...prev,
        loading: false,
        // Reset form after successful verification
        phoneNumber: '',
        otp: '',
        step: 'phone',
      }));
      // Success handled by parent component
    } catch (err) {
      if (err instanceof PhoneAuthError) {
        setState((prev) => ({
          ...prev,
          error: err.message,
          errorCode: err.code,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: 'An unexpected error occurred',
          errorCode: PhoneAuthErrorCode.UNKNOWN_ERROR,
          loading: false,
        }));
      }
    }
  }, [state.otp]);

  const reset = useCallback(() => {
    setState({
      phoneNumber: '',
      otp: '',
      step: 'phone',
      loading: false,
      error: null,
      errorCode: null,
    });
    authService.clearConfirmationResult();
  }, []);

  return {
    ...state,
    setPhoneNumber,
    setOtp,
    sendOTP,
    verifyOTP,
    resetError,
    reset,
    recaptchaRef,
  };
}

export default usePhoneAuth;
