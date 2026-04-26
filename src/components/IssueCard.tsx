import { motion } from 'framer-motion';
import { ChevronUp, MapPin, Clock } from 'lucide-react';
import { Issue, CATEGORIES } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  issue: Issue;
  onUpvote?: (id: string) => void;
  onClick?: (issue: Issue) => void;
}

export default function IssueCard({ issue, onUpvote, onClick }: Props) {
  const cat = CATEGORIES.find((c) => c.key === issue.category);
  const statusClass =
    issue.status === 'open' ? 'status-open' : issue.status === 'in_progress' ? 'status-progress' : 'status-resolved';
  const statusLabel = issue.status === 'open' ? 'Open' : issue.status === 'in_progress' ? 'In Progress' : 'Resolved';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card rounded-xl p-4 cursor-pointer transition-shadow hover:shadow-xl"
      onClick={() => onClick?.(issue)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{cat?.icon}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusClass}`}>{statusLabel}</span>
            <span className="text-xs text-muted-foreground">{issue.ticketId}</span>
          </div>
          <h3 className="font-heading font-semibold text-sm truncate">{issue.title}</h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{issue.address}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onUpvote?.(issue.id); }}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg bg-muted hover:bg-primary/10 transition-colors group"
        >
          <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-xs font-bold">{issue.upvotes}</span>
        </button>
      </div>
    </motion.div>
  );
}
