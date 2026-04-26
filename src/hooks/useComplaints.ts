import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Complaint } from '@/lib/types';

export function useComplaints(filter?: { category?: string; mine?: boolean; userId?: string | null }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    let q = supabase.from('complaints').select('*').order('created_at', { ascending: false });
    if (filter?.category) q = q.eq('category', filter.category as Complaint['category']);
    if (filter?.mine && filter.userId) q = q.eq('user_id', filter.userId);
    const { data } = await q;
    setComplaints((data ?? []) as Complaint[]);
    setLoading(false);
  }, [filter?.category, filter?.mine, filter?.userId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const ch = supabase
      .channel('complaints-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaint_votes' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  return { complaints, loading, reload: load };
}
