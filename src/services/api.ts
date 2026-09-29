const RAW_API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '';
const API_BASE = RAW_API_URL
  ? (RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL.replace(/\/+$/, '')}/api`)
  : '/api';
const ADMIN_TOKEN = (import.meta.env.VITE_ADMIN_TOKEN as string | undefined) || 'jansetu-admin-token-2026';

export interface District {
  code: string;
  name: string;
  state: string;
  population: number;
  population_source: string;
  population_as_of: string;
  population_confidence: string;
  bpl_pct: number;
  bpl_pct_source: string;
  bpl_pct_as_of: string;
  bpl_pct_confidence: string;
  infra_deficit_score: number;
  infra_deficit_source: string;
  infra_deficit_as_of: string;
  infra_deficit_confidence: string;
  existing_budget_allocation: number;
  budget_source: string;
  budget_as_of: string;
  budget_confidence: string;
  estimated_reporting_capture_rate: number;
  capture_rate_source: string;
  active_clusters?: number;
  avg_priority_score?: number;
  high_priority_clusters?: number;
}

export interface DemandCluster {
  id: string;
  problem_title: string;
  problem_summary: string;
  district_code: string;
  category: string;
  citizens_affected: number;
  urgency: number;
  priority_score: number;
  score_breakdown: any;
  score_explanation: string;
  has_self_extracted_data: number;
  review_status: string;
  funding_status: string;
  funded_amount: number;
  funded_at: string;
  verification_status: string;
  approx_location: string;
  created_at: string;
  updated_at: string;
  district_name?: string;
  bpl_pct?: number;
  infra_deficit_score?: number;
  estimated_reporting_capture_rate?: number;
}

export interface Complaint {
  id: string;
  citizen_id: string;
  district_code: string;
  cluster_id: string;
  channel: string;
  language: string;
  audio_url: string;
  original_transcript: string;
  translated_text: string;
  category: string;
  urgency: number;
  created_at: string;
  cluster_title?: string;
  district_name?: string;
  telegram_handle?: string;
}

export interface ReviewFlag {
  id: string;
  cluster_id: string;
  complaint_id: string;
  flag_type: string;
  reason: string;
  priority_score: number;
  status: string;
  created_at: string;
  problem_title?: string;
  category?: string;
  district_name?: string;
}

export interface PolicyBrief {
  id: string;
  cluster_id: string;
  title: string;
  content_markdown: string;
  numeric_validation_passed: number;
  generated_at: string;
  problem_title?: string;
  category?: string;
  district_name?: string;
}

export async function fetchDistricts(): Promise<District[]> {
  const res = await fetch(`${API_BASE}/districts`);
  const data = await res.json();
  return data.districts || [];
}

export async function fetchDistrictByCode(code: string): Promise<{ district: District; clusters: DemandCluster[]; indicators: any[] }> {
  const res = await fetch(`${API_BASE}/districts/${code}`);
  return await res.json();
}

export async function fetchClusters(): Promise<DemandCluster[]> {
  const res = await fetch(`${API_BASE}/clusters`);
  const data = await res.json();
  return data.clusters || [];
}

export async function fetchClusterById(id: string): Promise<{
  cluster: DemandCluster;
  complaints: Complaint[];
  flags: ReviewFlag[];
  funding: any[];
  policyBrief: PolicyBrief | null;
}> {
  const res = await fetch(`${API_BASE}/clusters/${id}`);
  return await res.json();
}

export async function fetchComplaints(): Promise<Complaint[]> {
  const res = await fetch(`${API_BASE}/complaints`);
  const data = await res.json();
  return data.complaints || [];
}

export async function processComplaint(payload: {
  language: 'Tamil' | 'Hindi';
  inputType: 'voice' | 'text';
  textInput?: string;
  presetKey?: string;
  citizenHandle?: string;
}) {
  const res = await fetch(`${API_BASE}/process/complaint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

export async function fundCluster(clusterId: string, amount: number, notes: string) {
  const res = await fetch(`${API_BASE}/clusters/${clusterId}/fund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`
    },
    body: JSON.stringify({ amount, notes, funded_by: 'District Collectorate Emergency Fund' })
  });
  return await res.json();
}

export async function fetchReviewFlags(): Promise<ReviewFlag[]> {
  const res = await fetch(`${API_BASE}/review`);
  const data = await res.json();
  return data.flags || [];
}

export async function approveReviewFlag(flagId: string) {
  const res = await fetch(`${API_BASE}/review/${flagId}/approve`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
  });
  return await res.json();
}

export async function dismissReviewFlag(flagId: string) {
  const res = await fetch(`${API_BASE}/review/${flagId}/dismiss`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
  });
  return await res.json();
}

export async function fetchPolicyBriefs(): Promise<PolicyBrief[]> {
  const res = await fetch(`${API_BASE}/policy-briefs`);
  const data = await res.json();
  return data.briefs || [];
}

export async function generatePolicyBrief(clusterId: string) {
  const res = await fetch(`${API_BASE}/policy-briefs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clusterId })
  });
  return await res.json();
}

export async function fetchVerificationDetails(clusterId: string) {
  const res = await fetch(`${API_BASE}/verification/${clusterId}`);
  return await res.json();
}

export async function submitVerificationReply(clusterId: string, response: 'YES' | 'NO', comments?: string, citizenHandle?: string) {
  const res = await fetch(`${API_BASE}/verification/${clusterId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ response, comments, citizenHandle })
  });
  return await res.json();
}

export async function submitPhotoEvidence(clusterId: string, photoUrl: string, caption: string, citizenHandle?: string) {
  const res = await fetch(`${API_BASE}/verification/${clusterId}/evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photoUrl, caption, citizenHandle })
  });
  return await res.json();
}

export async function reviewPhotoEvidence(photoId: string, action: 'approve' | 'reject', notes?: string) {
  const res = await fetch(`${API_BASE}/verification/${photoId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`
    },
    body: JSON.stringify({ action, notes })
  });
  return await res.json();
}

export async function fetchAuditEvents() {
  const res = await fetch(`${API_BASE}/audit`);
  const data = await res.json();
  return data.events || [];
}

export async function runDemoStep(step: number) {
  const res = await fetch(`${API_BASE}/demo/run-step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step })
  });
  return await res.json();
}

export async function resetDemoState() {
  const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
  return await res.json();
}

export async function calculateSimulatedPriority(citizens: number, urgency: number, districtCode: string) {
  const res = await fetch(`${API_BASE}/priority/calculate?citizens=${citizens}&urgency=${urgency}&districtCode=${districtCode}`);
  return await res.json();
}
