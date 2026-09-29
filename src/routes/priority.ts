import { Router, Request, Response } from 'express';
import { calculatePriorityScore, DistrictData } from '../scoring/priorityEngine';
import { db } from '../database/db';

const router = Router();

// GET /api/priority/calculate (Interactive Priority Score Calculator)
router.get('/priority/calculate', (req: Request, res: Response) => {
  const { citizens, urgency, districtCode } = req.query;

  const district = db.prepare(`SELECT * FROM districts WHERE code = ?`).get(districtCode || 'NGP') as any;
  if (!district) return res.status(400).json({ error: 'Invalid district code' });

  const scoreResult = calculatePriorityScore({
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

export default router;
