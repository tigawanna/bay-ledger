import { toast } from "somoto";

const AUTH_ERROR_TOAST = "auth-error";

export function toastAuthError(message: string, title = "Could not continue") {
  toast.error(title, {
    id: AUTH_ERROR_TOAST,
    description: message,
    duration: Number.POSITIVE_INFINITY,
    closeButton: true,
  });
}
