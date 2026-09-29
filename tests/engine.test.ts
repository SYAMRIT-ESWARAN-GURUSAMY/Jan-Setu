import { calculatePriorityScore, DistrictData } from '../src/scoring/priorityEngine';
import { calculateRequiredQuorum, evaluateVerificationStatus } from '../src/verification/quorumService';
import { evaluateFraudRules } from '../src/fraud/trustSafetyService';

describe('JAN-SETU AI Priority Engine & Logic Tests', () => {
  const mockDistrict: DistrictData = {
    code: 'NGP',
    name: 'Nagapattinam',
    population: 1617060,
    bpl_pct: 0.31,
    infra_deficit_score: 0.78,
    existing_budget_allocation: 1500000,
    estimated_reporting_capture_rate: 0.42
  };

  test('Priority formula calculates expected score and respects factor weights', () => {
    const res = calculatePriorityScore({
      id: 'WTR-NGP-004',
      citizens_affected: 47,
      urgency: 0.85,
      district_code: 'NGP'
    }, mockDistrict);

    expect(res.priority_score).toBeGreaterThan(50.0);
    expect(res.priority_score).toBeLessThanOrEqual(100.0);
    expect(res.reach_disclosure).toContain('42% capture rate');
  });

  test('Capture rate floor enforces 0.3 minimum when capture rate is low', () => {
    const lowCaptureDist = { ...mockDistrict, estimated_reporting_capture_rate: 0.15 };
    const res = calculatePriorityScore({
      id: 'WTR-NGP-LOW',
      citizens_affected: 10,
      urgency: 0.8,
      district_code: 'NGP'
    }, lowCaptureDist);

    // Capture rate clamped to 0.3, so impact = 10 / 0.3 / 1617060
    expect(res.effective_citizens_affected).toBeCloseTo(10 / 0.3 / 1617060, 6);
  });

  test('Self-extracted data preserves score while triggering review flag', () => {
    const selfExtractedDist = { ...mockDistrict, budget_confidence: 'self_extracted' };
    const res = calculatePriorityScore({
      id: 'WTR-NGP-SE',
      citizens_affected: 47,
      urgency: 0.85,
      district_code: 'NGP'
    }, selfExtractedDist);

    expect(res.has_self_extracted_data).toBe(true);
    expect(res.explanation).toContain('flagged for human review');
  });

  test('Verification quorum formula edge cases', () => {
    // 1 citizen -> LEAST(1, GREATEST(3, CEIL(0.05*1))) = LEAST(1, 3) = 1
    expect(calculateRequiredQuorum(1)).toBe(1);

    // 2 citizens -> LEAST(2, 3) = 2
    expect(calculateRequiredQuorum(2)).toBe(2);

    // 47 citizens -> LEAST(47, GREATEST(3, CEIL(0.05*47=3))) = 3
    expect(calculateRequiredQuorum(47)).toBe(3);

    // 100 citizens -> LEAST(100, GREATEST(3, CEIL(0.05*100=5))) = 5
    expect(calculateRequiredQuorum(100)).toBe(5);

    // 200 citizens -> 10
    expect(calculateRequiredQuorum(200)).toBe(10);
  });

  test('Photo evidence human review requirement before verified status', () => {
    // Quorum reached but no photos approved -> human_photo_review
    const state1 = evaluateVerificationStatus('WTR-NGP-004', 47, 5, []);
    expect(state1.quorumReached).toBe(true);
    expect(state1.isFullyVerified).toBe(false);
    expect(state1.statusText).toContain('HUMAN PHOTO REVIEW');

    // Quorum reached AND 1 photo human-approved -> VERIFIED OUTCOME
    const state2 = evaluateVerificationStatus('WTR-NGP-004', 47, 5, [{ human_review_status: 'approved' }]);
    expect(state2.isFullyVerified).toBe(true);
    expect(state2.statusText).toBe('VERIFIED OUTCOME');
  });

  test('Fraud rule flags duplicate submissions with high Levenshtein similarity', () => {
    const newCmp = {
      id: 'cmp_new',
      citizen_id: 'cit_99',
      district_code: 'NGP',
      category: 'Water',
      translated_text: 'Drinking water pipeline is broken in our area and water is leaking.',
      geo_hash: 'tf3x9a',
      created_at: new Date().toISOString()
    };

    const prevCmp = {
      id: 'cmp_prev',
      citizen_id: 'cit_88',
      district_code: 'NGP',
      category: 'Water',
      translated_text: 'Drinking water pipeline is broken in our area and water is leaking badly.',
      geo_hash: 'tf3x9a',
      created_at: new Date(Date.now() - 300000).toISOString() // 5 min ago
    };

    const evalRes = evaluateFraudRules(newCmp, [prevCmp]);
    expect(evalRes.isFlagged).toBe(true);
    expect(evalRes.flagType).toBe('duplicate_text');
  });
});
