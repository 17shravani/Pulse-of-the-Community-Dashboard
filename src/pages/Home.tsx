import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { MOCK_ISSUES, CATEGORIES, STATS } from '@/lib/data';
import StatCard from '@/components/StatCard';
import IssueCard from '@/components/IssueCard';
import IssueDetailModal from '@/components/IssueDetailModal';
import type { Issue } from '@/lib/data';

export default function Home() {
  const [issues, setIssues] = useState(MOCK_ISSUES);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const handleUpvote = (id: string) => {
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i)));
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 civic-gradient opacity-5" />
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full bg-accent/10 blur-3xl" />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Live Community Reports
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight mb-6">
              Your City.<br />
              <span className="civic-gradient-text">Your Voice.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Report infrastructure issues, track resolutions, and hold your city accountable — all in real time.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/report"
                className="civic-gradient text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                Report an Issue <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/map"
                className="bg-card border border-border px-6 py-3 rounded-xl font-semibold hover:bg-muted transition-colors inline-flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" /> Explore Map
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-4 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={MapPin} label="Total Issues" value={STATS.totalIssues.toLocaleString()} color="bg-primary/10 text-primary" delay={0} />
          <StatCard icon={CheckCircle} label="Resolved" value={STATS.resolved.toLocaleString()} color="bg-success/10 text-success" delay={0.1} />
          <StatCard icon={Clock} label="In Progress" value={STATS.inProgress} color="bg-accent/10 text-accent" delay={0.2} />
          <StatCard icon={TrendingUp} label="Avg Resolution" value={`${STATS.avgResolutionDays} days`} color="bg-info/10 text-info" delay={0.3} />
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 mb-16">
        <h2 className="text-2xl font-heading font-bold mb-6">Report by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/report?category=${cat.key}`}
                className="glass-card rounded-xl p-4 text-center hover:shadow-lg transition-shadow block"
              >
                <span className="text-3xl block mb-2">{cat.icon}</span>
                <span className="text-xs font-medium">{cat.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Issues */}
      <section className="container mx-auto px-4 mb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold">Recent Issues</h2>
          <Link to="/map" className="text-sm text-primary hover:underline font-medium">View all →</Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {issues.slice(0, 6).map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onUpvote={handleUpvote}
              onClick={setSelectedIssue}
            />
          ))}
        </div>
      </section>

      <IssueDetailModal issue={selectedIssue} open={!!selectedIssue} onClose={() => setSelectedIssue(null)} />
    </div>
  );
}
