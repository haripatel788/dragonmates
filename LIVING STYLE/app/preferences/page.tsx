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
  