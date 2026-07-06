import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";

const ERROR_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your input.",
  401: "Your session has expired. Please log in again.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This resource already exists.",
  422: "Validation failed. Please check your input.",
  429: "Too many requests. Please wait a moment and try again.",
};

export function handleApiError(error: unknown, fallbackMessage = "Something went wrong."): void {
  if (error instanceof ApiError) {
    const message = ERROR_MESSAGES[error.status] ?? error.message ?? fallbackMessage;
    toast.error(message);
    return;
  }

  if (error instanceof Error) {
    toast.error(error.message || fallbackMessage);
    return;
  }

  toast.error(fallbackMessage);
}
