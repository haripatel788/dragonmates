"use client";

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  home_town: string;
  home_state: string;
  avatar_url: string;
  academics: Array<{
    academic_year: string;
    major: string;
    minor: string;
    gpa: number;
  }>;
  living_style: Array<{
    time_sleep: string;
    time_wake: string;
    comfortable_temp: number;
    noise_level: number;
    cleanliness: number;
    music_genre: string[];
  }>;
  interests: Array<{
    interests: string[];
  }>;
}

const AVATAR_COLORS = [
  "from-blue-500 to-cyan-600",
  "from-amber-500 to-yellow-500",
  "from-blue-600 to-indigo-600",
  "from-amber-600 to-orange-500",
  "from-blue-400 to-cyan-500",
  "from-amber-400 to-yellow-600",
];

const MOCK_PROFILES: Profile[] = [
  {
    id: "1",
    email: "alex.johnson@university.edu",
    first_name: "Alex",
    last_name: "Johnson",
    home_town: "Boston",
    home_state: "Massachusetts",
    avatar_url: "AJ",
    academics: [
      {
        academic_year: "Sophomore",
        major: "Computer Science",
        minor: "Mathematics",
        gpa: 3.8,
      },
    ],
    living_style: [
      {
        time_sleep: "23:30",
        time_wake: "07:00",
        comfortable_temp: 72,
        noise_level: 3,
        cleanliness: 4,
        music_genre: ["Lo-fi", "Classical", "Jazz"],
      },
    ],
    interests: [
      {
        interests: ["Coding", "Gaming", "Reading"],
      },
    ],
  },
  {
    id: "2",
    email: "sarah.smith@university.edu",
    first_name: "Sarah",
    last_name: "Smith",
    home_town: "New York",
    home_state: "New York",
    avatar_url: "SS",
    academics: [
      {
        academic_year: "Junior",
        major: "Business Administration",
        minor: "Marketing",
        gpa: 3.6,
      },
    ],
    living_style: [
      {
        time_sleep: "22:00",
        time_wake: "06:30",
        comfortable_temp: 70,
        noise_level: 2,
        cleanliness: 5,
        music_genre: ["Pop", "R&B", "Hip-Hop"],
      },
    ],
    interests: [
      {
        interests: ["Gym / Fitness", "Fashion", "Cooking"],
      },
    ],
  },
  {
    id: "3",
    email: "jordan.lee@university.edu",
    first_name: "Jordan",
    last_name: "Lee",
    home_town: "Los Angeles",
    home_state: "California",
    avatar_url: "JL",
    academics: [
      {
        academic_year: "Freshman",
        major: "Environmental Science",
        minor: "",
        gpa: 3.7,
      },
    ],
    living_style: [
      {
        time_sleep: "23:00",
        time_wake: "08:00",
        comfortable_temp: 75,
        noise_level: 4,
        cleanliness: 3,
        music_genre: ["Indie", "Electronic", "Rock"],
      },
    ],
    interests: [
      {
        interests: ["Hiking", "Photography", "Travel"],
      },
    ],
  },
];

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

export default function ExplorePage() {
  function getInterestEmoji(name: string): string {
    return INTEREST_OPTIONS.find((opt) => opt.name === name)?.emoji || "";
  }

  function getAvatarColor(id: string): string {
    const index = parseInt(id) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            DragonMates roommate preview
          </div>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white">Browse verified campus roommates</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Compare student profiles, shared routines, and lifestyle preferences to find the best match for your next housing term.
          </p>
        </div>

        {MOCK_PROFILES.length === 0 ? (
          <div className="rounded-3xl border border-blue-800 bg-slate-900/80 p-10 text-center text-blue-200">
            No roommate profiles are available at the moment.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {MOCK_PROFILES.map((profile) => (
              <div
                key={profile.id}
                className="rounded-[28px] border border-blue-700/40 bg-slate-900/95 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.9)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_-30px_rgba(15,23,42,0.9)]"
              >
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-950/40">
                  <span className="text-3xl font-semibold">{profile.avatar_url}</span>
                </div>

                <h2 className="text-2xl font-semibold text-white">{profile.first_name} {profile.last_name}</h2>
                <p className="mt-2 text-sm text-slate-400">{profile.home_town}, {profile.home_state}</p>

                <div className="mt-6 rounded-3xl border border-blue-700/30 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-300">Academic snapshot</p>
                  <p className="mt-3 text-sm text-white">{profile.academics[0].academic_year} · {profile.academics[0].major}</p>
                  {profile.academics[0].minor && <p className="mt-2 text-sm text-slate-400">Minor: {profile.academics[0].minor}</p>}
                  <p className="mt-2 text-sm text-slate-400">GPA {profile.academics[0].gpa.toFixed(2)}</p>
                </div>

                <div className="mt-6 grid gap-2">
                  <div className="text-xs uppercase tracking-[0.18em] text-amber-300">Shared interests</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests[0].interests.map((interest) => (
                      <span key={interest} className="rounded-full border border-blue-700/40 bg-blue-950/70 px-3 py-1 text-sm text-slate-200">
                        {getInterestEmoji(interest)} {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
