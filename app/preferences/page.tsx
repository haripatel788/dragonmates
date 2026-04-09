"use client";

import { useState } from "react";

const defaultPrefs = {
  sleepSchedule: "",
  cleanliness: "",
  noise: "",
  guests: "",
  socialBattery: "",
  pets: "",
  interests: "",
};

export default function PreferencesPage() {
 const [prefs, setPrefs] = useState({ ...defaultPrefs });
const [savedProfile, setSavedProfile] = useState<null | typeof defaultPrefs>(null);
const [matchScore, setMatchScore] = useState<number | null>(null);
const [saveMsg, setSaveMsg] = useState("");
const [lastSaved, setLastSaved] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) {
    setPrefs({ ...prefs, [e.target.name]: e.target.value });
  }

  function savePreferences() {
  localStorage.setItem("roommatePrefs", JSON.stringify(prefs));
  const time = new Date().toLocaleString("en-US", { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
  localStorage.setItem("roommatePrefsTime", time);
  setLastSaved(time);
  setSaveMsg("Preferences saved!");
}
  }

  function loadPreferences() {
    const saved = localStorage.getItem("roommatePrefs");
    if (!saved) {
      setSaveMsg("No saved preferences found.");
      return;
    }
    const parsed = JSON.parse(saved);
    setPrefs(parsed);
    setSavedProfile(parsed);
    setMatchScore(Math.floor(Math.random() * 40) + 60);
    setSaveMsg("");
  }

  const fields = [
    {
      label: "Sleep Schedule",
      name: "sleepSchedule",
      options: [
        { value: "", label: "Select..." },
        { value: "early", label: "Early Sleeper" },
        { value: "middle", label: "Normal" },
        { value: "late", label: "Night Owl" },
      ],
    },
    {
      label: "Cleanliness",
      name: "cleanliness",
      options: [
        { value: "", label: "Select..." },
        { value: "low", label: "Relaxed" },
        { value: "medium", label: "Moderate" },
        { value: "high", label: "Very Clean" },
      ],
    },
    {
      label: "Noise Preference",
      name: "noise",
      options: [
        { value: "", label: "Select..." },
        { value: "quiet", label: "Quiet" },
        { value: "moderate", label: "Moderate" },
        { value: "loud", label: "Loud / Social" },
      ],
    },
    {
      label: "Guests",
      name: "guests",
      options: [
        { value: "", label: "Select..." },
        { value: "rare", label: "Rarely" },
        { value: "sometimes", label: "Sometimes" },
        { value: "often", label: "Often" },
      ],
    },
    {
      label: "Social Battery",
      name: "socialBattery",
      options: [
        { value: "", label: "Select..." },
        { value: "introverted", label: "Introverted" },
        { value: "ambivert", label: "Ambivert" },
        { value: "extroverted", label: "Extroverted" },
      ],
    },
    {
      label: "Pets",
      name: "pets",
      options: [
        { value: "", label: "Select..." },
        { value: "no", label: "No Pets" },
        { value: "maybe", label: "Maybe" },
        { value: "yes", label: "I Have / Want Pets" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-sans">

      {/* Header */}
      <div className="bg-[#07294d] px-8 py-5 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-[#ffc600] tracking-wide">Dragonmates</h1>
          <p className="text-blue-200 text-sm mt-0.5">Find your perfect roommate match</p>
        </div>
        <span className="text-blue-300 text-sm font-medium">Living Style & Preferences</span>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#07294d] px-6 py-4">
            <h2 className="text-white font-semibold text-lg">Your Living Preferences</h2>
            <p className="text-blue-300 text-sm">Tell us how you like to live</p>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {fields.map(({ label, name, options }) => (
              <div key={name}>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5">
                  {label}
                </label>
                <select
                  name={name}
                  value={prefs[name as keyof typeof prefs]}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600] focus:border-transparent transition"
                >
                  {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            ))}

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1.5">
                Interests
              </label>
              <input
                type="text"
                name="interests"
                value={prefs.interests}
                onChange={handleChange}
                placeholder="e.g. gaming, gym, cooking, hiking..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ffc600] focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={savePreferences}
              className="flex-1 bg-[#07294d] hover:bg-[#0a3a6e] text-white text-sm font-semibold py-2.5 rounded-lg transition shadow-sm"
            >
              Save Preferences
            </button>
            <button
              onClick={loadPreferences}
              className="flex-1 bg-[#ffc600] hover:bg-[#e6b200] text-[#07294d] text-sm font-semibold py-2.5 rounded-lg transition shadow-sm"
            >
              Load Saved
            </button>
          </div>

          {saveMsg && (
            <div className="mx-6 mb-6 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
              {saveMsg}
            </div>
          )}
        </div>

        {/* Saved Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#07294d] px-6 py-4">
            <h2 className="text-white font-semibold text-lg">Your Saved Profile</h2>
          </div>
          <div className="p-6">
            {savedProfile ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Sleep", value: savedProfile.sleepSchedule },
                  { label: "Cleanliness", value: savedProfile.cleanliness },
                  { label: "Noise", value: savedProfile.noise },
                  { label: "Guests", value: savedProfile.guests },
                  { label: "Social Battery", value: savedProfile.socialBattery },
                  { label: "Pets", value: savedProfile.pets },
                  { label: "Interests", value: savedProfile.interests },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm text-gray-700 capitalize">{value || "—"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No profile saved yet. Fill out the form and hit Save.</p>
            )}
          </div>
        </div>

        {/* Match Score Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#07294d] px-6 py-4">
            <h2 className="text-white font-semibold text-lg">Matching Result</h2>
          </div>
          <div className="p-6">
            {matchScore !== null ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#ffc600] flex items-center justify-center shadow">
                  <span className="text-[#07294d] font-bold text-lg">{matchScore}%</span>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Compatibility Score</p>
                  <p className="text-gray-400 text-sm">Stub example — real matching coming soon</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Load your saved preferences to see your match score.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}