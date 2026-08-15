import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { signup } from "../../api/auth.service";
import { validateSignup, type SignupValues } from "../../schemas/auth-form.schema";

const fieldLabel = "mb-1 block text-sm font-medium text-ink";
const fieldInput =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-base text-text outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30";

interface SignupFormProps {
  onSuccess: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [values, setValues] = useState<SignupValues>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateSignup(values);
    if (errors.length) {
      setNotice(errors[0] ?? "Please check your entries.");
      return;
    }

    setSubmitting(true);
    try {
      await signup(values.email.trim(), values.password);
      onSuccess();
    } catch (error) {
      console.error("Signup failed", error);
      setNotice("Sorry, the account could not be created. Please try again.");
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
        <label className={fieldLabel} htmlFor="signupEmail">
          Email address
        </label>
        <input
          id="signupEmail"
          type="email"
          className={fieldInput}
          placeholder="name@example.com"
          autoComplete="email"
          value={values.email}
          onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
        />
      </div>
      <div className="mb-4">
        <label className={fieldLabel} htmlFor="signupPassword">
          Password
        </label>
        <input
          id="signupPassword"
          type="password"
          className={fieldInput}
          placeholder="Password"
          autoComplete="new-password"
          value={values.password}
          onChange={(event) =>
            setValues((current) => ({ ...current, password: event.target.value }))
          }
        />
      </div>
      <div className="mb-4">
        <label className={fieldLabel} htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          className={fieldInput}
          placeholder="Confirm Password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(event) =>
            setValues((current) => ({ ...current, confirmPassword: event.target.value }))
          }
        />
      </div>
      <button
        type="submit"
        className="w-full cursor-pointer rounded-full border-0 bg-brand px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        disabled={submitting}
      >
        {submitting ? "Creating account…" : "Create account"}
      </button>
      <div className="mt-3 text-center">
        Already have an account?{" "}
        <Link className="text-brand hover:underline" to="/login">
          Sign in.
        </Link>
      </div>
    </form>
  );
}
