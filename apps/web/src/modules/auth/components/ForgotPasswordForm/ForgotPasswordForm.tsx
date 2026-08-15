import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { resetPassword } from "../../api/auth.service";

const fieldLabel = "mb-1 block text-sm font-medium text-ink";
const fieldInput =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-base text-text outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setNotice("Please enter your email address.");
      return;
    }

    setSubmitting(true);
    setNotice("");
    try {
      await resetPassword(email.trim());
    } catch (error) {
      // Swallow auth/user-not-found so we don't reveal which emails are
      // registered. Only surface genuinely actionable errors.
      const code = (error as { code?: string }).code;
      if (code === "auth/invalid-email") {
        setNotice("That email address doesn't look valid. Please check and try again.");
        setSubmitting(false);
        return;
      }
      if (code === "auth/too-many-requests") {
        setNotice("Too many attempts. Please wait a moment and try again.");
        setSubmitting(false);
        return;
      }
    }
    // Neutral confirmation regardless of whether the account exists.
    setSent(true);
    setSubmitting(false);
  };

  if (sent) {
    return (
      <div className="w-full max-w-md py-8">
        <div className="mb-4 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
          If an account exists for <span className="font-semibold">{email.trim()}</span>, a password
          reset link is on its way. Check your inbox (and spam folder) and follow the link to choose
          a new password.
        </div>
        <Link
          to="/login"
          className="block w-full rounded-full bg-brand px-5 py-3 text-center text-base font-semibold text-white no-underline transition-colors hover:bg-brand-dark"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="w-full max-w-md py-8" onSubmit={handleSubmit}>
      {notice && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {notice}
        </div>
      )}
      <div className="mb-4">
        <label className={fieldLabel} htmlFor="resetEmail">
          Email address
        </label>
        <input
          type="email"
          className={fieldInput}
          id="resetEmail"
          placeholder="name@example.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <button
        type="submit"
        className="w-full cursor-pointer rounded-full border-0 bg-brand px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        disabled={submitting}
      >
        {submitting ? "Sending…" : "Send reset link"}
      </button>
      <div className="mt-3 text-center">
        Remembered it?{" "}
        <Link className="text-brand hover:underline" to="/login">
          Sign in.
        </Link>
      </div>
    </form>
  );
}
