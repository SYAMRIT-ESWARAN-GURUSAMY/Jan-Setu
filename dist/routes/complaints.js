"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../database/db");
const aiService_1 = require("../ai/aiService");
const demandClusterService_1 = require("../clustering/demandClusterService");
const trustSafetyService_1 = require("../fraud/trustSafetyService");
const router = (0, express_1.Router)();
// GET /api/complaints
router.get('/complaints', (req, res) => {
    const complaints = db_1.db.prepare(`
    SELECT c.*, dc.problem_title as cluster_title, d.name as district_name
    FROM complaints c
    LEFT JOIN demand_clusters dc ON c.cluster_id = dc.id
    LEFT JOIN districts d ON c.district_code = d.code
    ORDER BY c.created_at DESC
  `).all();
    res.json({ complaints });
});
// GET /api/complaints/:id
router.get('/complaints/:id', (req, res) => {
    const complaint = db_1.db.prepare(`
    SELECT c.*, dc.problem_title as cluster_title, d.name as district_name
    FROM complaints c
    LEFT JOIN demand_clusters dc ON c.cluster_id = dc.id
    LEFT JOIN districts d ON c.district_code = d.code
    WHERE c.id = ?
  `).get(req.params.id);
    if (!complaint)
        return res.status(404).json({ error: 'Complaint not found' });
    res.json({ complaint });
});
// POST /api/process/complaint (Citizen Ingestion Flow)
router.post('/process/complaint', async (req, res) => {
    try {
        const { language, inputType, textInput, presetKey, citizenHandle } = req.body;
        // Step 1: AI Processing
        const aiResult = await (0, aiService_1.processCitizenComplaint)({
            language: language || 'Tamil',
            inputType: inputType || 'text',
            textInput,
            presetKey
        });
        // Step 2: Citizen Account handling
        const citizenId = citizenHandle ? `cit_${Math.abs(hashCode(citizenHandle))}` : `cit_${Math.floor(1000 + Math.random() * 9000)}`;
        const now = new Date().toISOString();
        db_1.db.prepare(`
      INSERT INTO citizens (id, telegram_handle, created_at, account_age_hours)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET telegram_handle = excluded.telegram_handle
    `).run(citizenId, citizenHandle || `@citizen_${citizenId}`, now, 24.0);
        // Step 3: Insert raw complaint record
        const cmpId = `cmp_${Date.now().toString().slice(-6)}`;
        const expiryDate = new Date(Date.now() + 90 * 86400000).toISOString();
        db_1.db.prepare(`
      INSERT INTO complaints (
        id, citizen_id, district_code, channel, language, original_transcript,
        translated_text, category, urgency, approx_lat, approx_lng, geo_hash, created_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(cmpId, citizenId, aiResult.districtCode, 'Telegram', language || 'Tamil', aiResult.originalTranscript, aiResult.translatedText, aiResult.category, aiResult.urgency, aiResult.approxLat, aiResult.approxLng, aiResult.geoHash, now, expiryDate);
        // Step 4: Evaluate Fraud / Trust & Safety rules
        const recentComplaints = db_1.db.prepare(`SELECT * FROM complaints ORDER BY created_at DESC LIMIT 50`).all();
        const fraudEval = (0, trustSafetyService_1.evaluateFraudRules)({
            id: cmpId,
            citizen_id: citizenId,
            district_code: aiResult.districtCode,
            category: aiResult.category,
            translated_text: aiResult.translatedText,
            geo_hash: aiResult.geoHash,
            created_at: now
        }, recentComplaints);
        if (fraudEval.isFlagged) {
            db_1.db.prepare(`
        INSERT INTO review_flags (id, complaint_id, flag_type, reason, priority_score, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(`flg_${Date.now()}`, cmpId, fraudEval.flagType, fraudEval.reason, 0, 'pending', now);
        }
        // Step 5: Demand Clustering & Priority Score Recalculation
        const clusterRes = (0, demandClusterService_1.findOrCreateDemandCluster)({
            complaintId: cmpId,
            citizenId,
            category: aiResult.category,
            districtCode: aiResult.districtCode,
            translatedText: aiResult.translatedText,
            approxLat: aiResult.approxLat,
            approxLng: aiResult.approxLng,
            geoHash: aiResult.geoHash,
            urgency: aiResult.urgency,
            approxLocation: aiResult.approxLocation
        });
        // Record Audit event
        db_1.db.prepare(`
      INSERT INTO audit_events (event_type, actor, cluster_id, description, metadata_json, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('COMPLAINT_INGESTED', 'telegram_bot', clusterRes.clusterId, `Ingested ${language} complaint for ${aiResult.category} in ${aiResult.districtCode}.`, JSON.stringify({ complaint_id: cmpId, fraud_flagged: fraudEval.isFlagged }), now);
        const updatedCluster = db_1.db.prepare(`SELECT * FROM demand_clusters WHERE id = ?`).get(clusterRes.clusterId);
        res.json({
            success: true,
            complaintId: cmpId,
            aiResult,
            clusterId: clusterRes.clusterId,
            isNewCluster: clusterRes.isNewCluster,
            fraudFlag: fraudEval,
            updatedCluster
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}
exports.default = router;
