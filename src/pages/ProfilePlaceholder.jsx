import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function ProfilePlaceholder() {
  return <main className="mx-auto max-w-5xl px-5 py-12 sm:py-16"><EmptyState title="Profile coming soon" description="Your account is ready. Profile preferences and history will be added in a later step." action={<Link to="/" className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-bold text-white">Back home</Link>} /></main>;
}
