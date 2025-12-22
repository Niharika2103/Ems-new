export const validatePasswordWithSettings = (password, settings) => {
  const errors = [];

  if (password.length < settings.min_password_length) {
    errors.push(`Minimum ${settings.min_password_length} characters required`);
  }

  if (settings.require_uppercase && !/[A-Z]/.test(password)) {
    errors.push("At least one uppercase letter required");
  }

  if (settings.require_lowercase && !/[a-z]/.test(password)) {
    errors.push("At least one lowercase letter required");
  }

  if (settings.require_number && !/[0-9]/.test(password)) {
    errors.push("At least one number required");
  }

  if (settings.require_special && !/[!@#$%^&*]/.test(password)) {
    errors.push("At least one special character required");
  }

  return errors;
};
