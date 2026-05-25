import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { num: 1, label: "Account Details" },
    { num: 2, label: "Verify Email" },
    { num: 3, label: "You're In!" }
  ];

  return (
    <div className="mb-8 flex items-center justify-center w-full">
      {steps.map((step, idx) => {
        const isActive = step.num === currentStep;
        const isCompleted = step.num < currentStep;
        const isUpcoming = step.num > currentStep;

        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex size-7 items-center justify-center rounded-full text-[13px] font-semibold transition-colors
                  ${isActive ? "bg-primary text-primary-foreground" : ""}
                  ${isCompleted ? "bg-success text-success-foreground" : ""}
                  ${isUpcoming ? "bg-surface-3 text-foreground-muted" : ""}
                `}
              >
                {isCompleted ? <Check className="size-4" /> : step.num}
              </div>
              <span
                className={`absolute mt-10 text-[11px] font-medium whitespace-nowrap hidden sm:block
                  ${isActive ? "text-primary" : "text-foreground-muted"}
                  ${isCompleted ? "text-success" : ""}
                `}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-[2px] w-8 sm:w-16 mx-2 transition-colors
                  ${isCompleted ? "bg-success" : "bg-surface-3"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
