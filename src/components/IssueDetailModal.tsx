import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Issue, CATEGORIES } from '@/lib/data';
import { MapPin, Clock, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  issue: Issue | null;
  open: boolean;
  onClose: () => void;
}

export default function IssueDetailModal({ issue, open, onClose }: Props) {
  if (!issue) return null;
  const cat = CATEGORIES.find((c) => c.key === issue.category);
  const statusClass =
    issue.status === 'open' ? 'status-open' : issue.status === 'in_progress' ? 'status-progress' : 'status-resolved';
  const statusLabel = issue.status === 'open' ? 'Open' : issue.status === 'in_progress' ? 'In Progress' : 'Resolved';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <span className="text-xl">{cat?.icon}</span>
            {issue.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClass}`}>{statusLabel}</span>
            <span className="text-xs font-mono text-muted-foreground">{issue.ticketId}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ChevronUp className="w-3 h-3" /> {issue.upvotes} upvotes
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{issue.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{issue.address}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3">Status Timeline</h4>
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-[9px] top-1 bottom-1 w-0.5 bg-border" />
              {issue.timeline.map((event, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-6 top-1 w-[18px] h-[18px] rounded-full border-2 border-primary bg-background flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{event.status}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{event.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
