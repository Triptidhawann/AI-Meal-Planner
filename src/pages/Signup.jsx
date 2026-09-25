import { useState } from 'react';
import { ArrowRight, ChefHat, CircleAlert, LoaderCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuthErrorMessage } from '../services/authErrors';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.fullName.trim()) { setError('Please enter your name.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) { setError('Please enter a valid email.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setSubmitting(true);
    try { await signup(form.email.trim(), form.password, form.fullName.trim()); navigate('/plan', { replace: true }); } catch (authError) { setError(getAuthErrorMessage(authError)); } finally { setSubmitting(false); }
  };

  return <main className="mx-auto grid min-h-[calc(100vh-74px)] max-w-6xl items-center px-5 py-12 sm:py-16"><div className="mx-auto w-full max-w-md"><div className="text-center"><Link to="/" className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-saffron text-white shadow-card"><ChefHat size={24} /></Link><h1 className="mt-6 font-display text-5xl leading-tight text-ink">Create your account</h1><p className="mt-3 text-sm leading-6 text-muted">Start planning smarter meals with AI.</p></div><form onSubmit={submit} className="mt-9 rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8"><label className="text-sm font-bold text-ink" htmlFor="signup-name">Full name</label><input id="signup-name" type="text" autoComplete="name" value={form.fullName} onChange={update('fullName')} className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20" placeholder="Your name" /><label className="mt-5 block text-sm font-bold text-ink" htmlFor="signup-email">Email</label><input id="signup-email" type="email" autoComplete="email" value={form.email} onChange={update('email')} className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20" placeholder="you@example.com" /><label className="mt-5 block text-sm font-bold text-ink" htmlFor="signup-password">Password</label><input id="signup-password" type="password" autoComplete="new-password" value={form.password} onChange={update('password')} className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20" placeholder="At least 6 characters" /><label className="mt-5 block text-sm font-bold text-ink" htmlFor="signup-confirm-password">Confirm password</label><input id="signup-confirm-password" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={update('confirmPassword')} className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20" placeholder="Repeat your password" />{error && <p className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700"><CircleAlert size={15} className="mt-0.5 shrink-0" />{error}</p>}<button type="submit" disabled={submitting} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm font-bold text-white hover:bg-sage-deep disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <LoaderCircle size={17} className="animate-spin" /> : 'Create account'} {!submitting && <ArrowRight size={17} />}</button><p className="mt-7 border-t border-line pt-6 text-center text-sm text-muted">Already have an account? <Link to="/login" className="font-bold text-ink hover:text-sage-deep">Log in</Link></p></form></div></main>;
}
