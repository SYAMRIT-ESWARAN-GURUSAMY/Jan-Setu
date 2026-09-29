"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../database/db");
const router = (0, express_1.Router)();
// GET /api/audit
router.get('/audit', (req, res) => {
    const events = db_1.db.prepare(`SELECT * FROM audit_events ORDER BY timestamp DESC LIMIT 100`).all();
    res.json({ events });
});
// POST /api/audit/event
router.post('/audit/event', (req, res) => {
    const { event_type, actor, cluster_id, description, metadata } = req.body;
    const now = new Date().toISOString();
    db_1.db.prepare(`
    INSERT INTO audit_events (event_type, actor, cluster_id, description, metadata_json, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(event_type || 'MANUAL_LOG', actor || 'admin', cluster_id || null, description || 'Custom audit event', metadata ? JSON.stringify(metadata) : null, now);
    res.json({ success: true });
});
exports.default = router;
