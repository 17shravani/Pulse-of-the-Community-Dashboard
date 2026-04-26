import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, MapPin } from 'lucide-react';

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  displayName: z.string().trim().min(2).max(50).optional(),
});

export default function Auth() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, displayName: mode === 'signup' ? name : undefined });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        toast.success('Account created! You are signed in.');
        nav('/');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            toast.message('Activating your account...');
            await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/` } });
            const retry = await supabase.auth.signInWithPassword({ email, password });
            if (retry.error) throw retry.error;
          } else { throw error; }
        }
        toast.success('Welcome back!');
        nav('/');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Auth error';
      if (msg.toLowerCase().includes('already')) toast.error('Account already exists. Try signing in.');
      else if (msg.toLowerCase().includes('invalid login')) toast.error('Wrong email or password.');
      else toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="w-10 h-10 rounded-xl civic-gradient flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-heading font-bold civic-gradient-text">CivicPulse</span>
        </div>
        <h1 className="text-2xl font-heading font-bold mb-2 text-center">
          {mode === 'login' ? 'Welcome back' : 'Join the movement'}
        </h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          {mode === 'login' ? 'Sign in to report and track issues' : 'Create an account to make your city better'}
        </p>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <input
              type="text" placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none"
              required
            />
          )}
          <input
            type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none"
            required
          />
          <input
            type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none"
            required
          />
          <button
            type="submit" disabled={submitting}
            className="w-full civic-gradient text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-muted-foreground">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-primary font-semibold hover:underline">
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
