"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../database/db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/review
router.get('/review', (req, res) => {
    const flags = db_1.db.prepare(`
    SELECT rf.*, dc.problem_title, dc.category, dc.priority_score, dc.district_code, d.name as district_name
    FROM review_flags rf
    LEFT JOIN demand_clusters dc ON rf.cluster_id = dc.id
    LEFT JOIN districts d ON dc.district_code = d.code
    ORDER BY rf.created_at DESC
  `).all();
    res.json({ flags });
});
// POST /api/review/:id/approve (Protected route)
router.post('/review/:id/approve', auth_1.requireAdminAuth, (req, res) => {
    const flagId = req.params.id;
    const flag = db_1.db.prepare(`SELECT * FROM review_flags WHERE id = ?`).get(flagId);
    if (!flag)
        return res.status(404).json({ error: 'Flag not found' });
    db_1.db.prepare(`UPDATE review_flags SET status = 'approved' WHERE id = ?`).run(flagId);
    if (flag.cluster_id) {
        db_1.db.prepare(`UPDATE demand_clusters SET review_status = 'approved', updated_at = ? WHERE id = ?`)
            .run(new Date().toISOString(), flag.cluster_id);
    }
    db_1.db.prepare(`
    INSERT INTO audit_events (event_type, actor, cluster_id, description, metadata_json, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('REVIEW_FLAG_APPROVED', 'human_reviewer', flag.cluster_id, `Human reviewer approved flag ${flagId} (${flag.flag_type}).`, JSON.stringify(flag), new Date().toISOString());
    res.json({ success: true, message: `Flag ${flagId} approved successfully.` });
});
// POST /api/review/:id/dismiss (Protected route)
router.post('/review/:id/dismiss', auth_1.requireAdminAuth, (req, res) => {
    const flagId = req.params.id;
    db_1.db.prepare(`UPDATE review_flags SET status = 'dismissed' WHERE id = ?`).run(flagId);
    res.json({ success: true, message: `Flag ${flagId} dismissed.` });
});
exports.default = router;
