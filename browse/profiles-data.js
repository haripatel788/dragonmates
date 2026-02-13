/**
 * Profile data with full structure for match scoring.
 * dealbreakers + scores (1-5) + personal must match roommatePrefs format.
 */
const PROFILES_RAW = {
    '1': {
        name: 'Alex Chen',
        major: 'Computer Science',
        year: 'sophomore',
        about: "CS student who loves late-night coding sessions. Looking for a roommate who's cool with occasional gaming and respects quiet study hours.",
        hobbies: ['gaming', 'coding', 'music'],
        dealbreakers: { smoking: 'no', pets: 'okay', budgetMin: 700, budgetMax: 900, moveInDate: '2025-09-01', coopCycle: 'fall-winter', leaseLength: 12, roomType: 'private' },
        scores: { cleanliness: 5, sleepSchedule: 5, noiseTolerance: 3, guestsFrequency: 3, cookingHabits: 3, timeAtHome: 4, temperaturePref: 2, gymInterest: 3, mediaInterest: 4 },
        personal: { major: 'Computer Science', year: 'sophomore', hobbies: ['gaming', 'coding', 'music'], personality: 'ambivert' }
    },
    '2': {
        name: 'Jordan Taylor',
        major: 'Business',
        year: 'junior',
        about: "Busy business student who values a clean, organized space. Early riser—looking for someone with similar habits.",
        hobbies: ['fitness', 'movies', 'cooking'],
        dealbreakers: { smoking: 'no', pets: 'not-okay', budgetMin: 600, budgetMax: 800, moveInDate: '2025-08-01', coopCycle: 'spring-summer', leaseLength: 12, roomType: 'shared' },
        scores: { cleanliness: 4, sleepSchedule: 2, noiseTolerance: 2, guestsFrequency: 2, cookingHabits: 4, timeAtHome: 3, temperaturePref: 3, gymInterest: 4, mediaInterest: 3 },
        personal: { major: 'Business', year: 'junior', hobbies: ['fitness', 'movies', 'cooking'], personality: 'introvert' }
    },
    '3': {
        name: 'Sam Rivera',
        major: 'Engineering',
        year: 'senior',
        about: "Engineering senior, coop schedule. Love staying active and outdoors. Pretty relaxed about noise and guests.",
        hobbies: ['sports', 'outdoors', 'music'],
        dealbreakers: { smoking: 'outside', pets: 'have', budgetMin: 800, budgetMax: 1000, moveInDate: '2025-09-01', coopCycle: 'fall-winter', leaseLength: 12, roomType: 'private' },
        scores: { cleanliness: 4, sleepSchedule: 3, noiseTolerance: 4, guestsFrequency: 5, cookingHabits: 3, timeAtHome: 2, temperaturePref: 2, gymInterest: 5, mediaInterest: 4 },
        personal: { major: 'Engineering', year: 'senior', hobbies: ['sports', 'outdoors', 'music'], personality: 'extrovert' }
    },
    '4': {
        name: 'Morgan Lee',
        major: 'Design',
        year: 'freshman',
        about: "Design major, creative soul. Need a calm space to work on projects. Night owl who appreciates good vibes.",
        hobbies: ['art', 'photography', 'reading'],
        dealbreakers: { smoking: 'no', pets: 'not-okay', budgetMin: 650, budgetMax: 850, moveInDate: '2025-09-01', coopCycle: 'fall-winter', leaseLength: 12, roomType: 'private' },
        scores: { cleanliness: 5, sleepSchedule: 5, noiseTolerance: 2, guestsFrequency: 3, cookingHabits: 2, timeAtHome: 4, temperaturePref: 4, gymInterest: 2, mediaInterest: 3 },
        personal: { major: 'Design', year: 'freshman', hobbies: ['art', 'photography', 'reading'], personality: 'introvert' }
    },
    '5': {
        name: 'Casey Johnson',
        major: 'Biology',
        year: 'junior',
        about: "Pre-med, study-focused. Early to bed, early to rise. Looking for a respectful, low-drama roommate.",
        hobbies: ['fitness', 'outdoors', 'cooking'],
        dealbreakers: { smoking: 'no', pets: 'okay', budgetMin: 700, budgetMax: 900, moveInDate: '2025-08-01', coopCycle: 'spring-summer', leaseLength: 12, roomType: 'shared' },
        scores: { cleanliness: 4, sleepSchedule: 2, noiseTolerance: 2, guestsFrequency: 2, cookingHabits: 4, timeAtHome: 3, temperaturePref: 3, gymInterest: 5, mediaInterest: 2 },
        personal: { major: 'Biology', year: 'junior', hobbies: ['fitness', 'outdoors', 'cooking'], personality: 'introvert' }
    },
    '6': {
        name: 'Riley Davis',
        major: 'Computer Science',
        year: 'sophomore',
        about: "CS sophomore, gamer and coder. Chill vibes, love movies and gaming nights. Respectful of shared space.",
        hobbies: ['gaming', 'coding', 'movies'],
        dealbreakers: { smoking: 'no', pets: 'okay', budgetMin: 600, budgetMax: 800, moveInDate: '2025-09-01', coopCycle: 'fall-winter', leaseLength: 12, roomType: 'shared' },
        scores: { cleanliness: 4, sleepSchedule: 3, noiseTolerance: 3, guestsFrequency: 3, cookingHabits: 3, timeAtHome: 4, temperaturePref: 2, gymInterest: 3, mediaInterest: 5 },
        personal: { major: 'Computer Science', year: 'sophomore', hobbies: ['gaming', 'coding', 'movies'], personality: 'ambivert' }
    }
};

