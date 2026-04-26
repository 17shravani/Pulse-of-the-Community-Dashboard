import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Clock, AlertTriangle, ThumbsUp, ThumbsDown, MapPin, ArrowLeft, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { STAGES, STAGE_LABEL, type Complaint } from '@/lib/types';
import { toast } from 'sonner';

interface Update { id: string; status: string; note: string | null; created_at: string; proof_url: string | null; }

export default function TrackComplaint() {
  const { ticket } = useParams();
  const { user } = useAuth();
  const [c, setC] = useState<Complaint | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [now, setNow] = useState(Date.now());

  const load = async () => {
    if (!ticket) return;
    const { data: cmp } = await supabase.from('complaints').select('*').eq('ticket_id', ticket).maybeSingle();
    if (!cmp) return;
    setC(cmp as Complaint);
    const { data: ups } = await supabase.from('complaint_updates').select('*').eq('complaint_id', cmp.id).order('created_at', { ascending: true });
    setUpdates((ups ?? []) as Update[]);
  };

  useEffect(() => { load(); }, [ticket]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  if (!c) return <div className="container mx-auto px-4 py-20 text-center">Loading...</div>;

  const currentIdx = STAGES.indexOf(c.status);
  const slaMs = c.sla_deadline ? new Date(c.sla_deadline).getTime() - now : 0;
  const overdue = slaMs < 0 && c.status !== 'completed';
  const slaHrs = Math.abs(slaMs / 3600000).toFixed(1);

  const vote = async (type: 'confirm' | 'reject') => {
    if (!user) { toast.error('Sign in to vote'); return; }
    const { error } = await supabase.from('complaint_votes').insert({ complaint_id: c.id, user_id: user.id, vote_type: type });
    if (error) toast.error(error.message); else toast.success('Recorded');
    load();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back</Link>

      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
          <div>
            <p className="text-xs text-muted-foreground font-mono">#{c.ticket_id}</p>
            <h1 className="text-2xl font-heading font-bold">{c.title}</h1>
          </div>
          {c.ai_verified && (
            <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Verified</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.address || `${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`}</p>
        {c.photo_url && <img src={c.photo_url} alt="" className="mt-4 rounded-xl max-h-72" />}
      </div>

      {/* SLA banner */}
      <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${overdue ? 'bg-destructive/10 border border-destructive/30' : 'bg-primary/5 border border-primary/20'}`}>
        {overdue ? <AlertTriangle className="w-5 h-5 text-destructive" /> : <Clock className="w-5 h-5 text-primary" />}
        <div className="text-sm">
          <p className="font-semibold">{overdue ? 'SLA breached — escalation triggered' : 'SLA active'}</p>
          <p className="text-xs text-muted-foreground">{overdue ? `${slaHrs}h overdue` : `${slaHrs}h remaining (${c.sla_hours}h SLA)`}</p>
        </div>
      </div>

      {/* Parcel-style stages */}
      <h2 className="font-heading font-bold mb-4">Tracking</h2>
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          {STAGES.map((s, i) => {
            const done = i <= currentIdx && c.status !== 'rejected';
            return (
              <div key={s} className="flex flex-col items-center flex-1 relative">
                <motion.div
                  initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center z-10 ${done ? 'civic-gradient text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {done ? <Check className="w-5 h-5" /> : i + 1}
                </motion.div>
                {i < STAGES.length - 1 && (
                  <div className={`absolute top-4 left-1/2 w-full h-0.5 ${i < currentIdx ? 'bg-primary' : 'bg-muted'}`} />
                )}
                <span className="text-[10px] mt-2 text-center">{STAGE_LABEL[s]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <h2 className="font-heading font-bold mb-4">Activity</h2>
      <div className="glass-card rounded-2xl p-6 mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
          <div>
            <p className="text-sm font-semibold">Complaint Raised</p>
            <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
          </div>
        </div>
        {updates.map((u) => (
          <div key={u.id} className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <div>
              <p className="text-sm font-semibold">{STAGE_LABEL[u.status as keyof typeof STAGE_LABEL] || u.status}</p>
              <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString()}</p>
              {u.note && <p className="text-sm mt-1">{u.note}</p>}
              {u.proof_url && <img src={u.proof_url} alt="" className="mt-2 rounded-lg max-h-40" />}
            </div>
          </div>
        ))}
      </div>

      {/* Crowd verification */}
      {c.status === 'completed' && (
        <div className="glass-card rounded-2xl p-6 text-center">
          <p className="text-sm font-semibold mb-3">Was this issue actually resolved?</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => vote('confirm')} className="px-4 py-2 rounded-lg bg-success/10 text-success font-semibold inline-flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> Confirm</button>
            <button onClick={() => vote('reject')} className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive font-semibold inline-flex items-center gap-1"><ThumbsDown className="w-4 h-4" /> Reject (reopens)</button>
          </div>
        </div>
      )}
    </div>
  );
}
