import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MOCK_ISSUES, CATEGORIES } from '@/lib/data';
import type { Issue, IssueCategory } from '@/lib/data';
import IssueDetailModal from '@/components/IssueDetailModal';
import 'leaflet/dist/leaflet.css';

function createIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const STATUS_COLORS: Record<string, string> = {
  open: 'hsl(0,72%,51%)',
  in_progress: 'hsl(38,92%,50%)',
  resolved: 'hsl(142,71%,45%)',
};

export default function LiveMap() {
  const [issues] = useState(MOCK_ISSUES);
  const [filter, setFilter] = useState<IssueCategory | 'all'>('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const filtered = useMemo(
    () => (filter === 'all' ? issues : issues.filter((i) => i.category === filter)),
    [issues, filter]
  );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-card border-b md:border-b-0 md:border-r border-border p-4 overflow-auto">
        <h2 className="font-heading font-bold text-lg mb-4">Filter Issues</h2>
        <div className="flex flex-wrap md:flex-col gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            All ({issues.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = issues.filter((i) => i.category === cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === cat.key ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <span>{cat.icon}</span> {cat.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Legend</h3>
          <div className="space-y-1.5">
            {[
              { label: 'Open', color: STATUS_COLORS.open },
              { label: 'In Progress', color: STATUS_COLORS.in_progress },
              { label: 'Resolved', color: STATUS_COLORS.resolved },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer center={[40.7128, -74.006]} zoom={14} className="h-full w-full" style={{ borderRadius: 0 }}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {filtered.map((issue) => (
            <Marker
              key={issue.id}
              position={[issue.lat, issue.lng]}
              icon={createIcon(STATUS_COLORS[issue.status])}
              eventHandlers={{ click: () => setSelectedIssue(issue) }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{issue.title}</strong>
                  <br />
                  <span className="text-xs">{issue.ticketId} · {issue.address}</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <IssueDetailModal issue={selectedIssue} open={!!selectedIssue} onClose={() => setSelectedIssue(null)} />
    </div>
  );
}
