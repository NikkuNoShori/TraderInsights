export const passwordRules = {
  minLength: 8,
  maxLength: 72, // Supabase max length
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (password.length < passwordRules.minLength) {
    errors.push(
      `Password must be at least ${passwordRules.minLength} characters long`,
    );
  }

  if (password.length > passwordRules.maxLength) {
    errors.push(
      `Password must be less than ${passwordRules.maxLength} characters`,
    );
  }

  if (passwordRules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (passwordRules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (passwordRules.requireNumber && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (
    passwordRules.requireSpecial &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push("Please enter a valid email address");
  }

  // Additional email validations
  if (email.length > 255) {
    errors.push("Email address is too long");
  }

  if (email.startsWith(".") || email.endsWith(".")) {
    errors.push("Email address cannot start or end with a dot");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
