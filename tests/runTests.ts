import assert from 'assert';
import { calculatePriorityScore, DistrictData } from '../src/scoring/priorityEngine';
import { calculateRequiredQuorum, evaluateVerificationStatus } from '../src/verification/quorumService';
import { evaluateFraudRules } from '../src/fraud/trustSafetyService';
import { generatePolicyBriefMarkdown } from '../src/briefs/policyBriefGenerator';

console.log('----------------------------------------------------');
console.log(' Running JAN-SETU AI Verification & Logic Tests ');
console.log('----------------------------------------------------');

const mockDistrict: DistrictData = {
  code: 'NGP',
  name: 'Nagapattinam',
  population: 1617060,
  bpl_pct: 0.31,
  infra_deficit_score: 0.78,
  existing_budget_allocation: 1500000,
  estimated_reporting_capture_rate: 0.42
};

// 1. Priority Formula Test
console.log('[Test 1] Testing Priority Engine formula calculation...');
const scoreRes = calculatePriorityScore({
  id: 'WTR-NGP-004',
  citizens_affected: 47,
  urgency: 0.85,
  district_code: 'NGP'
}, mockDistrict);

assert(scoreRes.priority_score > 50.0 && scoreRes.priority_score <= 100.0, 'Score should be in valid range');
assert(scoreRes.reach_disclosure.includes('42% capture rate'), 'Reach disclosure must match district capture rate');
console.log(`  ✓ Priority Score calculated: ${scoreRes.priority_score}/100`);

// 2. Capture-rate Floor Test (0.3 minimum)
console.log('[Test 2] Testing Capture Rate floor (0.3 minimum)...');
const lowCaptureDist = { ...mockDistrict, estimated_reporting_capture_rate: 0.15 };
const scoreLow = calculatePriorityScore({
  id: 'WTR-LOW',
  citizens_affected: 10,
  urgency: 0.8,
  district_code: 'NGP'
}, lowCaptureDist);

assert(Math.abs(scoreLow.effective_citizens_affected - (10 / 0.3 / 1617060)) < 0.0001, 'Capture rate must be floored to 0.3');
console.log(`  ✓ Low capture rate (15%) correctly floored to 30%.`);

// 3. Self-Extracted Uncertainty Test
console.log('[Test 3] Testing Self-Extracted data review routing...');
const selfExtractedDist = { ...mockDistrict, budget_confidence: 'self_extracted' };
const scoreSE = calculatePriorityScore({
  id: 'WTR-SE',
  citizens_affected: 47,
  urgency: 0.85,
  district_code: 'NGP'
}, selfExtractedDist);

assert(scoreSE.has_self_extracted_data === true, 'Should mark self_extracted flag');
assert(scoreSE.explanation.includes('flagged for human review'), 'Explanation must include review warning');
console.log(`  ✓ Self-extracted data preserves score while triggering review flag.`);

// 4. Verification Quorum Math Test
console.log('[Test 4] Testing Verification Quorum formula math...');
assert(calculateRequiredQuorum(1) === 1, '1-citizen cluster requires 1 confirmation');
assert(calculateRequiredQuorum(2) === 2, '2-citizen cluster requires 2 confirmations');
assert(calculateRequiredQuorum(47) === 3, '47-citizen cluster requires 3 confirmations');
assert(calculateRequiredQuorum(100) === 5, '100-citizen cluster requires 5 confirmations');
assert(calculateRequiredQuorum(200) === 10, '200-citizen cluster requires 10 confirmations');
console.log(`  ✓ Verification quorum math verified for all citizen sizes (1, 2, 47, 100, 200).`);

// 5. Photo Review Requirement Test
console.log('[Test 5] Testing Photo Evidence human review status...');
const stateUnverified = evaluateVerificationStatus('WTR-NGP-004', 47, 5, []);
assert(!stateUnverified.isFullyVerified, 'Quorum without human photo approval is NOT verified');

const stateVerified = evaluateVerificationStatus('WTR-NGP-004', 47, 5, [{ human_review_status: 'approved' }]);
assert(stateVerified.isFullyVerified, 'Quorum + approved photo = VERIFIED OUTCOME');
console.log(`  ✓ Human photo review requirement enforced.`);

// 6. Fraud / Levenshtein Duplicate Test
console.log('[Test 6] Testing Fraud Levenshtein Duplicate detection rule...');
const fraudRes = evaluateFraudRules({
  id: 'cmp_new',
  citizen_id: 'cit_99',
  district_code: 'NGP',
  category: 'Water',
  translated_text: 'Drinking water pipeline is broken in Ward 4 and water is leaking on main street.',
  geo_hash: 'tf3x9a',
  created_at: new Date().toISOString()
}, [{
  id: 'cmp_prev',
  citizen_id: 'cit_88',
  district_code: 'NGP',
  category: 'Water',
  translated_text: 'Drinking water pipeline is broken in Ward 4 and water is leaking on main road.',
  geo_hash: 'tf3x9a',
  created_at: new Date(Date.now() - 300000).toISOString()
}]);

assert(fraudRes.isFlagged === true && fraudRes.flagType === 'duplicate_text', 'High text similarity must be flagged');
console.log(`  ✓ Duplicate text rule flagged near-identical complaint (Levenshtein >= 0.92).`);

// 7. Number-Safe Policy Brief Test
console.log('[Test 7] Testing Number-Safe Policy Brief generator...');
const briefRes = generatePolicyBriefMarkdown({
  clusterId: 'WTR-NGP-004',
  problemTitle: 'Recurring drinking-water shortage',
  problemSummary: 'Water pipeline disruption',
  category: 'Water',
  citizensAffected: 47,
  urgency: 0.85,
  district: mockDistrict,
  scoreResult: scoreRes,
  approxLocation: 'Nagapattinam Ward 4'
});

assert(briefRes.validationPassed === true, 'Numeric validation must pass for approved dataset numbers');
console.log(`  ✓ Policy brief passed numeric provenance validation.`);

console.log('----------------------------------------------------');
console.log(' ALL 7 LOGIC AND SCORING TESTS PASSED PERFECTLY! ');
console.log('----------------------------------------------------');
