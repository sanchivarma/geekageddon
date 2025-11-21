"use client";

import { FormEvent, useMemo, useState } from "react";
import { SiteShell } from "../components/SiteShell";

type FormState = {
  name: string;
  email: string;
  subjectChoice: string;
  subjectText: string;
  description: string;
};

const subjectOptions = [
  { value: "", label: "Select a subject" },
  { value: "feature", label: "Feature your Company-news, product, startup launch or podcast" },
  { value: "queries", label: "General query" },
  { value: "feedback", label: "Feedback" },
];

const initialState: FormState = {
  name: "",
  email: "",
  subjectChoice: "",
  subjectText: "",
  description: "",
};

export default function GeekreachPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<keyof FormState, string>>({
    name: "",
    email: "",
    subjectChoice: "",
    subjectText: "",
    description: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const subjectValid = useMemo(() => {
    return form.subjectChoice.trim() !== "" || form.subjectText.trim() !== "";
  }, [form.subjectChoice, form.subjectText]);

  const handleChange =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  const validate = () => {
    const nextErrors: Record<keyof FormState, string> = {
      name: form.name.trim() ? "" : "Name is required.",
      email: /\S+@\S+\.\S+/.test(form.email.trim()) ? "" : "Valid email is required.",
      subjectChoice: "",
      subjectText: "",
      description: form.description.trim() ? "" : "Description is required.",
    };

    if (!subjectValid) {
      nextErrors.subjectChoice = "Pick a subject option or type your own.";
      nextErrors.subjectText = "Pick a subject option or type your own.";
    }

    setErrors(nextErrors);
    return Object.values(nextErrors).every((err) => !err);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setMessage("");

    try {
      const payload = {
        name: form.name,
        email: form.email,
        subject:
          form.subjectText ||
          subjectOptions.find((opt) => opt.value === form.subjectChoice)?.label ||
          "General",
        description: form.description,
      };

      const response = await fetch("https://formsubmit.co/ajax/emailsanchi@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to send message. Please try again later.");
      }

      setStatus("success");
      setMessage("Thanks! Your message is on its way to the Geekageddon inbox.");
      setForm(initialState);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Unexpected error while sending message."
      );
    }
  };

  return (
    <SiteShell>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-3 pb-12 pt-4 sm:px-4 lg:px-0">
        <section className="w-full rounded-[2.5rem] border border-slate-200/70 bg-white/95 p-5 shadow-[0_25px_80px_rgba(15,23,42,0.12)] dark:border-slate-800/70 dark:bg-slate-950/80 sm:p-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Geek Reach</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Reach out to us. We answer queries, feedback, and feature requests within 48 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  placeholder="Your Name"
                  onChange={handleChange("name")}
                  className="w-full rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  placeholder="test@test.com"
                  onChange={handleChange("email")}
                  className="w-full rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Subject
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={form.subjectChoice}
                  onChange={handleChange("subjectChoice")}
                  className="w-full rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  {subjectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={form.subjectText}
                  placeholder="Or type your own subject"
                  onChange={handleChange("subjectText")}
                  className="w-full rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              {(errors.subjectChoice || errors.subjectText) && (
                <p className="text-xs text-rose-500">Pick a subject option or type your own.</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Message
              </label>
              <textarea
                value={form.description}
                placeholder="Your message"
                onChange={handleChange("description")}
                className="min-h-[180px] w-full rounded-xl border border-slate-300/80 bg-white/80 px-3 py-3 text-sm text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              {errors.description && <p className="text-xs text-rose-500">{errors.description}</p>}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-500/70 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-300/70 dark:text-cyan-200"
              >
                {status === "loading" ? "Sending..." : "Send message"}
              </button>
              {status === "success" && <span className="text-xs text-emerald-500">{message}</span>}
              {status === "error" && <span className="text-xs text-rose-500">{message}</span>}
            </div>
          </form>
        </section>
      </div>
    </SiteShell>
  );
}
