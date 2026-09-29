"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRequiredQuorum = calculateRequiredQuorum;
exports.evaluateVerificationStatus = evaluateVerificationStatus;
/**
 * Calculates the required verification quorum based on total citizen count.
 * Formula: LEAST(citizen_count, GREATEST(3, CEIL(0.05 * citizen_count)))
 */
function calculateRequiredQuorum(citizenCount) {
    if (citizenCount <= 0)
        return 0;
    const percentagePart = Math.ceil(0.05 * citizenCount);
    const floorThreshold = Math.max(3, percentagePart);
    return Math.min(citizenCount, floorThreshold);
}
function evaluateVerificationStatus(clusterId, citizenCount, yesConfirmations, photos) {
    const requiredQuorum = calculateRequiredQuorum(citizenCount);
    const quorumReached = yesConfirmations >= requiredQuorum;
    const totalPhotosSubmitted = photos.length;
    const photosApprovedCount = photos.filter(p => p.human_review_status === 'approved').length;
    const photosPendingCount = photos.filter(p => p.human_review_status === 'pending').length;
    const photosRejectedCount = photos.filter(p => p.human_review_status === 'rejected').length;
    // Fully verified when quorum is reached AND at least 1 photo is human-approved
    const isFullyVerified = quorumReached && photosApprovedCount >= 1;
    let statusText = 'AWAITING CITIZEN CONFIRMATION';
    if (quorumReached && !isFullyVerified) {
        statusText = 'QUORUM REACHED — AWAITING HUMAN PHOTO REVIEW';
    }
    else if (isFullyVerified) {
        statusText = 'VERIFIED OUTCOME';
    }
    return {
        clusterId,
        citizenCount,
        requiredQuorum,
        confirmationsReceived: yesConfirmations,
        quorumReached,
        totalPhotosSubmitted,
        photosApprovedCount,
        photosPendingCount,
        photosRejectedCount,
        isFullyVerified,
        statusText
    };
}
