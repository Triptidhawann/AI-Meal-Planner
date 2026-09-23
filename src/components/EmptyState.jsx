import { ChefHat } from 'lucide-react';

export default function EmptyState({ title, description, action }) {
  return <div className="rounded-3xl border border-dashed border-line bg-white px-6 py-16 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sage text-sage-deep"><ChefHat size={26} /></div><h2 className="mt-5 font-display text-3xl text-ink">{title}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>{action}</div>;
}
