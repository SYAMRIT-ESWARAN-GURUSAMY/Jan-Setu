import { Router, Request, Response } from 'express';
import { db } from '../database/db';
import { generatePolicyBriefMarkdown } from '../briefs/policyBriefGenerator';
import { calculatePriorityScore } from '../scoring/priorityEngine';

const router = Router();

// GET /api/policy-briefs
router.get('/policy-briefs', (req: Request, res: Response) => {
  const briefs = db.prepare(`
    SELECT pb.*, dc.problem_title, dc.category, dc.district_code, d.name as district_name
    FROM policy_briefs pb
    JOIN demand_clusters dc ON pb.cluster_id = dc.id
    JOIN districts d ON dc.district_code = d.code
    ORDER BY pb.generated_at DESC
  `).all();

  res.json({ briefs });
});

// GET /api/policy-briefs/:clusterId
router.get('/policy-briefs/:clusterId', (req: Request, res: Response) => {
  const brief = db.prepare(`
    SELECT pb.*, dc.problem_title, dc.category, dc.district_code, d.name as district_name
    FROM policy_briefs pb
    JOIN demand_clusters dc ON pb.cluster_id = dc.id
    JOIN districts d ON dc.district_code = d.code
    WHERE pb.cluster_id = ?
  `).get(req.params.clusterId);

  if (!brief) return res.status(404).json({ error: 'Policy brief not found for this cluster' });
  res.json({ brief });
});

// POST /api/policy-briefs (Generate Policy Brief for Cluster)
router.post('/policy-briefs', (req: Request, res: Response) => {
  const { clusterId } = req.body;
  const cluster = db.prepare(`SELECT * FROM demand_clusters WHERE id = ?`).get(clusterId) as any;
  if (!cluster) return res.status(404).json({ error: 'Cluster not found' });

  const district = db.prepare(`SELECT * FROM districts WHERE code = ?`).get(cluster.district_code) as any;
  const scoreResult = calculatePriorityScore(
    { id: cluster.id, citizens_affected: cluster.citizens_affected, urgency: cluster.urgency, district_code: cluster.district_code },
    district
  );

  const { markdown, validationPassed } = generatePolicyBriefMarkdown({
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

  db.prepare(`
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

export default router;
