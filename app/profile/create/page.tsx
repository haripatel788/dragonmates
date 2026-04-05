"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ACADEMIC_YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
const MAJORS = [
  "Computer Science", "Information Systems", "Software Engineering",
  "Electrical Engineering", "Mechanical Engineering", "Civil Engineering",
  "Business Administration", "Finance", "Accounting", "Marketing",
  "Biology", "Chemistry", "Physics", "Mathematics", "Psychology",
  "Communications", "Political Science", "English", "History", "Other",
];
const MUSIC_GENRES = ["Pop", "Hip-Hop", "R&B", "Rock", "Classical", "Country", "Electronic", "Jazz", "Lo-fi", "Indie"];

const INTEREST_OPTIONS = [
  { name: "Gaming", emoji: "🎮" },
  { name: "Gym / Fitness", emoji: "💪" },
  { name: "Cooking", emoji: "🍳" },
  { name: "Hiking", emoji: "🥾" },
  { name: "Reading", emoji: "📚" },
  { name: "Music", emoji: "🎵" },
  { name: "Art", emoji: "🎨" },
  { name: "Photography", emoji: "📷" },
  { name: "Travel", emoji: "✈️" },
  { name: "Movies", emoji: "🎬" },
  { name: "Sports", emoji: "⚽" },
  { name: "Coding", emoji: "💻" },
  { name: "Dancing", emoji: "💃" },
  { name: "Volunteering", emoji: "🤝" },
  { name: "Fashion", emoji: "👗" },
  { name: "Esports", emoji: "🏆" },
];

export default function ProfileCreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [academics, setAcademics] = useState({
    academic_year: "",
    major: "",
    minor: "",
    gpa: "",
  });

  const [living, setLiving] = useState({
    time_sleep: "23:00",
    time_wake: "07:00",
    comfortable_temp: 70,
    noise_level: 3,
    cleanliness: 3,
    music_genre: [] as string[],
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  function toggleGenre(genre: string) {
    setLiving((prev) => ({
      ...prev,
      music_genre: prev.music_genre.includes(genre)
        ? prev.music_genre.filter((g) => g !== genre)
        : [...prev.music_genre, genre],
    }));
  }

  function toggleInterest(name: string) {
    setSelectedInterests((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      await Promise.all([
        fetch("/api/users/academics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...academics, gpa: parseFloat(academics.gpa) || null }),
        }),
        fetch("/api/users/living-style", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(living),
        }),
        fetch("/api/users/interests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interests: selectedInterests }),
        }),
      ]);
      router.push("/dashboard");
    } catch {
      setError("Something went wrong saving your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const steps = ["Academics", "Living Style", "Interests"];

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex flex-col font-sans">
      <div className="bg-[#07294d] px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-xl font-bold text-[#ffc600] tracking-wide">DragonMates</h1>
          <p className="text-blue-200 text-xs mt-0.5">Set up your profile</p>
        </div>
        <span className="text-blue-300 text-sm">Step {step} of {steps.length} — {steps[step - 1]}</span>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          <div className="flex gap-2 mb-8">
            {steps.map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full" style={{ background: i < step ? "#07294d" : "#d1d5db" }} />
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#07294d] px-6 py-4">
              <h2 className="text-white font-semibold text-lg">{steps[step - 1]}</h2>
              <p className="text-blue-300 text-sm">
                {step === 1 && "Tell us about your academic background"}
                {step === 2 && "How do you like to live at home?"}
                {step === 3 && "What are you into?"}
              </p>
            </div>

            <div className="p-6 space-y-5">
              {step === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Academic Year</label>
                      <select
                        value={academics.academic_year}
                        onChange={(e) => setAcademics({ ...academics, academic_year: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
                      >
                        <option value="">Select...</option>
                        {ACADEMIC_YEARS.map((y) => <option key={y}>{y}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">GPA (optional)</label>
                      <input
                        type="number"
                        min="0" max="4" step="0.01"
                        value={academics.gpa}
                        onChange={(e) => setAcademics({ ...academics, gpa: e.target.value })}
                        placeholder="3.50"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Major</label>
                    <select
                      value={academics.major}
                      onChange={(e) => setAcademics({ ...academics, major: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
                    >
                      <option value="">Select your major...</option>
                      {MAJORS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Minor (optional)</label>
                    <input
                      value={academics.minor}
                      onChange={(e) => setAcademics({ ...academics, minor: e.target.value })}
                      placeholder="e.g. Mathematics"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Bedtime</label>
                      <input
                        type="time"
                        value={living.time_sleep}
                        onChange={(e) => setLiving({ ...living, time_sleep: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Wake time</label>
                      <input
                        type="time"
                        value={living.time_wake}
                        onChange={(e) => setLiving({ ...living, time_wake: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Comfortable Temperature: {living.comfortable_temp}°F
                    </label>
                    <input
                      type="range" min="60" max="85" step="1"
                      value={living.comfortable_temp}
                      onChange={(e) => setLiving({ ...living, comfortable_temp: Number(e.target.value) })}
                      className="w-full accent-[#07294d]"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>60°F (cool)</span><span>85°F (warm)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Noise Level: {["Silent", "Quiet", "Moderate", "Lively", "Loud"][living.noise_level - 1]}
                    </label>
                    <input
                      type="range" min="1" max="5" step="1"
                      value={living.noise_level}
                      onChange={(e) => setLiving({ ...living, noise_level: Number(e.target.value) })}
                      className="w-full accent-[#07294d]"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Silent</span><span>Loud</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Cleanliness: {["Very Relaxed", "Relaxed", "Moderate", "Tidy", "Very Clean"][living.cleanliness - 1]}
                    </label>
                    <input
                      type="range" min="1" max="5" step="1"
                      value={living.cleanliness}
                      onChange={(e) => setLiving({ ...living, cleanliness: Number(e.target.value) })}
                      className="w-full accent-[#07294d]"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Very relaxed</span><span>Very clean</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Music Genres</label>
                    <div className="flex flex-wrap gap-2">
                      {MUSIC_GENRES.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => toggleGenre(g)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                            living.music_genre.includes(g)
                              ? "bg-[#07294d] text-white border-[#07294d]"
                              : "bg-white text-gray-600 border-gray-300 hover:border-[#07294d]"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <p className="text-sm text-gray-500">Select all that apply — this helps us find compatible roommates for you.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {INTEREST_OPTIONS.map(({ name, emoji }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleInterest(name)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition ${
                          selectedInterests.includes(name)
                            ? "bg-[#07294d] text-white border-[#07294d]"
                            : "bg-white text-gray-700 border-gray-200 hover:border-[#07294d]"
                        }`}
                      >
                        <span style={{ fontSize: 16 }}>{emoji}</span> {name}
                      </button>
                    ))}
                  </div>
                  {selectedInterests.length > 0 && (
                    <p className="text-xs text-gray-400">{selectedInterests.length} selected</p>
                  )}
                </>
              )}

              {error && (
                <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
              )}

              <div className="flex gap-3 pt-2">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex-1 border border-gray-300 text-gray-700 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="flex-1 bg-[#07294d] hover:bg-[#0a3a6e] text-white text-sm font-semibold py-2.5 rounded-lg transition"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-[#ffc600] hover:bg-[#e6b200] text-[#07294d] text-sm font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Complete Profile"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}