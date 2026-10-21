"use client";

import { useId, useState } from "react";

function EyeIcon({ crossed = false }: { crossed?: boolean }) {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12s3.3-5.5 9.5-5.5S21.5 12 21.5 12s-3.3 5.5-9.5 5.5S2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      {crossed ? (
        <path
          d="m4 4 16 16"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}

export type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  error?: string | null;
  hint?: string;
  disabled?: boolean;
  name?: string;
};

export function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  error,
  hint,
  disabled = false,
  name,
}: PasswordFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-text"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="h-12 w-full rounded-lg border border-border bg-elevated px-3 pr-12 text-sm text-text placeholder:text-faint transition-colors focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls={id}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-faint transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <EyeIcon crossed={visible} />
        </button>
      </div>
      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-faint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
