import { useState } from 'react';
import { ChefHat, LogOut, Menu, UserRound, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const publicLinks = [['Home', '/'], ['Plan a Meal', '/plan']];
const privateLinks = [...publicLinks, ['Saved Meals', '/saved']];

function NavItems({ links, onNavigate }) {
  return links.map(([label, href]) => <NavLink key={href} to={href} onClick={onNavigate} className={({ isActive }) => `text-sm font-semibold transition-colors ${isActive ? 'text-ink' : 'text-muted hover:text-ink'}`}>{label}</NavLink>);
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const links = currentUser ? privateLinks : publicLinks;
  const closeMenu = () => setOpen(false);
  const handleLogout = async () => { closeMenu(); await logout(); navigate('/'); };
  const displayName = currentUser?.displayName ? `Hi, ${currentUser.displayName}` : 'Profile';
  return <header className="sticky top-0 z-30 border-b border-line/80 bg-cream/90 backdrop-blur-lg"><div className="mx-auto flex h-[74px] max-w-6xl items-center justify-between px-5"><Link to="/" className="flex items-center gap-2.5" onClick={closeMenu}><span className="grid h-9 w-9 place-items-center rounded-xl bg-saffron text-white shadow-sm"><ChefHat size={20} /></span><span className="font-display text-xl tracking-tight text-ink">AI Meal Planner</span></Link><nav className="hidden items-center gap-7 md:flex"><NavItems links={links} /><>{currentUser ? <><Link to="/profile" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"><UserRound size={15} /> {displayName}</Link><button type="button" onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink hover:border-ink"><LogOut size={15} /> Log out</button></> : <><Link to="/login" className="text-sm font-bold text-ink hover:text-sage-deep">Log in</Link><Link to="/signup" className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">Get started</Link></>}</></nav><button type="button" aria-label={open ? 'Close menu' : 'Open menu'} className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink md:hidden" onClick={() => setOpen(!open)}>{open ? <X size={19} /> : <Menu size={19} />}</button></div>{open && <nav className="border-t border-line bg-cream px-5 pb-5 pt-3 md:hidden"><NavItems links={links} onNavigate={closeMenu} />{currentUser ? <><NavLink to="/profile" onClick={closeMenu} className="block border-b border-line py-3 text-sm font-semibold text-ink">{displayName}</NavLink><button type="button" onClick={handleLogout} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-bold text-ink"><LogOut size={16} /> Log out</button></> : <><NavLink to="/login" onClick={closeMenu} className="block border-b border-line py-3 text-sm font-semibold text-ink">Log in</NavLink><Link to="/signup" onClick={closeMenu} className="mt-4 block rounded-full bg-ink px-5 py-3 text-center text-sm font-bold text-white">Get started</Link></>}</nav>}</header>;
}
