import { getPasswordChecks } from "@/lib/password-policy";

export function PasswordChecklist({ password }: { password: string }) {
  const checks = getPasswordChecks(password);

  return (
    <ul className="mt-2 grid gap-1 text-xs" aria-label="Password requirements">
      {checks.map((check) => (
        <li
          key={check.id}
          className={check.met ? "text-success" : "text-faint"}
        >
          <span aria-hidden="true" className="mr-1.5 inline-block w-3">
            {check.met ? "✓" : "○"}
          </span>
          <span>
            <span className="sr-only">
              {check.met ? "Met: " : "Not met: "}
            </span>
            {check.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
