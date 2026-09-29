import { Router, Request, Response } from 'express';
import { db } from '../database/db';

const router = Router();

// GET /api/audit
router.get('/audit', (req: Request, res: Response) => {
  const events = db.prepare(`SELECT * FROM audit_events ORDER BY timestamp DESC LIMIT 100`).all();
  res.json({ events });
});

// POST /api/audit/event
router.post('/audit/event', (req: Request, res: Response) => {
  const { event_type, actor, cluster_id, description, metadata } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO audit_events (event_type, actor, cluster_id, description, metadata_json, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    event_type || 'MANUAL_LOG',
    actor || 'admin',
    cluster_id || null,
    description || 'Custom audit event',
    metadata ? JSON.stringify(metadata) : null,
    now
  );

  res.json({ success: true });
});

export default router;
