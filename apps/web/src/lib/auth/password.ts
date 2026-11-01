export function passwordPolicyError(value: string) {
  if (value.length < 8) return "At least 8 characters";
  if (!/[a-z]/.test(value)) return "Include a lowercase letter";
  if (!/[A-Z]/.test(value)) return "Include an uppercase letter";
  if (!/\d/.test(value)) return "Include a number";
  if (!/[^A-Za-z0-9]/.test(value)) return "Include a symbol";
  return undefined;
}
