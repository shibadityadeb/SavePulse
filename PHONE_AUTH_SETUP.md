# Phone Authentication Setup Guide

## ✅ Completed Steps

### 1. Dependencies Installed ✓
```bash
expo-firebase-recaptcha
```

### 2. Environment Variables Updated ✓
Added to `.env`:
```
EXPO_PUBLIC_RECAPTCHA_WEB_CLIENT_KEY=your_recaptcha_site_key_here
```

### 3. Code Created ✓
- `src/hooks/usePhoneAuth.ts` - Custom hook for auth state management
- `src/components/auth/PhoneAuthExample.tsx` - Example component

---

## 🔑 Get Your reCAPTCHA Site Key

**You need to complete this step before testing!**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **savepulse-57c12** project
3. Navigate to **Project Settings** → **App Check**
4. Click **Create App Check provider**
5. Select **reCAPTCHA v3**
6. Accept terms and create
7. Copy the **Site Key**
8. Replace in `.env`:
```bash
EXPO_PUBLIC_RECAPTCHA_WEB_CLIENT_KEY=your_copied_site_key_here
```

---

## 🚀 How to Use

### Option 1: Direct Hook Usage (Recommended)

```typescript
import { usePhoneAuth } from '@/src/hooks/usePhoneAuth';

export function MyLoginScreen() {
  const {
    phoneNumber,
    setPhoneNumber,
    otp,
    setOtp,
    step,
    loading,
    error,
    sendOTP,
    verifyOTP,
    recaptchaRef,
  } = usePhoneAuth();

  return (
    <>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaRef}
        firebaseConfig={firebaseConfig}
        attemptInvisible={false}
      />

      {step === 'phone' ? (
        <>
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+1234567890"
          />
          <Button onPress={sendOTP} title="Send OTP" />
        </>
      ) : (
        <>
          <TextInput
            value={otp}
            onChangeText={setOtp}
            placeholder="000000"
            maxLength={6}
          />
          <Button onPress={verifyOTP} title="Verify OTP" />
        </>
      )}

      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </>
  );
}
```

### Option 2: Use Example Component

```typescript
import { PhoneAuthExample } from '@/src/components/auth/PhoneAuthExample';

export function LoginScreen() {
  const navigation = useNavigation();

  return (
    <PhoneAuthExample
      onSuccess={() => navigation.navigate('Home')}
    />
  );
}
```

---

## 📋 File Structure Created

```
src/
├── hooks/
│   └── usePhoneAuth.ts              # Custom hook with state management
├── components/
│   └── auth/
│       └── PhoneAuthExample.tsx     # Complete example component
└── services/
    ├── firebase.ts                  # Firebase config (existing)
    └── authService.ts               # Phone auth logic (existing)
```

---

## 🧪 Testing with Test Phone Numbers

Firebase provides free test numbers for development:

```
Phone Numbers:
+15555550100 through +15555550199

OTP Code:
000000 (any 6-digit code starting with 0)
```

Test locally without sending real SMS!

---

## ⚠️ Important Notes

1. **reCAPTCHA Modal Must Be Rendered**
   - FirebaseRecaptchaVerifierModal must be mounted before calling `sendOTP()`
   - Set `attemptInvisible={false}` during testing

2. **Phone Number Format**
   - Must be E.164 format: `+[country_code][number]`
   - Hook auto-sanitizes: `+1 (555) 123-4567` → `+15551234567`

3. **OTP Session Timeout**
   - OTP valid for 2 minutes
   - Must verify within this window
   - Request new OTP if it expires

4. **Environment Variables**
   - Restart Expo dev server after updating `.env`
   - All must start with `EXPO_PUBLIC_` to be bundled

---

## 🔴 Common Error Codes

| Code | Fix |
|------|-----|
| `INVALID_PHONE` | Use format: +1234567890 |
| `INVALID_OTP` | Must be exactly 6 digits |
| `OTP_EXPIRED` | Request new OTP |
| `RECAPTCHA_FAILED` | Ensure modal is rendered |
| `NETWORK_ERROR` | Check internet connection |
| `TOO_MANY_ATTEMPTS` | Wait before retrying |

---

## 🔗 Architecture Overview

```
React Component
    ↓
usePhoneAuth() hook
    ↓
authService
    ├── sendOTP()
    └── verifyOTP()
    ↓
Firebase Auth
    ↓
Firebase Backend
```

The hook manages UI state, authService handles business logic. Clean separation!

---

## ✨ Next Steps

1. ✅ Get reCAPTCHA Site Key and update `.env`
2. ✅ Integrate `PhoneAuthExample` into your app
3. ✅ Test with test phone numbers: +15555550100
4. ✅ Customize UI to match your design
5. ✅ Add navigation after successful verification

---

## 📚 Reference

- [Firebase Phone Auth Docs](https://firebase.google.com/docs/auth/web/phone-auth)
- [expo-firebase-recaptcha](https://github.com/EvanBacon/expo-firebase-recaptcha)
- [E.164 Phone Format](https://en.wikipedia.org/wiki/E.164)
