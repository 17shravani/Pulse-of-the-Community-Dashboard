import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Profile { id: string; display_name: string | null; trust_score: number; impact_score: number; badges: string[]; ward: string | null; }

export default function Leaderboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    supabase.from('profiles').select('*').order('impact_score', { ascending: false }).limit(20)
      .then(({ data }) => setProfiles((data ?? []) as Profile[]));
  }, []);

  const podium = ['🥇', '🥈', '🥉'];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Trophy className="w-4 h-4" /> City Heroes
        </div>
        <h1 className="text-4xl font-heading font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">Top citizens making a real difference</p>
      </div>

      <div className="space-y-2">
        {profiles.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className={`glass-card rounded-2xl p-5 flex items-center gap-4 ${i < 3 ? 'border border-primary/30' : ''}`}>
            <div className="text-2xl w-10 text-center">{podium[i] ?? <span className="text-sm text-muted-foreground">#{i+1}</span>}</div>
            <div className="flex-1">
              <p className="font-heading font-bold">{p.display_name ?? 'Anonymous Citizen'}</p>
              <p className="text-xs text-muted-foreground">{p.ward ?? 'City wide'} · Trust {p.trust_score}/100</p>
              {p.badges.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {p.badges.slice(0,3).map((b) => (
                    <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent">{b}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-heading font-bold civic-gradient-text">{p.impact_score}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Impact</p>
            </div>
          </motion.div>
        ))}
        {profiles.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Be the first to report a verified complaint and top this list! <Heart className="inline w-4 h-4 text-primary" /></p>
        )}
      </div>
    </div>
  );
}
