"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../database/db");
const quorumService_1 = require("../verification/quorumService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/verification/:clusterId
router.get('/verification/:clusterId', (req, res) => {
    const clusterId = req.params.clusterId;
    const cluster = db_1.db.prepare(`SELECT * FROM demand_clusters WHERE id = ?`).get(clusterId);
    if (!cluster)
        return res.status(404).json({ error: 'Cluster not found' });
    const request = db_1.db.prepare(`SELECT * FROM verification_requests WHERE cluster_id = ?`).get(clusterId);
    const replies = db_1.db.prepare(`
    SELECT vr.*, c.telegram_handle
    FROM verification_replies vr
    JOIN citizens c ON vr.citizen_id = c.id
    WHERE vr.cluster_id = ?
    ORDER BY vr.timestamp DESC
  `).all(clusterId);
    const photos = db_1.db.prepare(`SELECT * FROM evidence_photos WHERE cluster_id = ? ORDER BY uploaded_at DESC`).all(clusterId);
    const yesCount = replies.filter(r => r.response === 'YES').length;
    const state = (0, quorumService_1.evaluateVerificationStatus)(clusterId, cluster.citizens_affected, yesCount, photos);
    res.json({
        cluster,
        request,
        replies,
        photos,
        state
    });
});
// POST /api/verification/:id/reply (Simulate Telegram citizen confirmation reply)
router.post('/verification/:id/reply', (req, res) => {
    const clusterId = req.params.id;
    const { citizenHandle, response, comments } = req.body;
    const cluster = db_1.db.prepare(`SELECT * FROM demand_clusters WHERE id = ?`).get(clusterId);
    if (!cluster)
        return res.status(404).json({ error: 'Cluster not found' });
    const now = new Date().toISOString();
    const citizenId = `cit_${Math.floor(1000 + Math.random() * 9000)}`;
    db_1.db.prepare(`
    INSERT INTO citizens (id, telegram_handle, created_at)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `).run(citizenId, citizenHandle || `@citizen_ver_${citizenId}`, now);
    // Fetch or create verification request
    let reqRow = db_1.db.prepare(`SELECT * FROM verification_requests WHERE cluster_id = ?`).get(clusterId);
    if (!reqRow) {
        const quorum = (0, quorumService_1.calculateRequiredQuorum)(cluster.citizens_affected);
        const reqId = `req_${Date.now()}`;
        db_1.db.prepare(`
      INSERT INTO verification_requests (id, cluster_id, required_quorum, confirmations_count, status, created_at)
      VALUES (?, ?, ?, 0, 'active', ?)
    `).run(reqId, clusterId, quorum, now);
        reqRow = { id: reqId, required_quorum: quorum };
    }
    const replyId = `rep_${Date.now()}`;
    db_1.db.prepare(`
    INSERT INTO verification_replies (id, request_id, cluster_id, citizen_id, response, comments, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(replyId, reqRow.id, clusterId, citizenId, response || 'YES', comments || 'Issue resolved', now);
    // Recalculate confirmations count
    const yesCountRow = db_1.db.prepare(`
    SELECT COUNT(*) as count FROM verification_replies WHERE cluster_id = ? AND response = 'YES'
  `).get(clusterId);
    const yesCount = yesCountRow.count;
    const quorumReached = yesCount >= reqRow.required_quorum;
    const photos = db_1.db.prepare(`SELECT * FROM evidence_photos WHERE cluster_id = ?`).all(clusterId);
    const evalState = (0, quorumService_1.evaluateVerificationStatus)(clusterId, cluster.citizens_affected, yesCount, photos);
    // Update cluster status
    let newStatus = cluster.verification_status;
    if (evalState.isFullyVerified) {
        newStatus = 'verified';
    }
    else if (quorumReached) {
        newStatus = 'human_photo_review';
    }
    else {
        newStatus = 'awaiting_confirmation';
    }
    db_1.db.prepare(`
    UPDATE demand_clusters
    SET verification_status = ?, updated_at = ?
    WHERE id = ?
  `).run(newStatus, now, clusterId);
    db_1.db.prepare(`UPDATE verification_requests SET confirmations_count = ? WHERE id = ?`).run(yesCount, reqRow.id);
    res.json({
        success: true,
        replyId,
        confirmationsCount: yesCount,
        requiredQuorum: reqRow.required_quorum,
        quorumReached,
        evalState
    });
});
// POST /api/verification/:id/evidence (Upload Photo Evidence)
router.post('/verification/:id/evidence', (req, res) => {
    const clusterId = req.params.id;
    const { photoUrl, caption, citizenHandle } = req.body;
    const cluster = db_1.db.prepare(`SELECT * FROM demand_clusters WHERE id = ?`).get(clusterId);
    if (!cluster)
        return res.status(404).json({ error: 'Cluster not found' });
    const now = new Date().toISOString();
    const citizenId = `cit_${Math.floor(1000 + Math.random() * 9000)}`;
    db_1.db.prepare(`
    INSERT INTO citizens (id, telegram_handle, created_at)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `).run(citizenId, citizenHandle || `@citizen_photo_${citizenId}`, now);
    const photoId = `pho_${Date.now()}`;
    const defaultPhoto = photoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=600&q=80';
    db_1.db.prepare(`
    INSERT INTO evidence_photos (id, cluster_id, citizen_id, photo_url, caption, human_review_status, uploaded_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?)
  `).run(photoId, clusterId, citizenId, defaultPhoto, caption || 'Citizen submitted photo evidence', now);
    // Add review flag for human photo review
    db_1.db.prepare(`
    INSERT INTO review_flags (id, cluster_id, flag_type, reason, priority_score, status, created_at)
    VALUES (?, ?, 'photo_evidence', ?, ?, 'pending', ?)
  `).run(`flg_${Date.now()}`, clusterId, `Photo evidence submitted by ${citizenHandle || citizenId} awaiting human review.`, cluster.priority_score, now);
    res.json({
        success: true,
        photoId,
        message: 'Photo evidence submitted and routed to Human Review queue.'
    });
});
// POST /api/verification/:id/review (Human Reviewer Photo Action - Protected)
router.post('/verification/:id/review', auth_1.requireAdminAuth, (req, res) => {
    const photoId = req.params.id;
    const { action, notes } = req.body; // action: 'approve' | 'reject'
    const photo = db_1.db.prepare(`SELECT * FROM evidence_photos WHERE id = ?`).get(photoId);
    if (!photo)
        return res.status(404).json({ error: 'Evidence photo not found' });
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const now = new Date().toISOString();
    db_1.db.prepare(`
    UPDATE evidence_photos
    SET human_review_status = ?, reviewer_notes = ?
    WHERE id = ?
  `).run(newStatus, notes || `Human reviewer marked as ${newStatus}`, photoId);
    // Check if cluster is now fully verified
    const cluster = db_1.db.prepare(`SELECT * FROM demand_clusters WHERE id = ?`).get(photo.cluster_id);
    const yesReplies = db_1.db.prepare(`SELECT COUNT(*) as cnt FROM verification_replies WHERE cluster_id = ? AND response = 'YES'`).get(photo.cluster_id);
    const photos = db_1.db.prepare(`SELECT * FROM evidence_photos WHERE cluster_id = ?`).all(photo.cluster_id);
    const evalState = (0, quorumService_1.evaluateVerificationStatus)(photo.cluster_id, cluster.citizens_affected, yesReplies.cnt, photos);
    if (evalState.isFullyVerified) {
        db_1.db.prepare(`UPDATE demand_clusters SET verification_status = 'verified', updated_at = ? WHERE id = ?`).run(now, photo.cluster_id);
        db_1.db.prepare(`
      INSERT INTO audit_events (event_type, actor, cluster_id, description, metadata_json, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('OUTCOME_VERIFIED', 'human_reviewer', photo.cluster_id, `Cluster ${photo.cluster_id} marked as VERIFIED OUTCOME after human photo approval.`, JSON.stringify({ photoId, notes }), now);
    }
    res.json({
        success: true,
        photoId,
        human_review_status: newStatus,
        evalState
    });
});
exports.default = router;
