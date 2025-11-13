// Authentication constants
export const OTP_LENGTH = 6;
export const MIN_PASSWORD_LENGTH = 8;

// OAuth Client IDs (fallbacks for development only)
export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '759620578509-a59st7kq2so8q2oj81gjbtug9op4q2sv.apps.googleusercontent.com';

export const DISCORD_CLIENT_ID =
  import.meta.env.VITE_DISCORD_CLIENT_ID || '1435255638383919177';

export const RECAPTCHA_SITE_KEY =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
  '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

// User status
export const USER_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
};
