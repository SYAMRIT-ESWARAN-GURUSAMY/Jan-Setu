"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const priorityEngine_1 = require("../scoring/priorityEngine");
const db_1 = require("../database/db");
const router = (0, express_1.Router)();
// GET /api/priority/calculate (Interactive Priority Score Calculator)
router.get('/priority/calculate', (req, res) => {
    const { citizens, urgency, districtCode } = req.query;
    const district = db_1.db.prepare(`SELECT * FROM districts WHERE code = ?`).get(districtCode || 'NGP');
    if (!district)
        return res.status(400).json({ error: 'Invalid district code' });
    const scoreResult = (0, priorityEngine_1.calculatePriorityScore)({
        id: 'SIMULATION-001',
        citizens_affected: parseInt(String(citizens || '47')),
        urgency: parseFloat(String(urgency || '0.85')),
        district_code: district.code
    }, district);
    res.json({
        districtCode: district.code,
        districtName: district.name,
        scoreResult
    });
});
exports.default = router;
