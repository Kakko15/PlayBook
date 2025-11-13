# Testing Checklist

Use this checklist to verify all refactored functionality works correctly.

## ✅ Authentication Flows

### Regular Login

- [ ] Login with email/password works
- [ ] Login with invalid credentials shows error
- [ ] Login redirects to correct dashboard (admin vs super_admin)
- [ ] Welcome message displays correctly

### OAuth Login

- [ ] Google login button works
- [ ] Google login redirects correctly
- [ ] Discord login button works
- [ ] Discord login redirects correctly
- [ ] OAuth login shows correct welcome message
- [ ] OAuth login redirects to correct dashboard

### Signup

- [ ] Signup form validation works
- [ ] Password validation hints appear on focus
- [ ] Password confirmation shows match/mismatch indicators
- [ ] Google signup button works
- [ ] Discord signup button works
- [ ] reCAPTCHA validation works
- [ ] Successful signup redirects to pending approval page

### OTP/2FA Flows

- [ ] OTP setup page displays QR code
- [ ] OTP setup accepts 6-digit code
- [ ] OTP setup redirects after successful verification
- [ ] Login with OTP-enabled account prompts for OTP
- [ ] OTP verification page accepts 6-digit code
- [ ] OTP verification redirects to correct dashboard
- [ ] Google OAuth with OTP prompts for verification
- [ ] Discord OAuth with OTP prompts for verification
- [ ] Invalid OTP shows error message
- [ ] OTP verification doesn't redirect to login on 401

### Password Reset

- [ ] Request password reset sends email
- [ ] Password reset link validation works
- [ ] Invalid/expired token shows error
- [ ] Password validation hints work
- [ ] Password confirmation match indicators work
- [ ] Successful password reset redirects to login
- [ ] Password reset doesn't redirect to login on 401

## ✅ Navigation

### Post-Login Navigation

- [ ] Super admin redirects to /superadmin
- [ ] Regular admin redirects to /admin
- [ ] Navigation after OTP verification works
- [ ] Navigation after OAuth works

### Protected Routes

- [ ] Unauthenticated users redirect to login
- [ ] Super admin can access super admin routes
- [ ] Regular admin cannot access super admin routes
- [ ] Users without 2FA redirect to setup page

## ✅ Error Handling

### ErrorBoundary

- [ ] ErrorBoundary catches React errors
- [ ] Error page displays correctly
- [ ] "Return to Home" button works
- [ ] Error details show in development mode

### API Errors

- [ ] 401 errors redirect to login (except on excluded paths)
- [ ] 401 during OTP verification doesn't redirect
- [ ] 401 during password reset doesn't redirect
- [ ] Network errors show toast messages
- [ ] Validation errors display correctly

## ✅ UI/UX

### Forms

- [ ] All form inputs are accessible
- [ ] Tab navigation works correctly
- [ ] Enter key submits forms
- [ ] Loading states display correctly
- [ ] Disabled states work correctly

### Animations

- [ ] Page transitions are smooth
- [ ] Form animations work
- [ ] Password match indicators animate
- [ ] No animation jank or flicker

### Responsive Design

- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] OAuth buttons stack correctly on mobile

## ✅ Security

### Authentication

- [ ] Tokens are stored securely
- [ ] Tokens are cleared on logout
- [ ] Session storage is cleared appropriately
- [ ] No sensitive data in console logs (production)

### Rate Limiting

- [ ] Login rate limiting works
- [ ] Signup rate limiting works
- [ ] OTP rate limiting works
- [ ] Password reset rate limiting works

## ✅ Performance

### Bundle Size

- [ ] No duplicate code in bundle
- [ ] Icons are properly tree-shaken
- [ ] Animations don't cause performance issues

### Loading States

- [ ] OAuth callbacks show loading indicator
- [ ] Form submissions show loading state
- [ ] OTP verification shows loading state

## ✅ Browser Compatibility

### Browsers to Test

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## ✅ Environment Variables

### Development

- [ ] All environment variables are set
- [ ] Fallback values work in development
- [ ] Console warnings for missing variables

### Production

- [ ] All environment variables are set
- [ ] No fallback values are used
- [ ] OAuth client IDs are correct
- [ ] reCAPTCHA site key is correct

## ✅ Code Quality

### Linting

- [ ] No ESLint errors
- [ ] No TypeScript errors (if applicable)
- [ ] No console.log statements in production code

### Diagnostics

- [ ] All files pass getDiagnostics
- [ ] No unused imports
- [ ] No unused variables

## 🐛 Known Issues to Watch For

1. **OAuth State Parameter**: Ensure state parameter is properly encoded/decoded
2. **Session Storage**: Verify email is stored before OTP verification
3. **401 Interceptor**: Confirm it doesn't interfere with auth flows
4. **Password Validation**: Check all rules are properly validated
5. **Navigation Race Conditions**: Ensure navigation happens after state updates

## 📝 Notes

- Test with both existing and new user accounts
- Test with accounts that have 2FA enabled and disabled
- Test with super admin and regular admin accounts
- Test with pending approval accounts
- Clear browser cache between major test runs
- Test in incognito/private mode to avoid cached state

## ✅ Sign-off

- [ ] All critical paths tested
- [ ] All issues documented
- [ ] Ready for deployment

**Tested by:** ******\_\_\_******  
**Date:** ******\_\_\_******  
**Environment:** ******\_\_\_******  
**Notes:** ******\_\_\_******
