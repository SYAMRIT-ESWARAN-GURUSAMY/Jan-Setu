"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePriorityScore = calculatePriorityScore;
/**
 * Normalizes effective citizens ratio to a [0, 1] factor.
 * Using a realistic upper bound for district-level impact (e.g. 0.005 of population).
 */
function normalizeEffectiveImpact(effectiveRatio) {
    const maxExpectedRatio = 0.005; // 0.5% effective coverage is high impact
    return Math.min(1.0, Math.max(0.0, effectiveRatio / maxExpectedRatio));
}
/**
 * Normalizes budget allocation (0 to 10M INR scale) to [0, 1]
 */
function normalizeBudget(budget) {
    const maxBudget = 10000000; // 10 Million INR baseline
    return Math.min(1.0, Math.max(0.0, budget / maxBudget));
}
function calculatePriorityScore(cluster, district) {
    // Enforce floor on capture rate
    const capture_rate = Math.max(district.estimated_reporting_capture_rate, 0.3);
    // Formula part 1: effective_citizens_affected
    const effective_citizens_affected = cluster.citizens_affected / capture_rate / Math.max(district.population, 1);
    const effective_impact_norm = normalizeEffectiveImpact(effective_citizens_affected);
    // Formula part 2: components
    const infra_deficit = Math.min(1.0, Math.max(0.0, district.infra_deficit_score));
    const budget_norm = normalizeBudget(district.existing_budget_allocation);
    const budget_gap_norm = 1.0 - budget_norm;
    const bpl_pct = Math.min(1.0, Math.max(0.0, district.bpl_pct));
    const urgency_norm = Math.min(1.0, Math.max(0.0, cluster.urgency));
    // Weighted factor contributions
    const factor_citizen_impact = 0.30 * effective_impact_norm;
    const factor_infra_deficit = 0.25 * infra_deficit;
    const factor_investment_gap = 0.20 * budget_gap_norm;
    const factor_equity_bpl = 0.15 * bpl_pct;
    const factor_urgency = 0.10 * urgency_norm;
    const raw_score = factor_citizen_impact + factor_infra_deficit + factor_investment_gap + factor_equity_bpl + factor_urgency;
    const priority_score = Math.round(raw_score * 1000) / 10; // e.g. 82.4
    // Check self-extracted data flag
    const has_self_extracted_data = district.bpl_pct_confidence === 'self_extracted' ||
        district.infra_deficit_confidence === 'self_extracted' ||
        district.budget_confidence === 'self_extracted';
    // Construct deterministic explanation strictly from calculated values
    const impactCount = Math.round(cluster.citizens_affected / capture_rate);
    const capturePct = Math.round(district.estimated_reporting_capture_rate * 100);
    const bplPctFormatted = Math.round(district.bpl_pct * 100);
    const explanation = `Priority score (${priority_score.toFixed(1)}/100) is driven by ${cluster.citizens_affected} reported citizens (${impactCount} estimated effective impact at ${capturePct}% capture rate), combined with an infrastructure deficit index of ${infra_deficit.toFixed(2)}, an existing budget gap factor of ${(budget_gap_norm * 100).toFixed(0)}%, and a district BPL percentage of ${bplPctFormatted}%.` +
        (has_self_extracted_data ? ` [Note: Unverified data sources detected — flagged for human review before funding allocation.]` : ``);
    const reach_disclosure = `Reach-adjusted estimate (${capturePct}% capture rate) — structurally uncertain, disclosed for equity transparency.`;
    return {
        effective_citizens_affected,
        effective_impact_norm,
        infra_deficit,
        budget_gap_norm,
        bpl_pct,
        urgency_norm,
        factor_citizen_impact,
        factor_infra_deficit,
        factor_investment_gap,
        factor_equity_bpl,
        factor_urgency,
        raw_score,
        priority_score,
        has_self_extracted_data,
        explanation,
        reach_disclosure
    };
}
