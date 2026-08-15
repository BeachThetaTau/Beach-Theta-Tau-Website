import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { login } from "../../api/auth.service";
import { validateLogin, type LoginValues } from "../../schemas/auth-form.schema";

const fieldLabel = "mb-1 block text-sm font-medium text-ink";
const fieldInput =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-base text-text outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30";

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
    stayLoggedIn: false,
  });
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateLogin(values);
    if (errors.length) {
      setNotice(errors[0] ?? "Please check your entries.");
      return;
    }

    setSubmitting(true);
    try {
      await login(values.email.trim(), values.password, values.stayLoggedIn);
      onSuccess();
    } catch {
      setNotice("You entered a wrong email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="w-full max-w-md py-8" onSubmit={handleSubmit}>
      {notice && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {notice}
        </div>
      )}
      <div className="mb-4">
        <label className={fieldLabel} htmlFor="loginEmail">
          Email address
        </label>
        <input
          type="email"
          className={fieldInput}
          id="loginEmail"
          placeholder="name@example.com"
          autoComplete="email"
          value={values.email}
          onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
        />
      </div>
      <div className="mb-4">
        <label className={fieldLabel} htmlFor="loginPassword">
          Password
        </label>
        <input
          type="password"
          className={fieldInput}
          id="loginPassword"
          placeholder="Password"
          autoComplete="current-password"
          value={values.password}
          onChange={(event) =>
            setValues((current) => ({ ...current, password: event.target.value }))
          }
        />
      </div>
      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          className="h-4 w-4 accent-brand"
          id="stayLoggedInCheck"
          checked={values.stayLoggedIn}
          onChange={(event) =>
            setValues((current) => ({ ...current, stayLoggedIn: event.target.checked }))
          }
        />
        <label className="text-sm text-text" htmlFor="stayLoggedInCheck">
          Stay logged in
        </label>
      </div>
      <div className="mb-4 text-right">
        <Link className="text-sm text-brand hover:underline" to="/forgot-password">
          Forgot password?
        </Link>
      </div>
      <button
        type="submit"
        className="w-full cursor-pointer rounded-full border-0 bg-brand px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        disabled={submitting}
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
      <div className="mt-3 text-center">
        Need an account?{" "}
        <Link className="text-brand hover:underline" to="/signup">
          Create one.
        </Link>
      </div>
    </form>
  );
}