const LABELS = {
    sleepSchedule: ['', 'Early bird', 'Slightly early', 'Moderate', 'Slightly late', 'Night owl'],
    noiseTolerance: ['', 'Very quiet', 'Quiet', 'Moderate', 'Some noise OK', 'Loud / Social'],
    cleanliness: ['', 'Relaxed', 'Casual', 'Moderate', 'Clean', 'Very clean'],
    guestsFrequency: ['', 'Rarely', 'Sometimes', 'Moderate', 'Often', 'Very often'],
    cookingHabits: ['', 'Rarely cook', 'Sometimes', 'Moderate', 'Often', 'Every day'],
    timeAtHome: ['', 'Always out', 'Often out', 'Moderate', 'Often home', 'Always home'],
    temperaturePref: ['', 'Very cold', 'Cool', 'Moderate', 'Warm', 'Very warm'],
    gymInterest: ['', 'None', 'Low', 'Moderate', 'Active', 'Very active'],
    mediaInterest: ['', 'None', 'Low', 'Moderate', 'High', 'Very high'],
    year: { freshman: 'Freshman', sophomore: 'Sophomore', junior: 'Junior', senior: 'Senior' },
    pets: { have: 'Have pets', okay: 'Okay with pets', 'not-okay': 'Not okay with pets' },
    smoking: { yes: 'Yes', no: 'No', outside: 'Outside only' }
};

function formatProfileForDisplay(p) {
    const s = p.scores || {};
    return {
        ...p,
        year: LABELS.year[p.year] || p.year,
        sleepSchedule: LABELS.sleepSchedule[s.sleepSchedule] || '—',
        noiseLevel: LABELS.noiseTolerance[s.noiseTolerance] || '—',
        cleanliness: LABELS.cleanliness[s.cleanliness] || '—',
        guests: LABELS.guestsFrequency[s.guestsFrequency] || '—',
        cookingHabits: LABELS.cookingHabits[s.cookingHabits] || '—',
        timeAtHome: LABELS.timeAtHome[s.timeAtHome] || '—',
        temperaturePref: LABELS.temperaturePref[s.temperaturePref] || '—',
        personality: p.personal?.personality ? p.personal.personality.charAt(0).toUpperCase() + p.personal.personality.slice(1) : '—',
        gymInterest: LABELS.gymInterest[s.gymInterest] || '—',
        mediaInterest: LABELS.mediaInterest[s.mediaInterest] || '—',
        budget: p.dealbreakers?.budgetMin || p.dealbreakers?.budgetMax
            ? `$${p.dealbreakers.budgetMin || '?'}–$${p.dealbreakers.budgetMax || '?'}/month`
            : '—',
        moveInDate: p.dealbreakers?.moveInDate ? new Date(p.dealbreakers.moveInDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—',
        leaseDuration: p.dealbreakers?.leaseLength ? `${p.dealbreakers.leaseLength} months` : '—',
        coopCycle: p.dealbreakers?.coopCycle ? p.dealbreakers.coopCycle.replace('-', '–') : '—',
        roomType: p.dealbreakers?.roomType ? p.dealbreakers.roomType.charAt(0).toUpperCase() + p.dealbreakers.roomType.slice(1) : '—',
        smoking: p.dealbreakers?.smoking ? LABELS.smoking[p.dealbreakers.smoking] || p.dealbreakers.smoking : '—',
        pets: p.dealbreakers?.pets ? LABELS.pets[p.dealbreakers.pets] || p.dealbreakers.pets : '—'
    };
}
