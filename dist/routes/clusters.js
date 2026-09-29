"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../database/db");
const priorityEngine_1 = require("../scoring/priorityEngine");
const quorumService_1 = require("../verification/quorumService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/clusters
router.get('/clusters', (req, res) => {
    const clusters = db_1.db.prepare(`
    SELECT dc.*, d.name as district_name, d.bpl_pct, d.infra_deficit_score, d.estimated_reporting_capture_rate
    FROM demand_clusters dc
    JOIN districts d ON dc.district_code = d.code
    ORDER BY dc.priority_score DESC
  `).all();
    res.json({ clusters });
});
// GET /api/clusters/:id
router.get('/clusters/:id', (req, res) => {
    const cluster = db_1.db.prepare(`
    SELECT dc.*, d.name as district_name, d.population, d.bpl_pct, d.bpl_pct_source, d.bpl_pct_confidence,
           d.infra_deficit_score, d.infra_deficit_source, d.infra_deficit_confidence,
           d.existing_budget_allocation, d.budget_source, d.budget_confidence,
           d.estimated_reporting_capture_rate, d.capture_rate_source
    FROM demand_clusters dc
    JOIN districts d ON dc.district_code = d.code
    WHERE dc.id = ?
  `).get(req.params.id);
    if (!cluster)
        return res.status(404).json({ error: 'Cluster not found' });
    // Fetch associated complaints
    const complaints = db_1.db.prepare(`
    SELECT c.*, cit.telegram_handle
    FROM complaints c
    JOIN cluster_members cm ON c.id = cm.complaint_id
    JOIN citizens cit ON c.citizen_id = cit.id
    WHERE cm.cluster_id = ?
    ORDER BY c.created_at DESC
  `).all(req.params.id);
    // Fetch flags
    const flags = db_1.db.prepare(`SELECT * FROM review_flags WHERE cluster_id = ?`).all(req.params.id);
    // Fetch funding info
    const funding = db_1.db.prepare(`SELECT * FROM funding_actions WHERE cluster_id = ?`).all(req.params.id);
    // Fetch policy brief if generated
    const policyBrief = db_1.db.prepare(`SELECT * FROM policy_briefs WHERE cluster_id = ?`).get(req.params.id);
    // Parse breakdown JSON safely
    let breakdown = null;
    try {
        breakdown = JSON.parse(cluster.score_breakdown || '{}');
    }
    catch (e) { }
    res.json({
        cluster: {
            ...cluster,
            score_breakdown: breakdown
        },
        complaints,
        flags,
        funding,
        policyBrief
    });
});
// POST /api/clusters/:id/recalculate
router.post('/clusters/:id/recalculate', (req, res) => {
    const cluster = db_1.db.prepare(`SELECT * FROM demand_clusters WHERE id = ?`).get(req.params.id);
    if (!cluster)
        return res.status(404).json({ error: 'Cluster not found' });
    const distRow = db_1.db.prepare(`SELECT * FROM districts WHERE code = ?`).get(cluster.district_code);
    const scoreResult = (0, priorityEngine_1.calculatePriorityScore)({ id: cluster.id, citizens_affected: cluster.citizens_affected, urgency: cluster.urgency, district_code: cluster.district_code }, distRow);
    const now = new Date().toISOString();
    db_1.db.prepare(`
    UPDATE demand_clusters
    SET priority_score = ?, score_breakdown = ?, score_explanation = ?, updated_at = ?
    WHERE id = ?
  `).run(scoreResult.priority_score, JSON.stringify(scoreResult), scoreResult.explanation, now, cluster.id);
    res.json({ success: true, priorityScore: scoreResult.priority_score, scoreResult });
});
// POST /api/clusters/:id/fund (Protected route with Admin Token)
router.post('/clusters/:id/fund', auth_1.requireAdminAuth, (req, res) => {
    const { amount, notes, funded_by } = req.body;
    const clusterId = req.params.id;
    const cluster = db_1.db.prepare(`SELECT * FROM demand_clusters WHERE id = ?`).get(clusterId);
    if (!cluster)
        return res.status(404).json({ error: 'Cluster not found' });
    const now = new Date().toISOString();
    const fundingId = `fnd_${Date.now()}`;
    db_1.db.prepare(`
    INSERT INTO funding_actions (id, cluster_id, amount, funded_by, notes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(fundingId, clusterId, amount || 500000, funded_by || 'District Emergency Fund', notes || 'Sanctioned work order', now);
    // Update cluster funding status & verification status
    db_1.db.prepare(`
    UPDATE demand_clusters
    SET funding_status = 'funded',
        funded_amount = ?,
        funded_at = ?,
        verification_status = 'awaiting_confirmation',
        updated_at = ?
    WHERE id = ?
  `).run(amount || 500000, now, now, clusterId);
    // Create verification request automatically for reporting citizens
    const requiredQuorum = (0, quorumService_1.calculateRequiredQuorum)(cluster.citizens_affected);
    const reqId = `req_${Date.now()}`;
    db_1.db.prepare(`
    INSERT INTO verification_requests (id, cluster_id, required_quorum, confirmations_count, status, created_at)
    VALUES (?, ?, ?, 0, 'active', ?)
    ON CONFLICT(id) DO NOTHING
  `).run(reqId, clusterId, requiredQuorum, now);
    // Audit event
    db_1.db.prepare(`
    INSERT INTO audit_events (event_type, actor, cluster_id, description, metadata_json, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('PROJECT_FUNDED', 'admin_officer', clusterId, `Funded ₹${amount || 500000} for cluster ${clusterId}. Verification request triggered.`, JSON.stringify({ amount, requiredQuorum }), now);
    res.json({
        success: true,
        message: `Cluster ${clusterId} marked as FUNDED. Citizen verification request created with required quorum of ${requiredQuorum}.`,
        fundingId,
        requiredQuorum
    });
});
exports.default = router;
