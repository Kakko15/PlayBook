import { USER_ROLES } from './constants';

/**
 * Get welcome message for user
 * @param {Object} user - User object
 * @param {boolean} isNewUser - Whether this is a new user
 * @returns {string} Welcome message
 */
export const getWelcomeMessage = (user, isNewUser = false) => {
  const firstName = user.name.split(' ')[0];
  return isNewUser ? `Welcome, ${firstName}!` : `Welcome back, ${firstName}!`;
};

/**
 * Navigate user to appropriate dashboard after login
 * @param {Object} user - User object
 * @param {Function} navigate - React Router navigate function
 * @param {Object} options - Navigation options
 */
export const navigateAfterLogin = (
  user,
  navigate,
  options = { replace: true }
) => {
  if (user.role === USER_ROLES.SUPER_ADMIN) {
    navigate('/superadmin/dashboard', options);
  } else if (user.role === USER_ROLES.SCORER) {
    navigate('/scorer/dashboard', options);
  } else {
    navigate('/admin/dashboard', options);
  }
};

/**
 * Store authentication data in localStorage
 * @param {string} token - JWT token
 * @param {Object} user - User object
 * @param {Function} setAuthToken - Function to set auth token in API client
 */
export const storeAuthData = (token, user, setAuthToken) => {
  localStorage.setItem('playbook-token', token);
  localStorage.setItem('playbook-user', JSON.stringify(user));
  setAuthToken(token);
};

/**
 * Clear authentication data from storage
 */
export const clearAuthData = () => {
  localStorage.removeItem('playbook-token');
  localStorage.removeItem('playbook-user');
  sessionStorage.removeItem('playbook-otp-email');
};
