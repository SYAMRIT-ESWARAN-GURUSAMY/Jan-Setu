import { db, initDatabase } from './db';
import { calculatePriorityScore } from '../scoring/priorityEngine';
import { calculateRequiredQuorum } from '../verification/quorumService';

export function seedDatabase() {
  initDatabase();

  // Clear existing records for clean seed reset
  db.exec(`
    DELETE FROM audit_events;
    DELETE FROM policy_briefs;
    DELETE FROM evidence_photos;
    DELETE FROM verification_replies;
    DELETE FROM verification_requests;
    DELETE FROM funding_actions;
    DELETE FROM review_flags;
    DELETE FROM cluster_members;
    DELETE FROM complaints;
    DELETE FROM demand_clusters;
    DELETE FROM citizens;
    DELETE FROM district_indicators;
    DELETE FROM districts;
  `);

  console.log('Seeding districts and provenance data...');

  const districtsData = [
    {
      code: 'NGP',
      name: 'Nagapattinam',
      state: 'Tamil Nadu',
      population: 1617060,
      population_source: 'Census 2011',
      population_as_of: '2011-03-31',
      population_confidence: 'verified',
      bpl_pct: 0.31,
      bpl_pct_source: 'SECC 2011 / State Planning Board',
      bpl_pct_as_of: '2018-05-12',
      bpl_pct_confidence: 'verified',
      infra_deficit_score: 0.78,
      infra_deficit_source: 'NITI Aayog SDG India Index 2023',
      infra_deficit_as_of: '2023-11-20',
      infra_deficit_confidence: 'estimated',
      existing_budget_allocation: 1500000,
      budget_source: 'TN State Budget Expenditure Portal',
      budget_as_of: '2024-03-31',
      budget_confidence: 'self_extracted', // Triggers "Verify Before Funding"
      estimated_reporting_capture_rate: 0.42,
      capture_rate_source: 'Telecom Authority & Field Digital Penetration Model'
    },
    {
      code: 'MYD',
      name: 'Mayiladuthurai',
      state: 'Tamil Nadu',
      population: 918000,
      population_source: 'Census 2011 / District Gazette',
      population_as_of: '2020-03-24',
      population_confidence: 'verified',
      bpl_pct: 0.28,
      bpl_pct_source: 'SECC 2011',
      bpl_pct_as_of: '2018-05-12',
      bpl_pct_confidence: 'verified',
      infra_deficit_score: 0.72,
      infra_deficit_source: 'TN PWD Infrastructure Assessment',
      infra_deficit_as_of: '2023-09-15',
      infra_deficit_confidence: 'verified',
      existing_budget_allocation: 2100000,
      budget_source: 'State Treasury Portal',
      budget_as_of: '2024-01-10',
      budget_confidence: 'verified',
      estimated_reporting_capture_rate: 0.45,
      capture_rate_source: 'Telecom Penetration Survey'
    },
    {
      code: 'TNJ',
      name: 'Thanjavur',
      state: 'Tamil Nadu',
      population: 2405890,
      population_source: 'Census 2011',
      population_as_of: '2011-03-31',
      population_confidence: 'verified',
      bpl_pct: 0.24,
      bpl_pct_source: 'SECC 2011',
      bpl_pct_as_of: '2018-05-12',
      bpl_pct_confidence: 'verified',
      infra_deficit_score: 0.61,
      infra_deficit_source: 'State Urban Dept',
      infra_deficit_as_of: '2023-06-30',
      infra_deficit_confidence: 'verified',
      existing_budget_allocation: 4500000,
      budget_source: 'District Annual Plan',
      budget_as_of: '2024-02-15',
      budget_confidence: 'verified',
      estimated_reporting_capture_rate: 0.50,
      capture_rate_source: 'District Telecom Cell'
    },
    {
      code: 'TRY',
      name: 'Tiruchirappalli',
      state: 'Tamil Nadu',
      population: 2722290,
      population_source: 'Census 2011',
      population_as_of: '2011-03-31',
      population_confidence: 'verified',
      bpl_pct: 0.21,
      bpl_pct_source: 'SECC 2011',
      bpl_pct_as_of: '2018-05-12',
      bpl_pct_confidence: 'verified',
      infra_deficit_score: 0.52,
      infra_deficit_source: 'Smart City Index',
      infra_deficit_as_of: '2023-12-01',
      infra_deficit_confidence: 'verified',
      existing_budget_allocation: 6200000,
      budget_source: 'State Treasury',
      budget_as_of: '2024-03-01',
      budget_confidence: 'verified',
      estimated_reporting_capture_rate: 0.55,
      capture_rate_source: 'State Digital Index'
    },
    {
      code: 'CBE',
      name: 'Coimbatore',
      state: 'Tamil Nadu',
      population: 3458045,
      population_source: 'Census 2011',
      population_as_of: '2011-03-31',
      population_confidence: 'verified',
      bpl_pct: 0.15,
      bpl_pct_source: 'SECC 2011',
      bpl_pct_as_of: '2018-05-12',
      bpl_pct_confidence: 'verified',
      infra_deficit_score: 0.38,
      infra_deficit_source: 'NITI Aayog SDG Index',
      infra_deficit_as_of: '2023-11-20',
      infra_deficit_confidence: 'verified',
      existing_budget_allocation: 12000000,
      budget_source: 'Municipal Corporation Budget',
      budget_as_of: '2024-03-15',
      budget_confidence: 'verified',
      estimated_reporting_capture_rate: 0.65,
      capture_rate_source: 'TRAI Telecom Circle Report'
    },
    {
      code: 'CHN',
      name: 'Chennai',
      state: 'Tamil Nadu',
      population: 7088000,
      population_source: 'Census 2011',
      population_as_of: '2011-03-31',
      population_confidence: 'verified',
      bpl_pct: 0.12,
      bpl_pct_source: 'SECC 2011',
      bpl_pct_as_of: '2018-05-12',
      bpl_pct_confidence: 'verified',
      infra_deficit_score: 0.32,
      infra_deficit_source: 'GCC Infrastructure Report',
      infra_deficit_as_of: '2024-01-05',
      infra_deficit_confidence: 'verified',
      existing_budget_allocation: 25000000,
      budget_source: 'State Gazette & Corporation Budget',
      budget_as_of: '2024-03-20',
      budget_confidence: 'verified',
      estimated_reporting_capture_rate: 0.72,
      capture_rate_source: 'TRAI Telecom Circle Report'
    }
  ];

  const stmtDist = db.prepare(`
    INSERT INTO districts (
      code, name, state, population, population_source, population_as_of, population_confidence,
      bpl_pct, bpl_pct_source, bpl_pct_as_of, bpl_pct_confidence,
      infra_deficit_score, infra_deficit_source, infra_deficit_as_of, infra_deficit_confidence,
      existing_budget_allocation, budget_source, budget_as_of, budget_confidence,
      estimated_reporting_capture_rate, capture_rate_source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const d of districtsData) {
    stmtDist.run(
      d.code, d.name, d.state, d.population, d.population_source, d.population_as_of, d.population_confidence,
      d.bpl_pct, d.bpl_pct_source, d.bpl_pct_as_of, d.bpl_pct_confidence,
      d.infra_deficit_score, d.infra_deficit_source, d.infra_deficit_as_of, d.infra_deficit_confidence,
      d.existing_budget_allocation, d.budget_source, d.budget_as_of, d.budget_confidence,
      d.estimated_reporting_capture_rate, d.capture_rate_source
    );
  }

  // Seed citizens
  const stmtCitizen = db.prepare(`INSERT INTO citizens (id, telegram_handle, created_at, account_age_hours) VALUES (?, ?, ?, ?)`);
  for (let i = 1; i <= 50; i++) {
    stmtCitizen.run(
      `cit_${1000 + i}`,
      `@citizen_tn_${i}`,
      new Date(Date.now() - (i * 3600 * 1000 * 5)).toISOString(),
      i > 45 ? 0.5 : 48.0 // last few accounts are < 1h for velocity rule test
    );
  }

  console.log('Seeding demand clusters, complaints, and review flags...');

  // Create 8 realistic demand clusters across districts
  const now = new Date();
  const clustersData = [
    {
      id: 'WTR-NGP-004',
      problem_title: 'Recurring drinking-water shortage in Coastal Belt',
      problem_summary: 'Multiple citizens reported severe drinking water pipeline disruption affecting 47+ families across Ward 4, Nagapattinam.',
      district_code: 'NGP',
      category: 'Water',
      citizens_affected: 47,
      urgency: 0.85,
      has_self_extracted: 1, // Self-extracted budget info triggers review!
      review_status: 'under_review',
      funding_status: 'funded',
      funded_amount: 450000,
      funded_at: new Date(now.getTime() - 86400000 * 2).toISOString(),
      verification_status: 'verified',
      approx_location: 'Nagapattinam Coastal Belt Ward 4'
    },
    {
      id: 'RDS-MYD-002',
      problem_title: 'Deep potholes on Mayiladuthurai Main Bypass Road',
      problem_summary: 'Severe road deterioration and large potholes causing daily commuter accidents near Mayiladuthurai Junction.',
      district_code: 'MYD',
      category: 'Roads',
      citizens_affected: 34,
      urgency: 0.90,
      has_self_extracted: 0,
      review_status: 'approved',
      funding_status: 'funded',
      funded_amount: 320000,
      funded_at: new Date(now.getTime() - 86400000 * 1).toISOString(),
      verification_status: 'human_photo_review',
      approx_location: 'Mayiladuthurai Bypass Junction'
    },
    {
      id: 'ELE-TNJ-001',
      problem_title: 'Unannounced 6-hour power outages in West Sector',
      problem_summary: 'Daily unannounced voltage drops and power cuts disrupting local schools and small businesses.',
      district_code: 'TNJ',
      category: 'Electricity',
      citizens_affected: 28,
      urgency: 0.75,
      has_self_extracted: 0,
      review_status: 'pending',
      funding_status: 'unfunded',
      funded_amount: 0,
      funded_at: null,
      verification_status: 'not_started',
      approx_location: 'Thanjavur West Extension'
    },
    {
      id: 'SAN-TRY-003',
      problem_title: 'Uncollected solid waste overflow near Canal Market',
      problem_summary: 'Commercial waste accumulation creating health hazard and drainage blockages near Tiruchirappalli Canal Market.',
      district_code: 'TRY',
      category: 'Sanitation',
      citizens_affected: 19,
      urgency: 0.65,
      has_self_extracted: 0,
      review_status: 'pending',
      funding_status: 'unfunded',
      funded_amount: 0,
      funded_at: null,
      verification_status: 'not_started',
      approx_location: 'Tiruchirappalli Canal Market'
    },
    {
      id: 'WTR-NGP-005',
      problem_title: 'Contaminated borewell water supply in North Extension',
      problem_summary: 'Muddy and saline drinking water emerging from municipal taps affecting households.',
      district_code: 'NGP',
      category: 'Water',
      citizens_affected: 12,
      urgency: 0.80,
      has_self_extracted: 1,
      review_status: 'flagged',
      funding_status: 'unfunded',
      funded_amount: 0,
      funded_at: null,
      verification_status: 'not_started',
      approx_location: 'Nagapattinam North Extension'
    },
    {
      id: 'HLT-CBE-001',
      problem_title: 'Primary Health Center medicine supply shortage',
      problem_summary: 'Essential pediatric medicines and rabies vaccines out of stock at District PHC unit.',
      district_code: 'CBE',
      category: 'Healthcare',
      citizens_affected: 22,
      urgency: 0.88,
      has_self_extracted: 0,
      review_status: 'approved',
      funding_status: 'priority_review',
      funded_amount: 0,
      funded_at: null,
      verification_status: 'not_started',
      approx_location: 'Coimbatore East PHC Center'
    },
    {
      id: 'EDU-CHN-002',
      problem_title: 'Primary School roof leakage and sanitation hazard',
      problem_summary: 'Severe roof leakage in 3 classrooms during rain, unserviceable student toilets.',
      district_code: 'CHN',
      category: 'Education',
      citizens_affected: 15,
      urgency: 0.70,
      has_self_extracted: 0,
      review_status: 'pending',
      funding_status: 'unfunded',
      funded_amount: 0,
      funded_at: null,
      verification_status: 'not_started',
      approx_location: 'North Chennai Primary School #14'
    },
    {
      id: 'RDS-NGP-001',
      problem_title: 'Coastal storm drain blockage and road flooding',
      problem_summary: 'Storm drain clogged with silt causing knee-deep waterlogging during coastal rains.',
      district_code: 'NGP',
      category: 'Roads',
      citizens_affected: 31,
      urgency: 0.82,
      has_self_extracted: 0,
      review_status: 'pending',
      funding_status: 'unfunded',
      funded_amount: 0,
      funded_at: null,
      verification_status: 'not_started',
      approx_location: 'Nagapattinam Harbor Road'
    }
  ];

  const stmtCluster = db.prepare(`
    INSERT INTO demand_clusters (
      id, problem_title, problem_summary, district_code, category,
      citizens_affected, urgency, priority_score, score_breakdown, score_explanation,
      has_self_extracted_data, review_status, funding_status, funded_amount, funded_at,
      verification_status, approx_location, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const cl of clustersData) {
    const distRow = districtsData.find(d => d.code === cl.district_code)!;
    const scoreRes = calculatePriorityScore(
      { id: cl.id, citizens_affected: cl.citizens_affected, urgency: cl.urgency, district_code: cl.district_code },
      distRow
    );

    stmtCluster.run(
      cl.id, cl.problem_title, cl.problem_summary, cl.district_code, cl.category,
      cl.citizens_affected, cl.urgency, scoreRes.priority_score, JSON.stringify(scoreRes), scoreRes.explanation,
      cl.has_self_extracted, cl.review_status, cl.funding_status, cl.funded_amount, cl.funded_at,
      cl.verification_status, cl.approx_location, new Date(now.getTime() - 86400000 * 3).toISOString(), now.toISOString()
    );
  }

  // Seed 35 realistic citizen complaints
  const stmtCmp = db.prepare(`
    INSERT INTO complaints (
      id, citizen_id, district_code, cluster_id, channel, language, audio_url,
      original_transcript, translated_text, category, urgency, approx_lat, approx_lng, geo_hash, created_at, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const stmtMember = db.prepare(`INSERT INTO cluster_members (cluster_id, complaint_id, added_at) VALUES (?, ?, ?)`);

  const sampleTranscripts = [
    { lang: 'Tamil', orig: 'எங்கள் பகுதியில் கடந்த இரண்டு வாரமாக குடிநீர் சரியாக வரவில்லை.', trans: 'Drinking water supply has been irregular in our area for two weeks.', cat: 'Water', dist: 'NGP', cl: 'WTR-NGP-004' },
    { lang: 'Tamil', orig: 'குடிநீர் குழாயில் உப்பு நீர் மற்றும் சேறு வருகிறது.', trans: 'Muddy and saline water is coming through drinking water pipeline.', cat: 'Water', dist: 'NGP', cl: 'WTR-NGP-004' },
    { lang: 'Hindi', orig: 'हमारे इलाके में पिछले दो हफ्तों से पानी की किल्लत है।', trans: 'There is severe water shortage in our locality for two weeks.', cat: 'Water', dist: 'NGP', cl: 'WTR-NGP-004' },
    { lang: 'Tamil', orig: 'மயிலாடுதுறை மெயின் ரோட்டில் பெரிய பள்ளங்கள் ஏற்பட்டுள்ளன.', trans: 'Deep potholes have formed on Mayiladuthurai main road.', cat: 'Roads', dist: 'MYD', cl: 'RDS-MYD-002' },
    { lang: 'Hindi', orig: 'मुख्य मार्ग पर गड्ढों के कारण दुर्घटनाएं हो रही हैं।', trans: 'Accidents are happening daily due to potholes on main road.', cat: 'Roads', dist: 'MYD', cl: 'RDS-MYD-002' },
    { lang: 'Tamil', orig: 'தஞ்சாவூர் மேற்கு பகுதியில் தினமும் 6 மணி நேரம் மின்தடை.', trans: 'Daily 6 hour power outage in Thanjavur West section.', cat: 'Electricity', dist: 'TNJ', cl: 'ELE-TNJ-001' },
    { lang: 'Tamil', orig: 'கால்வாய் சந்தையில் குப்பைகள் தேங்கி துர்நாற்றம் வீசுகிறது.', trans: 'Garbage accumulation at Canal Market spreading bad odor.', cat: 'Sanitation', dist: 'TRY', cl: 'SAN-TRY-003' },
    { lang: 'Tamil', orig: 'ஆரம்ப சுகாதார நிலையத்தில் தடுப்பூசிகள் இருப்பு இல்லை.', trans: 'Vaccines are out of stock at Primary Health Center.', cat: 'Healthcare', dist: 'CBE', cl: 'HLT-CBE-001' }
  ];

  for (let i = 1; i <= 35; i++) {
    const cmpId = `cmp_${1000 + i}`;
    const citId = `cit_${1000 + (i % 45 + 1)}`;
    const template = sampleTranscripts[(i - 1) % sampleTranscripts.length];
    const createdDate = new Date(now.getTime() - (i * 3600 * 1000 * 2)).toISOString();
    const expiryDate = new Date(now.getTime() + (90 * 86400000)).toISOString();

    stmtCmp.run(
      cmpId, citId, template.dist, template.cl, 'Telegram', template.lang,
      `https://audio.jansetu.gov.in/voice_${cmpId}.ogg`,
      template.orig, template.trans, template.cat, 0.8, 10.767, 79.844, 'tf3x9a',
      createdDate, expiryDate
    );

    stmtMember.run(template.cl, cmpId, createdDate);
  }

  // Seed Review Flags (Fraud & Data Verification)
  const stmtFlag = db.prepare(`
    INSERT INTO review_flags (id, cluster_id, complaint_id, flag_type, reason, priority_score, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmtFlag.run(
    'flg_101', 'WTR-NGP-004', 'cmp_1002', 'duplicate_text',
    'Possible duplicate submission (Similarity: 95.2% with complaint cmp_1001 within 10 min. Build-time threshold based on informal testing.)',
    82.4, 'pending', now.toISOString()
  );

  stmtFlag.run(
    'flg_102', 'WTR-NGP-005', 'cmp_1015', 'velocity_flooding',
    'Possible coordinated flooding (7 complaints in 8 min for Water at tf3x9a. Duplicate text ratio: 71%, Fresh accounts (<1h): 80%.)',
    64.2, 'pending', now.toISOString()
  );

  stmtFlag.run(
    'flg_103', 'WTR-NGP-004', null, 'data_verification',
    'Self-extracted budget indicator source requiring human data verification before funding disbursement.',
    82.4, 'pending', now.toISOString()
  );

  stmtFlag.run(
    'flg_104', 'RDS-MYD-002', null, 'photo_evidence',
    'Photo evidence submitted by citizen cit_1004 awaiting human review prior to final outcome verification.',
    76.8, 'pending', now.toISOString()
  );

  // Seed Funding Actions
  db.prepare(`
    INSERT INTO funding_actions (id, cluster_id, amount, funded_by, notes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('fnd_001', 'WTR-NGP-004', 450000, 'District Collectorate Emergency Fund', 'Sanctioned pipeline repair and bowser deployment.', new Date(now.getTime() - 86400000 * 2).toISOString());

  db.prepare(`
    INSERT INTO funding_actions (id, cluster_id, amount, funded_by, notes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('fnd_002', 'RDS-MYD-002', 320000, 'Mayiladuthurai Municipal Works', 'Sanctioned road resurfacing and cold-mix pothole filling.', new Date(now.getTime() - 86400000 * 1).toISOString());

  // Seed Verification Requests & Replies
  const reqQuorumNGP = calculateRequiredQuorum(47); // 5 required
  db.prepare(`
    INSERT INTO verification_requests (id, cluster_id, required_quorum, confirmations_count, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('req_ngp', 'WTR-NGP-004', reqQuorumNGP, 5, 'quorum_reached', new Date(now.getTime() - 86400000 * 1.5).toISOString());

  const reqQuorumMYD = calculateRequiredQuorum(34); // 3 required
  db.prepare(`
    INSERT INTO verification_requests (id, cluster_id, required_quorum, confirmations_count, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('req_myd', 'RDS-MYD-002', reqQuorumMYD, 2, 'active', new Date(now.getTime() - 86400000 * 0.8).toISOString());

  // Verification replies for NGP
  const stmtReply = db.prepare(`
    INSERT INTO verification_replies (id, request_id, cluster_id, citizen_id, response, comments, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (let r = 1; r <= 5; r++) {
    stmtReply.run(
      `rep_${r}`, 'req_ngp', 'WTR-NGP-004', `cit_${1000 + r}`, 'YES',
      'Water supply restored in our street today morning. Thank you!',
      new Date(now.getTime() - (r * 3600 * 1000 * 4)).toISOString()
    );
  }

  // Evidence Photos
  const stmtPhoto = db.prepare(`
    INSERT INTO evidence_photos (id, cluster_id, citizen_id, photo_url, caption, human_review_status, reviewer_notes, uploaded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmtPhoto.run(
    'pho_01', 'WTR-NGP-004', 'cit_1001',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=600&q=80',
    'Clean tap water supply running in Ward 4 house container.',
    'approved', 'Human reviewer verified clear water flow and location matching Ward 4.',
    new Date(now.getTime() - 86400000 * 1).toISOString()
  );

  stmtPhoto.run(
    'pho_02', 'RDS-MYD-002', 'cit_1004',
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    'Patched road section at Mayiladuthurai junction.',
    'pending', 'Awaiting municipal engineer review.',
    new Date(now.getTime() - 86400000 * 0.5).toISOString()
  );

  // Policy Briefs
  db.prepare(`
    INSERT INTO policy_briefs (id, cluster_id, title, content_markdown, numeric_validation_passed, generated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'brf_ngp_004', 'WTR-NGP-004', 'DISTRICT PRIORITY BRIEF: WTR-NGP-004',
    '# JAN-SETU AI DISTRICT PRIORITY BRIEF\nTarget Cluster ID: WTR-NGP-004 | Nagapattinam | Category: Water\n\nPriority Score: 82.4 / 100\nCitizen Impact: 47 reports (112 reach-adjusted)\nReach Capture Rate: 42%\nBPL %: 31%\n\nNumeric validation passed.',
    1, new Date(now.getTime() - 86400000 * 2).toISOString()
  );

  // Audit Events
  const stmtAudit = db.prepare(`
    INSERT INTO audit_events (event_type, actor, cluster_id, description, metadata_json, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmtAudit.run('SYSTEM_INIT', 'system', null, 'JAN-SETU AI Database seeded and initialized with demo dataset.', null, new Date(now.getTime() - 86400000 * 3).toISOString());
  stmtAudit.run('COMPLAINT_RECEIVED', 'telegram_bot', 'WTR-NGP-004', 'Received Tamil voice complaint from citizen @citizen_tn_1.', JSON.stringify({ lang: 'Tamil', channel: 'Telegram' }), new Date(now.getTime() - 86400000 * 2.5).toISOString());
  stmtAudit.run('CLUSTER_CREATED', 'priority_engine', 'WTR-NGP-004', 'Created Demand Cluster WTR-NGP-004 for recurring water shortage.', JSON.stringify({ initial_score: 82.4 }), new Date(now.getTime() - 86400000 * 2.5).toISOString());
  stmtAudit.run('FLAG_RAISED', 'trust_safety', 'WTR-NGP-004', 'Flagged self-extracted budget indicator for human verification.', JSON.stringify({ flag: 'data_verification' }), new Date(now.getTime() - 86400000 * 2.2).toISOString());
  stmtAudit.run('PROJECT_FUNDED', 'admin_officer', 'WTR-NGP-004', 'Sanctioned ₹4,500,000 for emergency pipeline restoration.', JSON.stringify({ amount: 450000 }), new Date(now.getTime() - 86400000 * 2.0).toISOString());
  stmtAudit.run('QUORUM_REACHED', 'verification_engine', 'WTR-NGP-004', 'Verification quorum reached (5/5 citizen confirmations).', JSON.stringify({ quorum: 5 }), new Date(now.getTime() - 86400000 * 1.0).toISOString());
  stmtAudit.run('OUTCOME_VERIFIED', 'human_reviewer', 'WTR-NGP-004', 'Human reviewer approved photo evidence pho_01. Cluster marked VERIFIED OUTCOME.', JSON.stringify({ photo_id: 'pho_01' }), new Date(now.getTime() - 86400000 * 0.8).toISOString());

  console.log('Database seeding complete!');
}
