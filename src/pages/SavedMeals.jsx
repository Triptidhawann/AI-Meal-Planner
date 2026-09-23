import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import MealCard from '../components/MealCard';
import { useMeals } from '../context/MealContext';

export default function SavedMeals() { const { savedMeals } = useMeals(); return <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">Your kitchen notebook</p><h1 className="mt-3 font-display text-5xl leading-tight text-ink">Your saved meals.</h1><p className="mt-4 text-base leading-7 text-muted">Recipes you want to come back to, all in one place.</p></div>{savedMeals.length ? <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{savedMeals.map((meal) => <MealCard key={meal.id} meal={meal} compact />)}</div> : <div className="mt-10"><EmptyState title="No saved meals yet." description="Save recipes you want to cook later and they will show up here." action={<Link to="/plan" className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white">Plan a meal <ArrowRight size={16} /></Link>} /></div>}</main>; }
