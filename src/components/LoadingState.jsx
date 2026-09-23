import { LoaderCircle } from 'lucide-react';

export default function LoadingState() {
  return <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-3xl border border-line bg-white px-6 text-center shadow-card"><div className="grid h-14 w-14 place-items-center rounded-full bg-saffron/15 text-saffron"><LoaderCircle className="animate-spin" size={28} /></div><div><p className="font-display text-2xl text-ink">Planning your meals...</p><p className="mt-1 text-sm text-muted">Our meal planning agent is matching your ingredients, time, and preferences.</p></div></div>;
}
