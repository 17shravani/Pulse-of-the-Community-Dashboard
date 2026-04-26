export type IssueCategory = 'road' | 'garbage' | 'lights' | 'water' | 'park' | 'noise' | 'animal';
export type ComplaintStatus = 'raised' | 'approved' | 'assigned' | 'in_progress' | 'completed' | 'rejected' | 'reopened';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type AppRole = 'admin' | 'officer' | 'ngo' | 'citizen';

export const CATEGORIES: { key: IssueCategory; label: string; icon: string; sla: number }[] = [
  { key: 'road', label: 'Road & Pothole', icon: '🛣️', sla: 72 },
  { key: 'garbage', label: 'Garbage', icon: '🗑️', sla: 24 },
  { key: 'lights', label: 'Street Lights', icon: '💡', sla: 48 },
  { key: 'water', label: 'Water & Drainage', icon: '💧', sla: 24 },
  { key: 'park', label: 'Parks', icon: '🌳', sla: 96 },
  { key: 'noise', label: 'Noise', icon: '🔊', sla: 48 },
  { key: 'animal', label: 'Animal Rescue', icon: '🐶', sla: 3 },
];

export const STAGES: ComplaintStatus[] = ['raised','approved','assigned','in_progress','completed'];
export const STAGE_LABEL: Record<ComplaintStatus,string> = {
  raised: 'Complaint Raised',
  approved: 'Approved',
  assigned: 'Task Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  rejected: 'Rejected',
  reopened: 'Reopened',
};

export interface Complaint {
  id: string;
  ticket_id: string;
  user_id: string | null;
  title: string;
  description: string;
  category: IssueCategory;
  status: ComplaintStatus;
  severity: Severity;
  lat: number; lng: number;
  address: string | null;
  ward: string | null;
  photo_url: string | null;
  resolved_photo_url: string | null;
  ai_verified: boolean;
  ai_confidence: number;
  ai_reason: string | null;
  upvotes: number;
  pressure_score: number;
  sla_hours: number;
  sla_deadline: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export function genTicketId() {
  return `CIV-${Math.floor(1000 + Math.random() * 9000)}`;
}
