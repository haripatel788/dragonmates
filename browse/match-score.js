/**
 * DragonMates Match Score Algorithm (0–100)
 * Lifestyle = 70%
 * Interests = 30%
 * Dealbreakers fail → 0
 */

const LIFESTYLE_WEIGHTS = {
    cleanliness: 15,
    sleepSchedule: 12,
    noiseTolerance: 10,
    guestsFrequency: 10,
    cookingHabits: 8,
    timeAtHome: 15,
    temperaturePref: 10
  };
  
  const LIFESTYLE_TARGET = 70;
  const INTEREST_CAP = 30;
  
  const YEAR_ORDER = ["freshman", "sophomore", "junior", "senior"];
  
  function yearDiff(a, b) {
    const ia = YEAR_ORDER.indexOf((a || "").toLowerCase());
    const ib = YEAR_ORDER.indexOf((b || "").toLowerCase());
    if (ia < 0 || ib < 0) return 2;
    return Math.abs(ia - ib);
  }
  
  function checkDealbreakers(me, other) {
    const db1 = me.dealbreakers || {};
    const db2 = other.dealbreakers || {};
  
    const has = v => v != null && String(v).trim() !== "";
  
    if (has(db1.smoking) && has(db2.smoking)) {
      if (db1.smoking === "no" && db2.smoking !== "no") return false;
    }
  
    if (has(db1.roomType) && has(db2.roomType) && db1.roomType !== db2.roomType) return false;
  
    return true;
  }
  
  function lifestyleScore(me, other) {
    const s1 = me.scores || {};
    const s2 = other.scores || {};
  
    let earned = 0;
    let total = 0;
  
    for (const [key, weight] of Object.entries(LIFESTYLE_WEIGHTS)) {
      const v1 = parseInt(s1[key], 10);
      const v2 = parseInt(s2[key], 10);
  
      if (!Number.isFinite(v1) || !Number.isFinite(v2) || v1 === 0 || v2 === 0) continue;
  
      const sim = Math.max(0, 1 - Math.abs(v1 - v2) / 4);
      earned += weight * sim;
      total += weight;
    }
  
    if (total === 0) return LIFESTYLE_TARGET * 0.5;
  
    return (earned / total) * LIFESTYLE_TARGET;
  }
  
  function interestScore(me, other) {
    const p1 = me.personal || {};
    const p2 = other.personal || {};
    let score = 0;
  
    if (p1.major && p2.major && p1.major.toLowerCase() === p2.major.toLowerCase()) score += 7;
  
    const yd = yearDiff(p1.year, p2.year);
    if (yd === 0) score += 4;
    else if (yd === 1) score += 3;
  
    const h1 = new Set((p1.hobbies || []).map(h => h.toLowerCase()));
    const h2 = new Set((p2.hobbies || []).map(h => h.toLowerCase()));
  
    let shared = 0;
    h1.forEach(h => { if (h2.has(h)) shared++; });
    score += Math.min(shared * 2, 8);
  
    const g1 = parseInt(me.scores?.gymInterest, 10);
    const g2 = parseInt(other.scores?.gymInterest, 10);
    if (Number.isFinite(g1) && Number.isFinite(g2) && Math.abs(g1 - g2) <= 1) score += 3;
  
    const per1 = (p1.personality || "").toLowerCase();
    const per2 = (p2.personality || "").toLowerCase();
    if (per1 && per2 && per1 === per2) score += 4;
  
    return Math.min(score, INTEREST_CAP);
  }
  
  function calculateMatchScore(me, other) {
    if (!checkDealbreakers(me, other)) return 0;
  
    const lifestyle = lifestyleScore(me, other);
    const interest = interestScore(me, other);
  
    return Math.round(lifestyle + interest);
  }
  