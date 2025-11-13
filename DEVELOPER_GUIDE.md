# Developer Guide - Using New Utilities

This guide helps developers use the new utility functions and components created during the refactoring.

## Table of Contents

1. [Constants](#constants)
2. [OAuth Utilities](#oauth-utilities)
3. [Auth Utilities](#auth-utilities)
4. [Password Validation](#password-validation)
5. [OAuth Callbacks](#oauth-callbacks)
6. [Reusable Components](#reusable-components)
7. [Animations](#animations)

---

## Constants

### Usage

```javascript
import {
  OTP_LENGTH,
  MIN_PASSWORD_LENGTH,
  GOOGLE_CLIENT_ID,
  DISCORD_CLIENT_ID,
  RECAPTCHA_SITE_KEY,
  USER_ROLES,
  USER_STATUS,
} from "@/lib/constants";

// Example: OTP input validation
if (code.length === OTP_LENGTH) {
  verifyOtp(code);
}

// Example: Check user role
if (user.role === USER_ROLES.SUPER_ADMIN) {
  // Super admin logic
}
```

---

## OAuth Utilities

### Redirect to OAuth Provider

```javascript
import { redirectToGoogleOAuth, redirectToDiscordOAuth } from "@/lib/oauth";

// Redirect to Google OAuth (from login or signup)
const handleGoogleLogin = () => {
  redirectToGoogleOAuth("login"); // or 'signup'
};

// Redirect to Discord OAuth
const handleDiscordLogin = () => {
  redirectToDiscordOAuth();
};
```

### Build OAuth URLs (if you need the URL without redirecting)

```javascript
import { buildGoogleOAuthUrl, buildDiscordOAuthUrl } from "@/lib/oauth";

const googleUrl = buildGoogleOAuthUrl("signup");
const discordUrl = buildDiscordOAuthUrl();
```

---

## Auth Utilities

### Welcome Messages

```javascript
import { getWelcomeMessage } from "@/lib/authUtils";

// For existing users
const message = getWelcomeMessage(user); // "Welcome back, John!"

// For new users
const message = getWelcomeMessage(user, true); // "Welcome, John!"
```

### Post-Login Navigation

```javascript
import { navigateAfterLogin } from "@/lib/authUtils";

// Automatically navigates to /superadmin or /admin based on role
navigateAfterLogin(user, navigate, { replace: true });
```

### Store Auth Data

```javascript
import { storeAuthData } from "@/lib/authUtils";
import api from "@/lib/api";

// Store token and user in localStorage and set API auth header
storeAuthData(token, user, api.setAuthToken);
```

### Clear Auth Data

```javascript
import { clearAuthData } from "@/lib/authUtils";

// Clear all auth data from storage
clearAuthData();
```

---

## Password Validation

### Using the Hook

```javascript
import {
  usePasswordValidation,
  usePasswordMatch,
} from "@/hooks/usePasswordValidation";

const MyComponent = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Get validation state
  const { validationState, allRulesMet } = usePasswordValidation(password);

  // Get match status
  const matchStatus = usePasswordMatch(password, confirmPassword, allRulesMet);
  // Returns: 'idle', 'matching', or 'mismatch'

  return (
    <>
      <PasswordValidationHints validationState={validationState} />
      {matchStatus === "matching" && <span>✓ Passwords match</span>}
    </>
  );
};
```

---

## OAuth Callbacks

### Using the Hook

```javascript
import { useOAuthCallback } from "@/hooks/useOAuthCallback";
import api from "@/lib/api";

const GoogleCallbackPage = () => {
  // Handles the entire OAuth callback flow
  useOAuthCallback(api.googleOAuthLogin, "Google");

  return <Loader />;
};

const DiscordCallbackPage = () => {
  useOAuthCallback(api.discordLogin, "Discord");

  return <Loader />;
};
```

The hook automatically handles:

- Code extraction from URL
- Error handling
- Pending approval flow
- OTP requirement flow
- Successful login flow
- Navigation

---

## Reusable Components

### OAuthButtons

```javascript
import OAuthButtons from "@/components/OAuthButtons";

<OAuthButtons
  disabled={isLoading}
  from="login" // or 'signup'
/>;
```

### PasswordConfirmInput

```javascript
import PasswordConfirmInput from "@/components/PasswordConfirmInput";

<PasswordConfirmInput
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
  showPassword={showPassword}
  onTogglePassword={() => setShowPassword(!showPassword)}
  matchStatus={matchStatus} // 'idle', 'matching', or 'mismatch'
  disabled={isLoading}
/>;
```

### Icons

```javascript
import GoogleIcon from '@/components/icons/GoogleIcon';
import DiscordIcon from '@/components/icons/DiscordIcon';

<GoogleIcon className='h-5 w-5' />
<DiscordIcon className='h-5 w-5' />
```

### ErrorBoundary

```javascript
import ErrorBoundary from "@/components/ErrorBoundary";

// Wrap your app or specific components
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>;
```

---

## Animations

### Using Shared Variants

```javascript
import {
  containerVariants,
  itemVariants,
  fadeInVariants,
  slideUpVariants,
} from "@/lib/animations";
import { motion } from "framer-motion";

<motion.div variants={containerVariants} initial="hidden" animate="show">
  <motion.div variants={itemVariants}>Item 1</motion.div>
  <motion.div variants={itemVariants}>Item 2</motion.div>
</motion.div>;
```

---

## Best Practices

### 1. Always Use Constants

❌ **Don't:**

```javascript
if (code.length === 6) { ... }
```

✅ **Do:**

```javascript
import { OTP_LENGTH } from '@/lib/constants';
if (code.length === OTP_LENGTH) { ... }
```

### 2. Use Utility Functions for Auth

❌ **Don't:**

```javascript
localStorage.setItem("playbook-token", token);
localStorage.setItem("playbook-user", JSON.stringify(user));
api.setAuthToken(token);
```

✅ **Do:**

```javascript
import { storeAuthData } from "@/lib/authUtils";
storeAuthData(token, user, api.setAuthToken);
```

### 3. Use Hooks for Complex Logic

❌ **Don't:**

```javascript
const [validation, setValidation] = useState({ ... });
useEffect(() => {
  setValidation({ ... });
}, [password]);
```

✅ **Do:**

```javascript
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
const { validationState, allRulesMet } = usePasswordValidation(password);
```

### 4. Use Shared Components

❌ **Don't:**

```javascript
<Button onClick={() => (window.location.href = googleUrl)}>
  <svg>...</svg> Google
</Button>
```

✅ **Do:**

```javascript
import OAuthButtons from "@/components/OAuthButtons";
<OAuthButtons from="login" />;
```

---

## Common Patterns

### Complete Login Flow

```javascript
import {
  storeAuthData,
  getWelcomeMessage,
  navigateAfterLogin,
} from "@/lib/authUtils";
import api from "@/lib/api";
import toast from "react-hot-toast";

const handleLogin = async (email, password) => {
  try {
    const data = await api.login(email, password, recaptchaToken);

    if (data.otpRequired) {
      navigate("/verify-2fa");
      return;
    }

    storeAuthData(data.token, data.user, api.setAuthToken);
    setUser(data.user);
    toast.success(getWelcomeMessage(data.user));
    navigateAfterLogin(data.user, navigate);
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
  }
};
```

### Complete Signup Form with Password Validation

```javascript
import {
  usePasswordValidation,
  usePasswordMatch,
} from "@/hooks/usePasswordValidation";
import PasswordValidationHints from "@/components/PasswordValidationHints";
import PasswordConfirmInput from "@/components/PasswordConfirmInput";

const SignupForm = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const { validationState, allRulesMet } = usePasswordValidation(password);
  const matchStatus = usePasswordMatch(password, confirmPassword, allRulesMet);

  return (
    <form>
      <div>
        <Input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
        />
        {isPasswordFocused && (
          <PasswordValidationHints validationState={validationState} />
        )}
      </div>

      <div>
        <PasswordConfirmInput
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          matchStatus={matchStatus}
        />
      </div>

      <Button disabled={!allRulesMet || matchStatus !== "matching"}>
        Sign Up
      </Button>
    </form>
  );
};
```

---

## Troubleshooting

### Issue: OAuth redirect not working

**Solution:** Check that environment variables are set correctly:

```bash
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_DISCORD_CLIENT_ID=your_client_id
```

### Issue: 401 errors redirecting during OTP verification

**Solution:** The 401 interceptor now excludes `/verify-2fa` and `/reset-password` paths. If you add new auth flows, update the `excludedPaths` array in `frontend/src/lib/api.js`.

### Issue: Password validation not working

**Solution:** Make sure you're using the hook correctly:

```javascript
const { validationState, allRulesMet } = usePasswordValidation(password);
// NOT: usePasswordValidation(password, confirmPassword)
```

---

## Questions?

If you have questions about using these utilities, please:

1. Check this guide first
2. Look at existing usage in the codebase
3. Check the REFACTORING_SUMMARY.md for context
4. Ask the team

Happy coding! 🚀
