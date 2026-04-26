import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle, Clock, TrendingUp, Search } from 'lucide-react';
import { MOCK_ISSUES, CATEGORIES, STATS, WARDS } from '@/lib/data';
import type { Issue } from '@/lib/data';
import IssueDetailModal from '@/components/IssueDetailModal';
import StatCard from '@/components/StatCard';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const PIE_COLORS = ['#ef4444', '#f59e0b', '#eab308', '#3b82f6', '#22c55e', '#8b5cf6'];

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const categoryData = CATEGORIES.map((cat, i) => ({
    name: cat.label,
    value: MOCK_ISSUES.filter((i) => i.category === cat.key).length,
    color: PIE_COLORS[i],
  }));

  const wardData = WARDS.map((ward) => {
    const wardIssues = MOCK_ISSUES.filter((i) => i.ward === ward);
    return {
      ward,
      total: wardIssues.length,
      resolved: wardIssues.filter((i) => i.status === 'resolved').length,
    };
  });

  const filteredIssues = MOCK_ISSUES.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      i.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Real-time overview of community issues</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon={MapPin} label="Total Issues" value={STATS.totalIssues.toLocaleString()} color="bg-primary/10 text-primary" />
        <StatCard icon={CheckCircle} label="Resolved" value={STATS.resolved.toLocaleString()} color="bg-success/10 text-success" delay={0.1} />
        <StatCard icon={Clock} label="In Progress" value={STATS.inProgress} color="bg-accent/10 text-accent" delay={0.2} />
        <StatCard icon={TrendingUp} label="Avg Resolution" value={`${STATS.avgResolutionDays}d`} color="bg-info/10 text-info" delay={0.3} />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-xl p-6">
          <h3 className="font-heading font-semibold mb-4">Issues by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {categoryData.map((entry, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
                {entry.name}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6">
          <h3 className="font-heading font-semibold mb-4">Ward-wise Resolution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={wardData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 88%)" />
              <XAxis dataKey="ward" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="hsl(210 100% 52%)" radius={[4, 4, 0, 0]} name="Total" />
              <Bar dataKey="resolved" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Issues Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <h3 className="font-heading font-semibold">All Issues</h3>
          <div className="ml-auto relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search issues..."
              className="pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Ticket</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Issue</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Ward</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Upvotes</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue) => {
                const cat = CATEGORIES.find((c) => c.key === issue.category);
                const statusClass = issue.status === 'open' ? 'status-open' : issue.status === 'in_progress' ? 'status-progress' : 'status-resolved';
                const statusLabel = issue.status === 'open' ? 'Open' : issue.status === 'in_progress' ? 'In Progress' : 'Resolved';
                return (
                  <tr
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue)}
                    className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono text-xs">{issue.ticketId}</td>
                    <td className="p-3 font-medium max-w-[200px] truncate">{issue.title}</td>
                    <td className="p-3"><span className="flex items-center gap-1">{cat?.icon} {cat?.label}</span></td>
                    <td className="p-3">{issue.ward}</td>
                    <td className="p-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusClass}`}>{statusLabel}</span></td>
                    <td className="p-3 font-bold">{issue.upvotes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <IssueDetailModal issue={selectedIssue} open={!!selectedIssue} onClose={() => setSelectedIssue(null)} />
    </div>
  );
}
