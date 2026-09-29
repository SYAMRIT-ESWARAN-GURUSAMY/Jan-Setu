"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../database/db");
const policyBriefGenerator_1 = require("../briefs/policyBriefGenerator");
const priorityEngine_1 = require("../scoring/priorityEngine");
const router = (0, express_1.Router)();
// GET /api/policy-briefs
router.get('/policy-briefs', (req, res) => {
    const briefs = db_1.db.prepare(`
    SELECT pb.*, dc.problem_title, dc.category, dc.district_code, d.name as district_name
    FROM policy_briefs pb
    JOIN demand_clusters dc ON pb.cluster_id = dc.id
    JOIN districts d ON dc.district_code = d.code
    ORDER BY pb.generated_at DESC
  `).all();
    res.json({ briefs });
});
// GET /api/policy-briefs/:clusterId
router.get('/policy-briefs/:clusterId', (req, res) => {
    const brief = db_1.db.prepare(`
    SELECT pb.*, dc.problem_title, dc.category, dc.district_code, d.name as district_name
    FROM policy_briefs pb
    JOIN demand_clusters dc ON pb.cluster_id = dc.id
    JOIN districts d ON dc.district_code = d.code
    WHERE pb.cluster_id = ?
  `).get(req.params.clusterId);
    if (!brief)
        return res.status(404).json({ error: 'Policy brief not found for this cluster' });
    res.json({ brief });
});
// POST /api/policy-briefs (Generate Policy Brief for Cluster)
router.post('/policy-briefs', (req, res) => {
    const { clusterId } = req.body;
    const cluster = db_1.db.prepare(`SELECT * FROM demand_clusters WHERE id = ?`).get(clusterId);
    if (!cluster)
        return res.status(404).json({ error: 'Cluster not found' });
    const district = db_1.db.prepare(`SELECT * FROM districts WHERE code = ?`).get(cluster.district_code);
    const scoreResult = (0, priorityEngine_1.calculatePriorityScore)({ id: cluster.id, citizens_affected: cluster.citizens_affected, urgency: cluster.urgency, district_code: cluster.district_code }, district);
    const { markdown, validationPassed } = (0, policyBriefGenerator_1.generatePolicyBriefMarkdown)({
        clusterId: cluster.id,
        problemTitle: cluster.problem_title,
        problemSummary: cluster.problem_summary,
        category: cluster.category,
        citizensAffected: cluster.citizens_affected,
        urgency: cluster.urgency,
        district,
        scoreResult,
        approxLocation: cluster.approx_location
    });
    const now = new Date().toISOString();
    const briefId = `brf_${cluster.id.toLowerCase().replace(/-/g, '_')}`;
    db_1.db.prepare(`
    INSERT INTO policy_briefs (id, cluster_id, title, content_markdown, numeric_validation_passed, generated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET content_markdown = excluded.content_markdown, generated_at = excluded.generated_at
  `).run(briefId, cluster.id, `DISTRICT PRIORITY BRIEF: ${cluster.id}`, markdown, validationPassed ? 1 : 0, now);
    res.json({
        success: true,
        briefId,
        clusterId: cluster.id,
        markdown,
        validationPassed
    });
});
exports.default = router;
