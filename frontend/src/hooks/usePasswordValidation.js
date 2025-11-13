import { useState, useEffect } from 'react';
import { MIN_PASSWORD_LENGTH } from '@/lib/constants';

/**
 * Custom hook for password validation
 * @param {string} password - Password to validate
 * @returns {Object} Validation state and helper functions
 */
export const usePasswordValidation = (password) => {
  const [validationState, setValidationState] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  useEffect(() => {
    setValidationState({
      length: password.length >= MIN_PASSWORD_LENGTH,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[^A-Za-z0-9]/.test(password),
    });
  }, [password]);

  const allRulesMet = Object.values(validationState).every(Boolean);

  return {
    validationState,
    allRulesMet,
  };
};

/**
 * Custom hook for password match validation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @param {boolean} allRulesMet - Whether all password rules are met
 * @returns {string} Match status: 'idle', 'matching', or 'mismatch'
 */
export const usePasswordMatch = (password, confirmPassword, allRulesMet) => {
  const [matchStatus, setMatchStatus] = useState('idle');

  useEffect(() => {
    if (confirmPassword.length > 0 && allRulesMet) {
      setMatchStatus(password === confirmPassword ? 'matching' : 'mismatch');
    } else {
      setMatchStatus('idle');
    }
  }, [password, confirmPassword, allRulesMet]);

  return matchStatus;
};
