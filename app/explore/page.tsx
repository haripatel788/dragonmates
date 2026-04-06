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
  {
    id: "4",
    email: "taylor.brown@university.edu",
    first_name: "Taylor",
    last_name: "Brown",
    home_town: "Chicago",
    home_state: "Illinois",
    avatar_url: "TB",
    academics: [
      {
        academic_year: "Senior",
        major: "Psychology",
        minor: "",
        gpa: 3.5,
      },
    ],
    living_style: [
      {
        time_sleep: "22:30",
        time_wake: "07:30",
        comfortable_temp: 68,
        noise_level: 2,
        cleanliness: 4,
        music_genre: ["Classical", "Jazz", "Country"],
      },
    ],
    interests: [
      {
        interests: ["Reading", "Volunteering", "Music"],
      },
    ],
  },
  {
    id: "5",
    email: "morgan.davis@university.edu",
    first_name: "Morgan",
    last_name: "Davis",
    home_town: "Seattle",
    home_state: "Washington",
    avatar_url: "MD",
    academics: [
      {
        academic_year: "Junior",
        major: "Software Engineering",
        minor: "Physics",
        gpa: 3.9,
      },
    ],
    living_style: [
      {
        time_sleep: "23:00",
        time_wake: "07:00",
        comfortable_temp: 69,
        noise_level: 3,
        cleanliness: 4,
        music_genre: ["Electronic", "Lo-fi", "Hip-Hop"],
      },
    ],
    interests: [
      {
        interests: ["Coding", "Esports", "Gym / Fitness"],
      },
    ],
  },
  {
    id: "6",
    email: "casey.wilson@university.edu",
    first_name: "Casey",
    last_name: "Wilson",
    home_town: "Austin",
    home_state: "Texas",
    avatar_url: "CW",
    academics: [
      {
        academic_year: "Sophomore",
        major: "Music",
        minor: "Art",
        gpa: 3.4,
      },
    ],
    living_style: [
      {
        time_sleep: "23:30",
        time_wake: "08:00",
        comfortable_temp: 74,
        noise_level: 5,
        cleanliness: 2,
        music_genre: ["Rock", "Indie", "Country"],
      },
    ],
    interests: [
      {
        interests: ["Music", "Art", "Dancing"],
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">Find Your Dragon Mate</h1>
          <p className="text-blue-300 text-lg">Discover compatible roommates and build lasting connections</p>
        </div>

        {MOCK_PROFILES.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-blue-300 text-lg">No profiles available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PROFILES.map((profile) => (
              <div
                key={profile.id}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all overflow-hidden border border-amber-500/30"
              >
                {/* Profile Avatar Header */}
                <div className={`h-32 bg-gradient-to-br ${getAvatarColor(profile.id)} flex items-center justify-center`}>
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/40">
                    <span className="text-4xl font-bold text-white">{profile.avatar_url}</span>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="p-5">
                  <h2 className="text-xl font-bold text-white">
                    {profile.first_name} {profile.last_name}
                  </h2>

                  <div className="mt-2 text-sm text-blue-300">
                    {profile.home_town && profile.home_state && (
                      <p>📍 {profile.home_town}, {profile.home_state}</p>
                    )}
                  </div>

                  {/* Academics */}
                  {profile.academics && profile.academics[0] && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <p className="text-sm font-semibold text-amber-300">
                        {profile.academics[0].academic_year}
                      </p>
                      <p className="text-sm text-slate-400">{profile.academics[0].major}</p>
                    </div>
                  )}

                  {/* Interests Preview */}
                  {profile.interests && profile.interests[0] && profile.interests[0].interests.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <p className="text-xs font-semibold text-amber-300 mb-2">Interests</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.interests[0].interests.slice(0, 3).map((interest) => (
                          <span key={interest} className="text-lg">
                            {getInterestEmoji(interest)}
                          </span>
                        ))}
                        {profile.interests[0].interests.length > 3 && (
                          <span className="text-xs text-slate-500 ml-1">
                            +{profile.interests[0].interests.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <button className="mt-4 w-full bg-gradient-to-r from-blue-600 to-amber-500 text-white py-2 rounded-lg hover:from-blue-700 hover:to-amber-600 transition font-semibold text-sm">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
