import clsx from "clsx";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const NewInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <input
          ref={ref}
          disabled={disabled}
          className={clsx(
            "w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "transition-colors",
            disabled && "cursor-not-allowed bg-gray-100 text-gray-500",
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 hover:border-gray-400",
            className
          )}
          {...props}
        />

        {(error || helperText) && (
          <p
            className={clsx(
              "mt-1 text-xs",
              error ? "text-red-600" : "text-gray-500"
            )}
          >
            {error ?? helperText}
          </p>
        )}
      </div>
    );
  }
);

NewInput.displayName = "Input";
