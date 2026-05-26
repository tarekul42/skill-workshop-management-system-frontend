import React from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { PASSWORD_CHECKS } from "@/lib/validation/password";

interface PasswordChecklistProps {
  password: string;
}

export function PasswordChecklist({ password }: PasswordChecklistProps) {
  if (password.length === 0) return null;

  return (
    <ul className="mt-2 grid gap-2">
      {PASSWORD_CHECKS.map((check) => {
        const isValid = check.test(password);
        return (
          <li key={check.id} className="flex items-center gap-2 text-[13px]">
            {isValid ? (
              <CheckCircle2 className="text-success size-4 shrink-0" />
            ) : (
              <Circle className="text-foreground-disabled size-4 shrink-0" />
            )}
            <span className={isValid ? "text-success font-medium" : "text-foreground-subtle"}>
              {check.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
