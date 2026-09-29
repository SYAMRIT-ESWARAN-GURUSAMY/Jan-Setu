"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seed_1 = require("../database/seed");
const db_1 = require("../database/db");
const aiService_1 = require("../ai/aiService");
const demandClusterService_1 = require("../clustering/demandClusterService");
const policyBriefGenerator_1 = require("../briefs/policyBriefGenerator");
const priorityEngine_1 = require("../scoring/priorityEngine");
const quorumService_1 = require("../verification/quorumService");
const router = (0, express_1.Router)();
// POST /api/demo/reset (Reset database to clean initial seeded state)
router.post('/demo/reset', (req, res) => {
    try {
        (0, seed_1.seedDatabase)();
        res.json({ success: true, message: 'Database reset to clean hackathon demo seed dataset.' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /api/demo/run-step (Execute step in interactive hackathon demo)
router.post('/demo/run-step', async (req, res) => {
    const { step } = req.body;
    const now = new Date().toISOString();
    try {
        switch (step) {
            case 1: {
                // Step 1: Citizen Ingestion (Tamil voice)
                const aiResult = await (0, aiService_1.processCitizenComplaint)({
                    language: 'Tamil',
                    inputType: 'voice',
                    presetKey: 'tamil_water'
                });
                const citId = 'cit_demo_01';
                db_1.db.prepare(`
          INSERT INTO citizens (id, telegram_handle, created_at)
          VALUES (?, '@citizen_nagapattinam_ward4', ?)
          ON CONFLICT(id) DO NOTHING
        `).run(citId, now);
                const cmpId = `cmp_demo_${Date.now().toString().slice(-4)}`;
                db_1.db.prepare(`
          INSERT INTO complaints (
            id, citizen_id, district_code, channel, language, original_transcript,
            translated_text, category, urgency, approx_lat, approx_lng, geo_hash, created_at, expires_at
          ) VALUES (?, ?, ?, 'Telegram', 'Tamil', ?, ?, ?, ?, 10.767, 79.844, 'tf3x9a', ?, ?)
        `).run(cmpId, citId, 'NGP', aiResult.originalTranscript, aiResult.translatedText, aiResult.category, aiResult.urgency, now, new Date(Date.now() + 90 * 86400000).toISOString());
                const clusterRes = (0, demandClusterService_1.findOrCreateDemandCluster)({
                    complaintId: cmpId,
                    citizenId: citId,
                    category: 'Water',
                    districtCode: 'NGP',
                    translatedText: aiResult.translatedText,
                    urgency: 0.85,
                    approxLocation: 'Nagapattinam Coastal Belt Ward 4'
                });
                return res.json({
                    step: 1,
                    title: 'Citizen Voice Received & Ingested',
                    aiResult,
                    complaintId: cmpId,
                    clusterId: clusterRes.clusterId,
                    detail: `Voice complaint in Tamil transcribed via Whisper & translated via IndicTrans2.`
                });
            }
            case 2: {
                // Step 2: Policy Brief & Funding Action
                const clusterId = 'WTR-NGP-004';
                const cluster = db_1.db.prepare(`SELECT * FROM demand_clusters WHERE id = ?`).get(clusterId);
                const district = db_1.db.prepare(`SELECT * FROM districts WHERE code = ?`).get(cluster.district_code);
                const scoreResult = (0, priorityEngine_1.calculatePriorityScore)({
                    id: clusterId,
                    citizens_affected: cluster.citizens_affected,
                    urgency: cluster.urgency,
                    district_code: cluster.district_code
                }, district);
                const briefRes = (0, policyBriefGenerator_1.generatePolicyBriefMarkdown)({
                    clusterId,
                    problemTitle: cluster.problem_title,
                    problemSummary: cluster.problem_summary,
                    category: cluster.category,
                    citizensAffected: cluster.citizens_affected,
                    urgency: cluster.urgency,
                    district,
                    scoreResult,
                    approxLocation: cluster.approx_location
                });
                db_1.db.prepare(`
          INSERT INTO policy_briefs (id, cluster_id, title, content_markdown, numeric_validation_passed, generated_at)
          VALUES ('brf_demo_wtr', ?, 'DISTRICT PRIORITY BRIEF: WTR-NGP-004', ?, 1, ?)
          ON CONFLICT(id) DO UPDATE SET content_markdown = excluded.content_markdown
        `).run(clusterId, briefRes.markdown, now);
                db_1.db.prepare(`
          UPDATE demand_clusters
          SET funding_status = 'funded',
              funded_amount = 450000,
              funded_at = ?,
              verification_status = 'awaiting_confirmation',
              updated_at = ?
          WHERE id = ?
        `).run(now, now, clusterId);
                const quorum = (0, quorumService_1.calculateRequiredQuorum)(cluster.citizens_affected);
                db_1.db.prepare(`
          INSERT INTO verification_requests (id, cluster_id, required_quorum, confirmations_count, status, created_at)
          VALUES ('req_demo_wtr', ?, ?, 0, 'active', ?)
          ON CONFLICT(id) DO UPDATE SET required_quorum = excluded.required_quorum
        `).run(clusterId, quorum, now);
                return res.json({
                    step: 2,
                    title: 'Policy Brief Generated & Project Funded',
                    clusterId,
                    priorityScore: scoreResult.priority_score,
                    fundedAmount: 450000,
                    requiredQuorum: quorum,
                    briefMarkdown: briefRes.markdown
                });
            }
            case 3: {
                // Step 3: Citizen Quorum Confirmation & Photo Approval -> Verified Outcome
                const clusterId = 'WTR-NGP-004';
                const cluster = db_1.db.prepare(`SELECT * FROM demand_clusters WHERE id = ?`).get(clusterId);
                const quorum = (0, quorumService_1.calculateRequiredQuorum)(cluster.citizens_affected);
                for (let i = 1; i <= quorum; i++) {
                    const citId = `cit_ver_demo_${i}`;
                    db_1.db.prepare(`
            INSERT INTO citizens (id, telegram_handle, created_at)
            VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING
          `).run(citId, `@citizen_ver_${i}`, now);
                    db_1.db.prepare(`
            INSERT INTO verification_replies (id, request_id, cluster_id, citizen_id, response, comments, timestamp)
            VALUES (?, 'req_demo_wtr', ?, ?, 'YES', 'Water supply restored. Confirmed by local resident.', ?)
            ON CONFLICT(id) DO NOTHING
          `).run(`rep_demo_${i}`, clusterId, citId, now);
                }
                const photoId = 'pho_demo_wtr';
                db_1.db.prepare(`
          INSERT INTO evidence_photos (id, cluster_id, citizen_id, photo_url, caption, human_review_status, reviewer_notes, uploaded_at)
          VALUES (?, ?, 'cit_demo_01', ?, 'Restored water pipeline in Ward 4', 'approved', 'Human reviewer verified clear tap water flow.', ?)
          ON CONFLICT(id) DO UPDATE SET human_review_status = 'approved'
        `).run(photoId, clusterId, 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=600&q=80', now);
                const evalState = (0, quorumService_1.evaluateVerificationStatus)(clusterId, cluster.citizens_affected, quorum, [{ human_review_status: 'approved' }]);
                db_1.db.prepare(`
          UPDATE demand_clusters
          SET verification_status = 'verified', updated_at = ?
          WHERE id = ?
        `).run(now, clusterId);
                db_1.db.prepare(`
          INSERT INTO audit_events (event_type, actor, cluster_id, description, metadata_json, timestamp)
          VALUES ('DEMO_COMPLETED', 'demo_runner', clusterId, 'Full JAN-SETU AI lifecycle demo completed successfully: PRIORITIZE -> FUND -> VERIFY.', ?, ?)
        `).run(JSON.stringify(evalState), now);
                return res.json({
                    step: 3,
                    title: 'VERIFIED OUTCOME ACHIEVED',
                    clusterId,
                    confirmations: quorum,
                    photoApproved: true,
                    status: 'VERIFIED OUTCOME',
                    summary: 'Citizen reports were transformed into a prioritized, funded, human-reviewed, and verified public-action outcome.'
                });
            }
            default:
                return res.status(400).json({ error: 'Invalid demo step' });
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
