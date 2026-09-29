import { db } from '../database/db';
import { calculatePriorityScore, DistrictData } from '../scoring/priorityEngine';

export interface ClusterMatchInput {
  complaintId: string;
  citizenId: string;
  category: string;
  districtCode: string;
  translatedText: string;
  approxLat?: number;
  approxLng?: number;
  geoHash?: string;
  urgency: number;
  approxLocation: string;
}

export function findOrCreateDemandCluster(input: ClusterMatchInput): { clusterId: string; isNewCluster: boolean } {
  // Query active clusters in the same district and category
  const existingClusters = db.prepare(`
    SELECT * FROM demand_clusters 
    WHERE district_code = ? AND category = ?
    ORDER BY created_at DESC
  `).all(input.districtCode, input.category) as any[];

  // Fetch district metadata for priority calculation
  const districtRow = db.prepare(`SELECT * FROM districts WHERE code = ?`).get(input.districtCode) as any;
  if (!districtRow) {
    throw new Error(`District code ${input.districtCode} not found`);
  }

  const districtData: DistrictData = {
    code: districtRow.code,
    name: districtRow.name,
    population: districtRow.population,
    bpl_pct: districtRow.bpl_pct,
    bpl_pct_confidence: districtRow.bpl_pct_confidence,
    infra_deficit_score: districtRow.infra_deficit_score,
    infra_deficit_confidence: districtRow.infra_deficit_confidence,
    existing_budget_allocation: districtRow.existing_budget_allocation,
    budget_confidence: districtRow.budget_confidence,
    estimated_reporting_capture_rate: districtRow.estimated_reporting_capture_rate,
    capture_rate_source: districtRow.capture_rate_source
  };

  let matchedCluster = existingClusters[0]; // match most recent active cluster in district/category for demo

  const now = new Date().toISOString();

  if (matchedCluster) {
    const clusterId = matchedCluster.id;
    
    // Check if complaint is already in cluster
    const memberCheck = db.prepare(`SELECT 1 FROM cluster_members WHERE cluster_id = ? AND complaint_id = ?`)
      .get(clusterId, input.complaintId);

    if (!memberCheck) {
      // Add member
      db.prepare(`INSERT INTO cluster_members (cluster_id, complaint_id, added_at) VALUES (?, ?, ?)`).run(
        clusterId,
        input.complaintId,
        now
      );

      // Count unique citizens in this cluster
      const citizenCountRow = db.prepare(`
        SELECT COUNT(DISTINCT c.citizen_id) as count
        FROM cluster_members cm
        JOIN complaints c ON cm.complaint_id = c.id
        WHERE cm.cluster_id = ?
      `).get(clusterId) as { count: number };

      const newCitizenCount = Math.max(1, citizenCountRow.count);
      const newUrgency = Math.max(matchedCluster.urgency, input.urgency);

      // Recalculate priority score using official engine formula
      const scoreResult = calculatePriorityScore({
        id: clusterId,
        citizens_affected: newCitizenCount,
        urgency: newUrgency,
        district_code: input.districtCode
      }, districtData);

      const hasSelfExtracted = scoreResult.has_self_extracted_data ? 1 : 0;
      const reviewStatus = hasSelfExtracted ? 'under_review' : matchedCluster.review_status;

      db.prepare(`
        UPDATE demand_clusters 
        SET citizens_affected = ?,
            urgency = ?,
            priority_score = ?,
            score_breakdown = ?,
            score_explanation = ?,
            has_self_extracted_data = ?,
            review_status = ?,
            updated_at = ?
        WHERE id = ?
      `).run(
        newCitizenCount,
        newUrgency,
        scoreResult.priority_score,
        JSON.stringify(scoreResult),
        scoreResult.explanation,
        hasSelfExtracted,
        reviewStatus,
        now,
        clusterId
      );

      // Update complaint cluster_id reference
      db.prepare(`UPDATE complaints SET cluster_id = ? WHERE id = ?`).run(clusterId, input.complaintId);
    }

    return { clusterId, isNewCluster: false };
  } else {
    // Generate new Cluster ID e.g. WTR-NGP-004
    const categoryPrefix = input.category.substring(0, 3).toUpperCase();
    const countRow = db.prepare(`SELECT COUNT(*) as cnt FROM demand_clusters`).get() as { cnt: number };
    const seq = String(countRow.cnt + 1).padStart(3, '0');
    const clusterId = `${categoryPrefix}-${input.districtCode}-${seq}`;

    const problemTitle = `Recurring ${input.category.toLowerCase()} Disruption in ${input.approxLocation}`;
    const problemSummary = `Multiple citizens reported severe ${input.category.toLowerCase()} infrastructure issues in ${input.districtCode} district.`;

    const scoreResult = calculatePriorityScore({
      id: clusterId,
      citizens_affected: 1,
      urgency: input.urgency,
      district_code: input.districtCode
    }, districtData);

    const hasSelfExtracted = scoreResult.has_self_extracted_data ? 1 : 0;

    db.prepare(`
      INSERT INTO demand_clusters (
        id, problem_title, problem_summary, district_code, category,
        citizens_affected, urgency, priority_score, score_breakdown, score_explanation,
        has_self_extracted_data, review_status, funding_status, verification_status,
        approx_location, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      clusterId,
      problemTitle,
      problemSummary,
      input.districtCode,
      input.category,
      1,
      input.urgency,
      scoreResult.priority_score,
      JSON.stringify(scoreResult),
      scoreResult.explanation,
      hasSelfExtracted,
      hasSelfExtracted ? 'under_review' : 'pending',
      'unfunded',
      'not_started',
      input.approxLocation,
      now,
      now
    );

    // Link complaint to new cluster
    db.prepare(`INSERT INTO cluster_members (cluster_id, complaint_id, added_at) VALUES (?, ?, ?)`).run(
      clusterId,
      input.complaintId,
      now
    );

    db.prepare(`UPDATE complaints SET cluster_id = ? WHERE id = ?`).run(clusterId, input.complaintId);

    return { clusterId, isNewCluster: true };
  }
}
