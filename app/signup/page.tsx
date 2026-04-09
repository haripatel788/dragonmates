"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    home_town: "",
    home_state: "",
    social_links: [""],
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSocialChange(index: number, value: string) {
    const updated = [...form.social_links];
    updated[index] = value;
    setForm({ ...form, social_links: updated });
  }

  function addSocialLink() {
    setForm({ ...form, social_links: [...form.social_links, ""] });
  }

  function removeSocialLink(index: number) {
    const updated = form.social_links.filter((_, i) => i !== index);
    setForm({ ...form, social_links: updated });
  }

  function validateStep1() {
    if (!form.first_name || !form.last_name) return "Please enter your full name.";
    if (!form.email.includes("@")) return "Please enter a valid email.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirm_password) return "Passwords do not match.";
    return "";
  }

  function nextStep() {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError("");
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.home_town) { setError("Please enter your hometown."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          social_links: form.social_links.filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");
      router.push("/profile/create");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex flex-col font-sans">
      <div className="bg-[#07294d] px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-xl font-bold text-[#ffc600] tracking-wide">DragonMates</h1>
          <p className="text-blue-200 text-xs mt-0.5">Find your perfect roommate match</p>
        </div>
        <span className="text-blue-300 text-sm">
          {step === 1 ? "Step 1 of 2 — Account" : "Step 2 of 2 — About You"}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="flex mb-8 gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex-1 h-1.5 rounded-full" style={{ background: s <= step ? "#07294d" : "#d1d5db" }} />
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#07294d] px-6 py-4">
              <h2 className="text-white font-semibold text-lg">
                {step === 1 ? "Create your account" : "Tell us about yourself"}
              </h2>
              <p className="text-blue-300 text-sm">
                {step === 1 ? "Enter your login details" : "Help others get to know you"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {step === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">First Name</label>
                      <input
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        placeholder="Jane"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Last Name</label>
                      <input
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        placeholder="Smith"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@drexel.edu"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Password</label>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="At least 8 characters"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Confirm Password</label>
                    <input
                      name="confirm_password"
                      type="password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
                      required
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Hometown</label>
                      <input
                        name="home_town"
                        value={form.home_town}
                        onChange={handleChange}
                        placeholder="Philadelphia"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Home State</label>
                      <select
                        name="home_state"
                        value={form.home_state}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
                      >
                        <option value="">Select...</option>
                        {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Social Links</label>
                    <div className="space-y-2">
                      {form.social_links.map((link, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            value={link}
                            onChange={(e) => handleSocialChange(i, e.target.value)}
                            placeholder="https://instagram.com/yourhandle"
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
                          />
                          {form.social_links.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSocialLink(i)}
                              className="px-3 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addSocialLink}
                        className="text-sm text-[#07294d] font-semibold hover:underline"
                      >
                        + Add another link
                      </button>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-300 text-gray-700 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                )}
                {step === 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 bg-[#07294d] hover:bg-[#0a3a6e] text-white text-sm font-semibold py-2.5 rounded-lg transition"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#ffc600] hover:bg-[#e6b200] text-[#07294d] text-sm font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </button>
                )}
              </div>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <a href="/login" className="text-[#07294d] font-semibold hover:underline">Sign in</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}