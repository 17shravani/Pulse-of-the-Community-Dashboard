import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Camera, Loader2, MapPin, Sparkles, Check, X, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CATEGORIES, genTicketId, type IssueCategory } from '@/lib/types';
import { toast } from 'sonner';

const icon = L.divIcon({
  className: 'custom-pin',
  html: `<div style="background:#06b6d4;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12],
});

function MapClicker({ onPick }: { onPick: (ll: { lat: number; lng: number }) => void }) {
  useMapEvents({ click(e) { onPick(e.latlng); } });
  return null;
}

export default function ReportIssue() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<IssueCategory>((params.get('category') as IssueCategory) || 'road');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [aiResult, setAiResult] = useState<{ verified: boolean; confidence: number; reason: string; detectedCategory: string; authentic: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in to report an issue</h1>
        <button onClick={() => nav('/auth')} className="civic-gradient text-primary-foreground px-6 py-3 rounded-xl font-semibold">Sign In</button>
      </div>
    );
  }

  const handlePhoto = (file: File) => {
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setAiResult(null);
  };

  const verifyPhoto = async () => {
    if (!photo) return;
    setVerifying(true);
    try {
      const path = `${user.id}/${Date.now()}-${photo.name}`;
      const { error: upErr } = await supabase.storage.from('complaints').upload(path, photo);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('complaints').getPublicUrl(path);

      const { data, error } = await supabase.functions.invoke('verify-complaint-image', {
        body: { imageUrl: publicUrl, category, description },
      });
      if (error) throw error;
      setAiResult(data);
      (photo as File & { _uploadedUrl?: string })._uploadedUrl = publicUrl;
      if (data.verified) toast.success(`AI verified ✓ (${Math.round(data.confidence * 100)}%)`);
      else toast.warning(`AI flagged: ${data.reason}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Verification failed');
    } finally { setVerifying(false); }
  };

  const submit = async () => {
    if (!pin || !title || !description) { toast.error('Please fill all fields'); return; }
    setSubmitting(true);
    try {
      const photoUrl = (photo as (File & { _uploadedUrl?: string }) | null)?._uploadedUrl ?? null;
      const cat = CATEGORIES.find((c) => c.key === category)!;
      const sla = cat.sla;
      const deadline = new Date(Date.now() + sla * 3600 * 1000).toISOString();
      const ticket = genTicketId();
      const { error } = await supabase.from('complaints').insert({
        ticket_id: ticket, user_id: user.id,
        title, description, category, lat: pin.lat, lng: pin.lng, address,
        photo_url: photoUrl,
        ai_verified: aiResult?.verified ?? false,
        ai_confidence: aiResult?.confidence ?? 0,
        ai_reason: aiResult?.reason ?? null,
        sla_hours: sla, sla_deadline: deadline,
        severity: category === 'animal' ? 'critical' : 'medium',
      });
      if (error) throw error;

      // Trust score boost for verified complaints
      if (aiResult?.verified) {
        await supabase.rpc('has_role', { _user_id: user.id, _role: 'citizen' }); // noop, just to keep types
        const { data: prof } = await supabase.from('profiles').select('trust_score, impact_score').eq('id', user.id).maybeSingle();
        if (prof) {
          await supabase.from('profiles').update({
            trust_score: Math.min(100, prof.trust_score + 2),
            impact_score: prof.impact_score + 10,
          }).eq('id', user.id);
        }
      }

      toast.success(`Submitted! Ticket ${ticket}`);
      nav(`/track/${ticket}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Submit failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        {[1,2,3,4].map((s) => (
          <div key={s} className={`flex-1 h-2 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground mb-6">Step {step} of 4</p>

      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-2xl font-heading font-bold mb-6">Pick a category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORIES.map((c) => (
              <button key={c.key} onClick={() => setCategory(c.key)}
                className={`p-6 rounded-xl border-2 transition-all ${category === c.key ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                <span className="text-3xl block mb-2">{c.icon}</span>
                <span className="text-sm font-semibold block">{c.label}</span>
                <span className="text-xs text-muted-foreground">SLA: {c.sla}h</span>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} className="mt-8 civic-gradient text-primary-foreground px-6 py-3 rounded-xl font-semibold">Next →</button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="text-2xl font-heading font-bold mb-2">Details & photo</h2>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title" maxLength={100}
            className="w-full px-4 py-3 rounded-xl bg-card border border-border" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's wrong?" rows={4} maxLength={500}
            className="w-full px-4 py-3 rounded-xl bg-card border border-border" />

          <div
            className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/60 transition-colors"
            onClick={() => !photoPreview && fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])} />
            {photoPreview ? (
              <div className="space-y-3">
                <img src={photoPreview} alt="preview" className="max-h-64 mx-auto rounded-lg" />
                <div className="flex gap-2 justify-center flex-wrap">
                  <button type="button" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} className="px-4 py-2 bg-muted rounded-lg text-sm">Replace photo</button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); verifyPhoto(); }} disabled={verifying} className="px-4 py-2 civic-gradient text-primary-foreground rounded-lg text-sm font-semibold inline-flex items-center gap-2">
                    {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {verifying ? 'AI checking...' : 'Verify with AI'}
                  </button>
                </div>
                {aiResult && (
                  <div className={`p-4 rounded-lg text-left text-sm ${aiResult.verified ? 'bg-success/10 border border-success/30' : 'bg-destructive/10 border border-destructive/30'}`}>
                    <div className="flex items-center gap-2 font-semibold mb-1">
                      {aiResult.verified ? <Check className="w-4 h-4 text-success" /> : <AlertTriangle className="w-4 h-4 text-destructive" />}
                      {aiResult.verified ? 'AI Verified' : 'AI Flagged'}
                      <span className="ml-auto text-xs">Confidence {Math.round(aiResult.confidence*100)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{aiResult.reason}</p>
                    <p className="text-xs mt-1">Detected: <strong>{aiResult.detectedCategory}</strong> · Authentic: {aiResult.authentic ? 'yes' : 'no'}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                <Camera className="w-12 h-12 text-muted-foreground" />
                <span className="text-sm font-semibold">Click to upload a photo</span>
                <span className="text-xs text-muted-foreground">Take a photo or choose from gallery</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="px-4 py-3 bg-muted rounded-xl">Back</button>
            <button onClick={() => setStep(3)} disabled={!title || !description} className="flex-1 civic-gradient text-primary-foreground px-6 py-3 rounded-xl font-semibold disabled:opacity-50">Next →</button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-2xl font-heading font-bold mb-2">Pin the location in India</h2>
          <p className="text-sm text-muted-foreground mb-4">Tap anywhere on the map of India to drop a pin at the issue location</p>
          <div className="rounded-xl overflow-hidden border border-border h-96 mb-3">
            <MapContainer center={[22.5937, 78.9629]} zoom={5} minZoom={4} style={{ height: '100%', width: '100%' }} maxBounds={[[6, 68], [37, 98]]}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              <MapClicker onPick={setPin} />
              {pin && <Marker position={[pin.lat, pin.lng]} icon={icon} />}
            </MapContainer>
          </div>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address / landmark"
            className="w-full px-4 py-3 rounded-xl bg-card border border-border mb-3" />
          {pin && <p className="text-xs text-muted-foreground mb-3 inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}</p>}
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="px-4 py-3 bg-muted rounded-xl">Back</button>
            <button onClick={() => setStep(4)} disabled={!pin} className="flex-1 civic-gradient text-primary-foreground px-6 py-3 rounded-xl font-semibold disabled:opacity-50">Review →</button>
          </div>
        </motion.div>
      )}

      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="text-2xl font-heading font-bold">Review & submit</h2>
          <div className="glass-card rounded-xl p-6 space-y-3">
            <div><span className="text-xs text-muted-foreground">Category</span><p className="font-semibold">{CATEGORIES.find(c=>c.key===category)?.label}</p></div>
            <div><span className="text-xs text-muted-foreground">Title</span><p className="font-semibold">{title}</p></div>
            <div><span className="text-xs text-muted-foreground">Description</span><p>{description}</p></div>
            <div><span className="text-xs text-muted-foreground">Location</span><p>{address || 'Pinned on map'}</p></div>
            {photoPreview && <img src={photoPreview} alt="" className="rounded-lg max-h-48" />}
            {aiResult && (
              <div className={`text-xs px-3 py-2 rounded-lg inline-flex items-center gap-1 ${aiResult.verified ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                {aiResult.verified ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                AI {aiResult.verified ? 'verified' : 'flagged'} · {Math.round(aiResult.confidence*100)}%
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(3)} className="px-4 py-3 bg-muted rounded-xl">Back</button>
            <button onClick={submit} disabled={submitting} className="flex-1 civic-gradient text-primary-foreground px-6 py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Complaint
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
