/**
 * Calculates the required verification quorum based on total citizen count.
 * Formula: LEAST(citizen_count, GREATEST(3, CEIL(0.05 * citizen_count)))
 */
export function calculateRequiredQuorum(citizenCount: number): number {
  if (citizenCount <= 0) return 0;
  const percentagePart = Math.ceil(0.05 * citizenCount);
  const floorThreshold = Math.max(3, percentagePart);
  return Math.min(citizenCount, floorThreshold);
}

export interface VerificationState {
  clusterId: string;
  citizenCount: number;
  requiredQuorum: number;
  confirmationsReceived: number;
  quorumReached: boolean;
  totalPhotosSubmitted: number;
  photosApprovedCount: number;
  photosPendingCount: number;
  photosRejectedCount: number;
  isFullyVerified: boolean;
  statusText: string;
}

export function evaluateVerificationStatus(
  clusterId: string,
  citizenCount: number,
  yesConfirmations: number,
  photos: { human_review_status: string }[]
): VerificationState {
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
  } else if (isFullyVerified) {
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
