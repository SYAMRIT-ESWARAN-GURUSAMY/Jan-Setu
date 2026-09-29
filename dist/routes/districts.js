"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../database/db");
const router = (0, express_1.Router)();
// GET /api/districts
router.get('/districts', (req, res) => {
    const districts = db_1.db.prepare(`
    SELECT d.*, 
           COUNT(DISTINCT dc.id) as active_clusters,
           AVG(dc.priority_score) as avg_priority_score,
           SUM(CASE WHEN dc.priority_score >= 70 THEN 1 ELSE 0 END) as high_priority_clusters
    FROM districts d
    LEFT JOIN demand_clusters dc ON d.code = dc.district_code
    GROUP BY d.code
    ORDER BY d.infra_deficit_score DESC
  `).all();
    res.json({ districts });
});
// GET /api/districts/:code
router.get('/districts/:code', (req, res) => {
    const district = db_1.db.prepare(`SELECT * FROM districts WHERE code = ?`).get(req.params.code);
    if (!district)
        return res.status(404).json({ error: 'District not found' });
    const clusters = db_1.db.prepare(`SELECT * FROM demand_clusters WHERE district_code = ? ORDER BY priority_score DESC`).all(req.params.code);
    const indicators = db_1.db.prepare(`SELECT * FROM district_indicators WHERE district_code = ?`).all(req.params.code);
    res.json({ district, clusters, indicators });
});
exports.default = router;
