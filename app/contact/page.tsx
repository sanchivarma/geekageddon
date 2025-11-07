'use client';

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

export default function ContactPage() {
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

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
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
        subject: form.subjectText || subjectOptions.find((opt) => opt.value === form.subjectChoice)?.label || "General",
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
      setMessage(error instanceof Error ? error.message : "Unexpected error while sending message.");
    }
  };

  return (
    <SiteShell>
      <section className="rounded-[2.5rem] border border-slate-200/70 bg-white/95 p-10 shadow-[0_25px_80px_rgba(15,23,42,0.12)] dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-600 dark:text-cyan-300">Geekageddon</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Contact Us</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Pitch your launches, share tips, or drop general feedback. Let's connect !
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                className="mt-2 w-full rounded-2xl border border-slate-300/80 bg-white/80 px-4 py-3 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Your Name"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                className="mt-2 w-full rounded-2xl border border-slate-300/80 bg-white/80 px-4 py-3 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="your-email@company.com"
              />
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Subject (dropdown)</label>
              <select
                value={form.subjectChoice}
                onChange={handleChange("subjectChoice")}
                className="mt-2 w-full rounded-2xl border border-slate-300/80 bg-white/80 px-4 py-3 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {subjectOptions.map((option) => (
                  <option key={option.value || "placeholder"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.subjectChoice && <p className="mt-1 text-xs text-rose-500">{errors.subjectChoice}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Subject (custom text)</label>
              <input
                type="text"
                value={form.subjectText}
                onChange={handleChange("subjectText")}
                className="mt-2 w-full rounded-2xl border border-slate-300/80 bg-white/80 px-4 py-3 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="e.g. Launching an AI Monitoring tool for developers"
              />
              {errors.subjectText && <p className="mt-1 text-xs text-rose-500">{errors.subjectText}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              className="mt-2 w-full rounded-2xl border border-slate-300/80 bg-white/80 px-4 py-3 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              rows={6}
              placeholder="To add your website/product : Please share =>  Headline, feature-image link, website link, and description"
            />
            {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description}</p>}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center gap-2 rounded-full border border-cyan-500/60 px-6 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-400/60 dark:text-cyan-200 dark:hover:bg-cyan-400/20"
            >
              {status === "loading" && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent dark:border-cyan-200"></span>
              )}
              Send message
            </button>
            {status === "success" && <p className="text-sm text-emerald-500">{message}</p>}
            {status === "error" && <p className="text-sm text-rose-500">{message}</p>}
          </div>
        </form>
      </section>
    </SiteShell>
  );
}
