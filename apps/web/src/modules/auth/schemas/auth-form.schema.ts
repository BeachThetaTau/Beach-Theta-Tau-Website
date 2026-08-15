export interface LoginValues {
  email: string;
  password: string;
  stayLoggedIn: boolean;
}

export interface SignupValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export function validateLogin(values: LoginValues): string[] {
  const errors: string[] = [];
  if (!values.email.trim()) errors.push("Email is required.");
  if (!values.password) errors.push("Password is required.");
  return errors;
}

export function validateSignup(values: SignupValues): string[] {
  const errors: string[] = [];
  if (!values.email.trim()) errors.push("Email is required.");
  if (values.password.length < 8) errors.push("Password must be at least 8 characters.");
  if (values.password !== values.confirmPassword) errors.push("Passwords do not match.");
  return errors;
}
