"use client";

import { useState } from "react";
const defaultPrefs = {
  sleepSchedule: "",
  cleanliness: "",
  noise: "",
  guests: "",
  pets: "",
  interests: "",
};
export default function PreferencesPage() {}
  const [prefs, setPrefs] = useState({ ...defaultPrefs });
  const [savedProfile, setSavedProfile] = useState<null | typeof defaultPrefs>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [saveMsg, setSaveMsg] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) {
    setPrefs({ ...prefs, [e.target.name]: e.target.value });
  }

  function savePreferences() {
    localStorage.setItem("roommatePrefs", JSON.stringify(prefs));
    setSaveMsg("Preferences saved!");
    setSavedProfile(null);
    setMatchScore(null);
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