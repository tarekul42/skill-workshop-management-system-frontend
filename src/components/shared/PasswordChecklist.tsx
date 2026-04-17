import React from "react";
import { Check, X } from "lucide-react";
import { PASSWORD_CHECKS } from "@/lib/validation/password";

interface PasswordChecklistProps {
  password: string;
}

export function PasswordChecklist({ password }: PasswordChecklistProps) {
  if (password.length === 0) return null;

  return (
    <ul className="grid gap-1 mt-1">
      {PASSWORD_CHECKS.map((check) => {
        const isValid = check.test(password);
        return (
          <li key={check.id} className="flex items-center gap-1.5 text-xs">
            {isValid ? (
              <Check className="size-3 text-green-600 shrink-0" />
            ) : (
              <X className="size-3 text-red-500 shrink-0" />
            )}
            <span
              className={isValid ? "text-green-600" : "text-muted-foreground"}
            >
              {check.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
