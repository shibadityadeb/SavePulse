import {
  signInWithPhoneNumber,
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential,
} from 'firebase/auth/react-native';
import { auth } from './firebase';

/**
 * Phone Authentication Error Types
 */
export enum PhoneAuthErrorCode {
  INVALID_PHONE = 'INVALID_PHONE',
  INVALID_OTP = 'INVALID_OTP',
  OTP_EXPIRED = 'OTP_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  RECAPTCHA_FAILED = 'RECAPTCHA_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom error class for phone auth operations
 */
export class PhoneAuthError extends Error {
  constructor(
    public code: PhoneAuthErrorCode,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'PhoneAuthError';
  }
}

/**
 * Interface for phone auth response
 */
export interface SendOTPResponse {
  success: true;
  confirmationResult: ConfirmationResult;
  message: string;
}

export interface VerifyOTPResponse {
  success: true;
  message: string;
}

/**
 * Phone authentication service
 * Handles OTP sending and verification with proper error handling
 */
class AuthService {
  private confirmationResult: ConfirmationResult | null = null;

  /**
   * Validates phone number format
   * Accepts E.164 format: +[country code][number]
   * Example: +1234567890, +919876543210
   */
  private validatePhoneNumber(phoneNumber: string): boolean {
    // E.164 format validation: +1-15 digits
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Sanitizes phone number by removing spaces and dashes
   * Example: "+1 (234) 567-8900" → "+12345678900"
   */
  private sanitizePhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/[\s\-()]/g, '').trim();
  }

