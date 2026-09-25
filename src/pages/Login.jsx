import { useState } from 'react';
import { ArrowRight, ChefHat, CircleAlert, LoaderCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuthErrorMessage } from '../services/authErrors';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) { setError('Please enter a valid email address.'); return; }
    if (!resetMode && !password) { setError('Please enter your password.'); return; }
    setSubmitting(true);
    try {
      if (resetMode) {
        await resetPassword(email.trim());
        setMessage("If an account exists for this email, we've sent password reset instructions.");
      } else {
        await login(email.trim(), password);
        navigate(location.state?.from?.pathname || '/plan', { replace: true });
      }
    } catch (authError) { setError(resetMode ? "If an account exists for this email, we've sent password reset instructions." : getAuthErrorMessage(authError)); } finally { setSubmitting(false); }
  };

  return <main className="mx-auto grid min-h-[calc(100vh-74px)] max-w-6xl items-center px-5 py-12 sm:py-16"><div className="mx-auto w-full max-w-md"><div className="text-center"><Link to="/" className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-saffron text-white shadow-card"><ChefHat size={24} /></Link><h1 className="mt-6 font-display text-5xl leading-tight text-ink">Welcome back</h1><p className="mt-3 text-sm leading-6 text-muted">Plan your next meal with what you already have.</p></div><form onSubmit={submit} className="mt-9 rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8"><label className="text-sm font-bold text-ink" htmlFor="login-email">Email</label><input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20" placeholder="you@example.com" />{!resetMode && <><label className="mt-5 block text-sm font-bold text-ink" htmlFor="login-password">Password</label><input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20" placeholder="Your password" /></>}{(error || message) && <p className={`mt-5 flex items-start gap-2 rounded-xl p-3 text-xs leading-5 ${error ? 'bg-red-50 text-red-700' : 'bg-sage text-sage-deep'}`}><CircleAlert size={15} className="mt-0.5 shrink-0" />{error || message}</p>}<button type="submit" disabled={submitting} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm font-bold text-white hover:bg-sage-deep disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <LoaderCircle size={17} className="animate-spin" /> : resetMode ? 'Send reset email' : 'Log in'} {!submitting && <ArrowRight size={17} />}</button>{!resetMode && <button type="button" onClick={() => { setResetMode(true); setError(''); setMessage(''); }} className="mt-4 block w-full text-center text-sm font-semibold text-muted hover:text-ink">Forgot password?</button>}{resetMode && <button type="button" onClick={() => { setResetMode(false); setError(''); setMessage(''); }} className="mt-4 block w-full text-center text-sm font-semibold text-muted hover:text-ink">Back to log in</button>}<p className="mt-7 border-t border-line pt-6 text-center text-sm text-muted">Don't have an account? <Link to="/signup" className="font-bold text-ink hover:text-sage-deep">Create account</Link></p></form></div></main>;
}