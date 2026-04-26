export type IssueCategory = 'road' | 'garbage' | 'lights' | 'water' | 'park' | 'noise';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export interface Issue {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  lat: number;
  lng: number;
  address: string;
  ward: string;
  upvotes: number;
  photo?: string;
  createdAt: string;
  updatedAt: string;
  timeline: { date: string; status: string; note: string }[];
}

export const CATEGORIES: { key: IssueCategory; label: string; icon: string; color: string }[] = [
  { key: 'road', label: 'Road & Pothole', icon: '🛣️', color: 'hsl(0 72% 51%)' },
  { key: 'garbage', label: 'Garbage', icon: '🗑️', color: 'hsl(38 92% 50%)' },
  { key: 'lights', label: 'Street Lights', icon: '💡', color: 'hsl(45 93% 47%)' },
  { key: 'water', label: 'Water & Drainage', icon: '💧', color: 'hsl(210 100% 52%)' },
  { key: 'park', label: 'Parks & Public Space', icon: '🌳', color: 'hsl(142 71% 45%)' },
  { key: 'noise', label: 'Noise & Pollution', icon: '🔊', color: 'hsl(280 60% 50%)' },
];

export const WARDS = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6'];

const now = new Date();
const d = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString();

export const MOCK_ISSUES: Issue[] = [
  {
    id: '1', ticketId: 'CIV-1001', title: 'Large pothole on Main Street',
    description: 'A dangerous pothole has formed near the intersection of Main St and 5th Ave. Multiple cars have been damaged.',
    category: 'road', status: 'open', lat: 40.7128, lng: -74.006, address: 'Main St & 5th Ave',
    ward: 'Ward 1', upvotes: 47, createdAt: d(3), updatedAt: d(1),
    timeline: [
      { date: d(3), status: 'Reported', note: 'Issue submitted by resident' },
      { date: d(2), status: 'Acknowledged', note: 'Assigned to Roads Department' },
    ],
  },
  {
    id: '2', ticketId: 'CIV-1012', title: 'Overflowing garbage bins at Central Park',
    description: 'Garbage bins at the east entrance of Central Park have been overflowing for 3 days.',
    category: 'garbage', status: 'in_progress', lat: 40.7148, lng: -74.002, address: 'Central Park East Gate',
    ward: 'Ward 2', upvotes: 32, createdAt: d(5), updatedAt: d(1),
    timeline: [
      { date: d(5), status: 'Reported', note: 'Issue submitted' },
      { date: d(4), status: 'Acknowledged', note: 'Sanitation team notified' },
      { date: d(1), status: 'In Progress', note: 'Cleanup crew dispatched' },
    ],
  },
  {
    id: '3', ticketId: 'CIV-1025', title: 'Broken street light on Oak Avenue',
    description: 'Street light #4523 on Oak Avenue has been out for a week, making the area unsafe at night.',
    category: 'lights', status: 'resolved', lat: 40.7108, lng: -74.008, address: '234 Oak Avenue',
    ward: 'Ward 1', upvotes: 18, createdAt: d(10), updatedAt: d(2),
    timeline: [
      { date: d(10), status: 'Reported', note: 'Issue submitted' },
      { date: d(8), status: 'Acknowledged', note: 'Electrical team assigned' },
      { date: d(4), status: 'In Progress', note: 'Parts ordered' },
      { date: d(2), status: 'Resolved', note: 'Light replaced and functional' },
    ],
  },
  {
    id: '4', ticketId: 'CIV-1033', title: 'Water leak on Elm Street',
    description: 'A persistent water leak from a fire hydrant is wasting water and creating a slippery surface.',
    category: 'water', status: 'open', lat: 40.7158, lng: -74.01, address: '89 Elm Street',
    ward: 'Ward 3', upvotes: 55, createdAt: d(2), updatedAt: d(2),
    timeline: [
      { date: d(2), status: 'Reported', note: 'Issue submitted by resident' },
    ],
  },
  {
    id: '5', ticketId: 'CIV-1041', title: 'Vandalized park bench in Riverside Garden',
    description: 'Several benches have been spray-painted and one is broken.',
    category: 'park', status: 'in_progress', lat: 40.7118, lng: -74.004, address: 'Riverside Garden',
    ward: 'Ward 4', upvotes: 12, createdAt: d(7), updatedAt: d(3),
    timeline: [
      { date: d(7), status: 'Reported', note: 'Issue submitted' },
      { date: d(5), status: 'Acknowledged', note: 'Parks dept notified' },
      { date: d(3), status: 'In Progress', note: 'Repair scheduled' },
    ],
  },
  {
    id: '6', ticketId: 'CIV-1054', title: 'Loud construction noise at midnight',
    description: 'Construction work happening after 10 PM in a residential area.',
    category: 'noise', status: 'open', lat: 40.7138, lng: -74.0, address: '456 Pine Street',
    ward: 'Ward 5', upvotes: 28, createdAt: d(1), updatedAt: d(1),
    timeline: [
      { date: d(1), status: 'Reported', note: 'Issue submitted by resident' },
    ],
  },
  {
    id: '7', ticketId: 'CIV-1062', title: 'Clogged storm drain on 2nd Ave',
    description: 'Storm drain is completely clogged causing street flooding during rain.',
    category: 'water', status: 'resolved', lat: 40.7168, lng: -74.007, address: '2nd Avenue & 3rd St',
    ward: 'Ward 2', upvotes: 41, createdAt: d(14), updatedAt: d(5),
    timeline: [
      { date: d(14), status: 'Reported', note: 'Issue submitted' },
      { date: d(12), status: 'Acknowledged', note: 'Water dept assigned' },
      { date: d(8), status: 'In Progress', note: 'Inspection done' },
      { date: d(5), status: 'Resolved', note: 'Drain cleared and tested' },
    ],
  },
  {
    id: '8', ticketId: 'CIV-1070', title: 'Missing stop sign at Cedar Lane',
    description: 'Stop sign was knocked down by a vehicle 4 days ago.',
    category: 'road', status: 'in_progress', lat: 40.7098, lng: -74.003, address: 'Cedar Lane & Birch Rd',
    ward: 'Ward 6', upvotes: 63, createdAt: d(4), updatedAt: d(1),
    timeline: [
      { date: d(4), status: 'Reported', note: 'Issue submitted' },
      { date: d(3), status: 'Acknowledged', note: 'Traffic dept notified - urgent' },
      { date: d(1), status: 'In Progress', note: 'New sign being fabricated' },
    ],
  },
];

export const STATS = {
  totalIssues: 1284,
  resolved: 847,
  inProgress: 312,
  avgResolutionDays: 4.2,
};

let nextId = 9;
let nextTicket = 1078;

export function generateTicketId() {
  return `CIV-${nextTicket++}`;
}

export function generateId() {
  return String(nextId++);
}