  /**
   * Sends OTP to the provided phone number
   *
   * @param phoneNumber - Phone number in E.164 format or with formatting
   * @param appVerifier - reCAPTCHA verifier from expo-firebase-recaptcha
   * @returns SendOTPResponse with confirmation result
   * @throws PhoneAuthError on failure
   *
   * @example
   * const response = await authService.sendOTP('+1234567890', recaptchaVerifier);
   * // Store response.confirmationResult for use in verifyOTP()
   */
  async sendOTP(
    phoneNumber: string,
    appVerifier: any
  ): Promise<SendOTPResponse> {
    try {
      // Sanitize phone number (remove spaces, dashes, etc.)
      const sanitized = this.sanitizePhoneNumber(phoneNumber);

      // Validate phone number format
      if (!this.validatePhoneNumber(sanitized)) {
        throw new PhoneAuthError(
          PhoneAuthErrorCode.INVALID_PHONE,
          `Invalid phone number format. Use E.164 format: +[country_code][number]. Received: ${phoneNumber}`
        );
      }

      // Verify reCAPTCHA verifier exists
      if (!appVerifier) {
        throw new PhoneAuthError(
          PhoneAuthErrorCode.RECAPTCHA_FAILED,
          'reCAPTCHA verifier not initialized. Ensure reCAPTCHA component is rendered.'
        );
      }

      // Send OTP via Firebase
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        sanitized,
        appVerifier
      );

      // Store confirmation result for later use in verifyOTP
      this.confirmationResult = confirmationResult;

      return {
        success: true,
        confirmationResult,
        message: `OTP sent successfully to ${sanitized}`,
      };
    } catch (error) {
      // Handle Firebase-specific errors
      if (error instanceof PhoneAuthError) {
        throw error;
      }

      const firebaseError = error as any;
      const errorCode = firebaseError?.code;

      // Map Firebase error codes to custom errors
      if (errorCode === 'auth/invalid-phone-number') {
        throw new PhoneAuthError(
          PhoneAuthErrorCode.INVALID_PHONE,
          'The phone number format is invalid.',
          error as Error
        );
      } else if (errorCode === 'auth/quota-exceeded') {
        throw new PhoneAuthError(
          PhoneAuthErrorCode.TOO_MANY_ATTEMPTS,
          'Too many OTP requests. Please try again later.',
          error as Error
        );
      } else if (
        errorCode?.includes('network') ||
        firebaseError?.message?.includes('Network')
      ) {
        throw new PhoneAuthError(
          PhoneAuthErrorCode.NETWORK_ERROR,
          'Network error. Please check your internet connection and try again.',
          error as Error
        );
      } else if (errorCode === 'auth/operation-not-allowed') {
        throw new PhoneAuthError(
          PhoneAuthErrorCode.UNKNOWN_ERROR,
          'Phone authentication is not enabled. Contact support.',
          error as Error
        );
      }

      // Catch-all for unknown errors
      throw new PhoneAuthError(
        PhoneAuthErrorCode.UNKNOWN_ERROR,
        firebaseError?.message || 'Failed to send OTP. Please try again.',
        error as Error
      );
    }
  }

  /**
   * Verifies OTP code sent to user's phone
   *
   * @param code - 6-digit OTP code from SMS
   * @returns VerifyOTPResponse on success
   * @throws PhoneAuthError on failure
   *
   * @example
   * const response = await authService.verifyOTP('123456');
   * // User is now authenticated
   */
  async verifyOTP(code: string): Promise<VerifyOTPResponse> {
    try {
      // Validate code is present
      if (!code || code.trim().length === 0) {
        throw new PhoneAuthError(
          PhoneAuthErrorCode.INVALID_OTP,
          'OTP code is required.'
        );
      }

      // Validate code format (should be numeric)
      if (!/^\d{6}$/.test(code.trim())) {
        throw new PhoneAuthError(
          PhoneAuthErrorCode.INVALID_OTP,
          'OTP must be a 6-digit number.'
        );
      }

      // Check if confirmation result exists
      if (!this.confirmationResult) {
        throw new PhoneAuthError(
          PhoneAuthErrorCode.OTP_EXPIRED,
          'OTP session expired. Please request a new OTP.'
        );
      }

      // Verify OTP code
      const result = await this.confirmationResult.confirm(code.trim());

      // Clear stored confirmation result after successful verification
      this.confirmationResult = null;

      return {
        success: true,
        message: `Phone number verified successfully. User: ${result.user.phoneNumber}`,
      };
    } catch (error) {
      // Handle custom errors
      if (error instanceof PhoneAuthError) {
        throw error;
      }

      const firebaseError = error as any;
      const errorCode = firebaseError?.code;
      const errorMessage = firebaseError?.message;

      // Map Firebase error codes
      if (
        errorCode === 'auth/invalid-verification-code' ||
        errorMessage?.includes('invalid verification code')
      ) {
        throw new PhoneAuthError(
          PhoneAuthErrorCode.INVALID_OTP,
          'Invalid OTP code. Please check and try again.',
          error as Error
        );
      } else if (
        errorCode === 'auth/code-expired' ||
        errorMessage?.includes('expired')
      ) {
        throw new PhoneAuthError(
          PhoneAuthErrorCode.OTP_EXPIRED,
          'OTP has expired. Please request a new OTP.',
          error as Error
        );
      } else if (
        errorMessage?.includes('Network') ||
        errorCode?.includes('network')
      ) {
        throw new PhoneAuthError(
          PhoneAuthErrorCode.NETWORK_ERROR,
          'Network error. Please check your internet connection and try again.',
          error as Error
        );
      }

      // Catch-all
      throw new PhoneAuthError(
        PhoneAuthErrorCode.UNKNOWN_ERROR,
        errorMessage || 'Failed to verify OTP. Please try again.',
        error as Error
      );
    }
  }

  /**
   * Alternative: Sign in with phone credential (for advanced use cases)
   * Uses PhoneAuthProvider for manual credential creation
   *
   * @param phoneNumber - Phone number in E.164 format
   * @param verificationId - ID from signInWithPhoneNumber
   * @param verificationCode - OTP code
   * @throws PhoneAuthError on failure
   *
   * @internal - Used internally by verifyOTP, exposed for edge cases
   */
  async signInWithCredential(
    verificationId: string,
    verificationCode: string
  ): Promise<void> {
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      await signInWithCredential(auth, credential);
    } catch (error) {
      throw new PhoneAuthError(
        PhoneAuthErrorCode.UNKNOWN_ERROR,
        'Failed to sign in with credential.',
        error as Error
      );
    }
  }

  /**
   * Clears stored confirmation result
   * Useful for resetting state on logout or manual session clear
   */
  clearConfirmationResult(): void {
    this.confirmationResult = null;
  }
}

// Export singleton instance
export const authService = new AuthService();

export default authService;
