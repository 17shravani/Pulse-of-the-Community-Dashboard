import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, MapPin, IndianRupee, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Rescue {
  id: string; animal_type: string | null; condition_note: string | null;
  priority: string; rescue_status: string; eta_minutes: number | null;
  donations_total: number; created_at: string; complaint_id: string | null;
}

export default function AnimalRescue() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [rescues, setRescues] = useState<Rescue[]>([]);

  useEffect(() => {
    supabase.from('animal_rescues').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setRescues((data ?? []) as Rescue[]));
    const ch = supabase.channel('rescues-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'animal_rescues' }, () =>
        supabase.from('animal_rescues').select('*').order('created_at', { ascending: false })
          .then(({ data }) => setRescues((data ?? []) as Rescue[])))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const donate = async (id: string) => {
    const r = rescues.find((x) => x.id === id);
    if (!r) return;
    await supabase.from('animal_rescues').update({ donations_total: Number(r.donations_total) + 100 }).eq('id', id);
    toast.success('Thanks for your ₹100 contribution! ❤️');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
          <Heart className="w-4 h-4" /> Animal Rescue Network
        </div>
        <h1 className="text-4xl font-heading font-bold mb-2">Save Lives, Together</h1>
        <p className="text-muted-foreground mb-6">Connecting citizens, NGOs, and animal welfare departments in real time</p>
        <button
          onClick={() => user ? nav('/report?category=animal') : nav('/auth')}
          className="civic-gradient text-primary-foreground px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" /> Report Injured Animal
        </button>
      </div>

      <h2 className="text-xl font-heading font-bold mb-4">Active Rescues</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {rescues.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-heading font-bold">{r.animal_type ?? 'Unknown animal'}</p>
                <p className="text-xs text-muted-foreground">{r.condition_note}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${r.priority === 'critical' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>{r.priority}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3 mb-4">
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> ETA {r.eta_minutes ?? '—'} min</span>
              <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> Status: {r.rescue_status}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-semibold inline-flex items-center"><IndianRupee className="w-3 h-3" />{Number(r.donations_total).toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">raised so far</p>
              </div>
              <button onClick={() => donate(r.id)} className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold inline-flex items-center gap-1">
                <Heart className="w-3 h-3" /> Donate ₹100
              </button>
            </div>
          </motion.div>
        ))}
        {rescues.length === 0 && (
          <p className="md:col-span-2 text-center text-muted-foreground py-12">No active rescues right now. <Link to="/report?category=animal" className="text-primary hover:underline">Report one</Link> if you see an animal in distress.</p>
        )}
      </div>
    </div>
  );
}
