import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { num: 1, label: "Account Details" },
    { num: 2, label: "Verify Email" },
    { num: 3, label: "You're In!" },
  ];

  return (
    <div className="mb-8 flex w-full items-center justify-center">
      {steps.map((step, idx) => {
        const isActive = step.num === currentStep;
        const isCompleted = step.num < currentStep;
        const isUpcoming = step.num > currentStep;

        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex size-7 items-center justify-center rounded-full text-[13px] font-semibold transition-colors ${isActive ? "bg-primary text-primary-foreground" : ""} ${isCompleted ? "bg-success text-success-foreground" : ""} ${isUpcoming ? "bg-surface-3 text-foreground-muted" : ""} `}
              >
                {isCompleted ? <Check className="size-4" /> : step.num}
              </div>
              <span
                className={`absolute mt-10 hidden text-[11px] font-medium whitespace-nowrap sm:block ${isActive ? "text-primary" : "text-foreground-muted"} ${isCompleted ? "text-success" : ""} `}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-8 transition-colors sm:w-16 ${isCompleted ? "bg-success" : "bg-surface-3"} `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
