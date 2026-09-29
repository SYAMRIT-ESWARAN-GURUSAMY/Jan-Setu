"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLevenshteinSimilarity = getLevenshteinSimilarity;
exports.evaluateFraudRules = evaluateFraudRules;
/**
 * Calculates Levenshtein Distance similarity ratio between two strings [0.0 - 1.0]
 */
function getLevenshteinSimilarity(str1, str2) {
    const s1 = str1.trim().toLowerCase();
    const s2 = str2.trim().toLowerCase();
    if (s1 === s2)
        return 1.0;
    if (!s1.length || !s2.length)
        return 0.0;
    const track = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
    for (let i = 0; i <= s1.length; i += 1)
        track[0][i] = i;
    for (let j = 0; j <= s2.length; j += 1)
        track[j][0] = j;
    for (let j = 1; j <= s2.length; j += 1) {
        for (let i = 1; i <= s1.length; i += 1) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(track[j][i - 1] + 1, // deletion
            track[j - 1][i] + 1, // insertion
            track[j - 1][i - 1] + indicator // substitution
            );
        }
    }
    const distance = track[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    return 1.0 - (distance / maxLength);
}
function evaluateFraudRules(newComplaint, recentComplaints) {
    const newTime = new Date(newComplaint.created_at).getTime();
    // Rule 1: Duplicate Text check (within 10 minutes, different citizen ID, Levenshtein >= 0.92)
    for (const prev of recentComplaints) {
        if (prev.citizen_id === newComplaint.citizen_id)
            continue;
        const prevTime = new Date(prev.created_at).getTime();
        const timeDiffMin = Math.abs(newTime - prevTime) / (1000 * 60);
        if (timeDiffMin <= 10) {
            const sim = getLevenshteinSimilarity(newComplaint.translated_text, prev.translated_text);
            if (sim >= 0.92) {
                return {
                    isFlagged: true,
                    flagType: 'duplicate_text',
                    reason: `Possible duplicate submission (Similarity: ${(sim * 100).toFixed(1)}% with complaint ${prev.id} within 10 min. Build-time threshold based on informal testing.)`
                };
            }
        }
    }
    // Rule 2: Velocity Flooding check
    // Filter complaints within last 10 minutes matching category + geo_hash
    const last10MinMatches = recentComplaints.filter(c => {
        const t = new Date(c.created_at).getTime();
        const minDiff = Math.abs(newTime - t) / (1000 * 60);
        return minDiff <= 10 && c.category === newComplaint.category && c.geo_hash === newComplaint.geo_hash;
    });
    if (last10MinMatches.length + 1 > 5) {
        // Check duplicate text ratio or fresh accounts ratio (>70% created < 1 hr)
        let duplicatesInGroup = 0;
        let freshAccountsCount = 0;
        const group = [...last10MinMatches, newComplaint];
        for (let i = 0; i < group.length; i++) {
            if ((group[i].account_age_hours || 24) < 1.0) {
                freshAccountsCount++;
            }
            for (let j = i + 1; j < group.length; j++) {
                if (getLevenshteinSimilarity(group[i].translated_text, group[j].translated_text) >= 0.85) {
                    duplicatesInGroup++;
                    break;
                }
            }
        }
        const dupRatio = duplicatesInGroup / group.length;
        const freshRatio = freshAccountsCount / group.length;
        if (dupRatio > 0.6 || freshRatio > 0.7) {
            return {
                isFlagged: true,
                flagType: 'velocity_flooding',
                reason: `Possible coordinated flooding (${group.length} complaints in 10 min for ${newComplaint.category} at ${newComplaint.geo_hash}. Duplicate text ratio: ${(dupRatio * 100).toFixed(0)}%, Fresh accounts (<1h): ${(freshRatio * 100).toFixed(0)}%.)`
            };
        }
    }
    return { isFlagged: false, flagType: null, reason: null };
}
