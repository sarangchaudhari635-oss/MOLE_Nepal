import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    BarChart3,
    GitBranch,
    Zap,
    Globe,
    Recycle,
    Leaf,
    Moon,
    Sun,
    Share2,
    Mail,
    Battery,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { isAuthenticated } = useAuth();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (
            localStorage.getItem('theme') === 'dark' ||
            (!('theme' in localStorage) &&
                window.matchMedia('(prefers-color-scheme: dark)').matches)
        ) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
            {/* ─── Navigation ─── */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-teal-900/10 dark:border-teal-100/10 shadow-sm transition-colors duration-300">
                <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                    <div className="text-xl font-bold text-teal-950 dark:text-teal-100 tracking-tighter font-headline">
                        MOLE
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a
                            href="#process"
                            className="font-headline font-semibold tracking-tight text-sm text-teal-700 dark:text-teal-400 border-b-2 border-teal-700 dark:border-teal-400 pb-1"
                        >
                            Platform
                        </a>
                        <a
                            href="#metrics"
                            className="font-headline font-semibold tracking-tight text-sm text-slate-600 dark:text-slate-400 hover:text-teal-900 dark:hover:text-teal-200 transition-colors"
                        >
                            Impact
                        </a>
                        <a
                            href="#partners"
                            className="font-headline font-semibold tracking-tight text-sm text-slate-600 dark:text-slate-400 hover:text-teal-900 dark:hover:text-teal-200 transition-colors"
                        >
                            Resources
                        </a>
                        <a
                            href="#cta"
                            className="font-headline font-semibold tracking-tight text-sm text-slate-600 dark:text-slate-400 hover:text-teal-900 dark:hover:text-teal-200 transition-colors"
                        >
                            About
                        </a>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {isAuthenticated ? (
                            <Link
                                to="/app"
                                className="bg-teal-900 dark:bg-teal-700 text-white px-5 py-2.5 text-sm font-semibold rounded-md hover:brightness-110 transition-all flex items-center gap-2"
                            >
                                Dashboard <ArrowRight size={15} />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="hidden md:block text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-900 dark:hover:text-teal-200 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/login"
                                    className="bg-teal-900 dark:bg-teal-700 text-white px-5 py-2.5 text-sm font-semibold rounded-md hover:brightness-110 transition-all"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className="pt-16">
                {/* ─── Hero Section ─── */}
                <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-teal-950">
                    <div className="absolute inset-0 z-0">
                        <img
                            alt="Industrial architecture"
                            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                            src="/hero-bg.png"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-teal-950 via-teal-950/80 to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12">
                        <div className="md:col-span-8 flex flex-col justify-center">
                            <span className="text-green-400 font-bold tracking-[0.2em] uppercase text-xs mb-6">
                                Industrial Innovation
                            </span>
                            <h1 className="text-white text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-8 font-headline">
                                Turning Industrial{' '}
                                <span className="text-green-400">Waste</span> into
                                Economic Growth
                            </h1>
                            <p className="text-teal-200 text-lg md:text-xl max-w-2xl font-light mb-10 leading-relaxed">
                                We engineer industrial symbiosis at scale — a platform that transforms waste
                                byproducts into high-margin secondary raw materials. Redefining waste as
                                the ultimate untapped asset.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/login"
                                    className="bg-green-500 text-green-950 px-8 py-4 rounded-md font-bold text-sm tracking-wide transition-all hover:bg-green-400"
                                >
                                    Launch Analysis
                                </Link>
                                <a
                                    href="#process"
                                    className="border border-white/30 text-white px-8 py-4 rounded-md font-bold text-sm tracking-wide hover:bg-white/10 backdrop-blur-sm transition-all"
                                >
                                    Explore Documentation
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Our Technology – Bento Grid ─── */}
                <section id="process" className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="mb-16">
                            <h2 className="font-headline text-teal-900 dark:text-teal-300 text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                                Our Technology
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                                Precision, industrial-grade systems designed for seamless integration into
                                existing infrastructure for optimal output.
                            </p>
                        </div>

                        {/* Bento Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Card 1 */}
                            <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/40 group hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mb-5">
                                    <BarChart3 className="text-teal-700 dark:text-teal-400" size={24} />
                                </div>
                                <h3 className="font-headline font-bold text-lg text-slate-900 dark:text-teal-200 mb-3">
                                    Turn disposal costs into new revenue streams
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                    Industrial byproducts reclassified and rehomed into profitable secondary markets through algorithmic partner matching.
                                </p>
                                <div className="flex gap-3">
                                    <span className="px-3 py-1 text-xs font-semibold bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full">
                                        REVENUE +22%
                                    </span>
                                    <span className="px-3 py-1 text-xs font-semibold bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                                        ZERO WASTE
                                    </span>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/40 group hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mb-5">
                                    <Zap className="text-amber-600 dark:text-amber-400" size={24} />
                                </div>
                                <h3 className="font-headline font-bold text-lg text-slate-900 dark:text-teal-200 mb-3">
                                    AI-powered algorithmic partner matching
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Machine-learning models analyze chemistry, location, volumes, and timing to find perfect industrial symbiosis matches across our network — with 98%+ accuracy.
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/40 group hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                                    <GitBranch className="text-blue-600 dark:text-blue-400" size={24} />
                                </div>
                                <h3 className="font-headline font-bold text-lg text-slate-900 dark:text-teal-200 mb-3">
                                    Real-time industrial symbiosis network
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    A globally connected marketplace providing live visibility into byproduct supply &amp; demand, making a historically opaque market transparent and efficient.
                                </p>
                            </div>

                            {/* Card 4 — ESG */}
                            <div className="bg-teal-900 dark:bg-teal-900/60 p-8 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                                <div className="relative z-10">
                                    <h3 className="font-headline font-bold text-lg text-white mb-3">
                                        Automated ESG &amp; compliance tracking
                                    </h3>
                                    <p className="text-sm text-teal-200 leading-relaxed mb-6 max-w-lg">
                                        Auto-generate audit-ready CO₂ reduction reports, circularity metrics,
                                        and ESG metrics are tracked in real time. Adherence to international regulations
                                        is maintained across all transactions.
                                    </p>
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 text-green-400 font-bold text-sm hover:text-green-300 transition-colors"
                                    >
                                        View Compliance Data <ArrowRight size={16} />
                                    </Link>
                                </div>
                                <Leaf className="absolute -bottom-6 -right-6 text-white/5 pointer-events-none" size={180} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Industrial Performance / Metrics ─── */}
                <section id="metrics" className="py-24 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700/30 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                            <div className="max-w-2xl">
                                <span className="text-green-700 dark:text-green-400 font-bold tracking-widest uppercase text-xs">
                                    Real-Time Impact
                                </span>
                                <h2 className="font-headline text-teal-900 dark:text-teal-200 text-4xl md:text-5xl font-black tracking-tighter mt-4">
                                    Industrial Performance
                                </h2>
                            </div>
                            <button className="text-teal-700 dark:text-teal-400 font-bold flex items-center gap-2 group text-sm">
                                View Global Dashboard
                                <ArrowRight
                                    size={16}
                                    className="group-hover:translate-x-1 transition-transform"
                                />
                            </button>
                        </div>

                        {/* Bento Grid Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Carbon Card — 2 cols */}
                            <div className="md:col-span-2 bg-teal-900 p-10 rounded-2xl relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h3 className="text-teal-300 text-sm font-bold uppercase tracking-widest mb-2">
                                        Carbon Sequestration
                                    </h3>
                                    <div className="text-white text-5xl md:text-6xl font-black tracking-tighter mb-6 font-headline">
                                        452,000{' '}
                                        <span className="text-2xl font-normal text-white/60">MT</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                        <div className="bg-green-400 w-3/4 h-full rounded-full" />
                                    </div>
                                    <p className="text-teal-300 mt-4 text-sm max-w-md">
                                        Year-to-date reduction across 14 industrial hubs
                                        using the MOLE circular protocol.
                                    </p>
                                </div>
                                <Leaf
                                    className="absolute -bottom-10 -right-10 text-white/5 pointer-events-none"
                                    size={200}
                                />
                            </div>

                            {/* Economic Value */}
                            <div className="bg-green-900 p-10 rounded-2xl flex flex-col justify-between">
                                <div>
                                    <h3 className="text-green-300 text-sm font-bold uppercase tracking-widest mb-2">
                                        Economic Value
                                    </h3>
                                    <div className="text-white text-4xl font-black tracking-tighter font-headline">
                                        $12.4M
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <div className="h-24 w-full flex items-end gap-1">
                                        <div className="bg-green-500/40 w-full h-1/2 rounded-sm" />
                                        <div className="bg-green-500/50 w-full h-3/4 rounded-sm" />
                                        <div className="bg-green-500/60 w-full h-2/3 rounded-sm" />
                                        <div className="bg-green-500/80 w-full h-5/6 rounded-sm" />
                                        <div className="bg-green-500 w-full h-full rounded-sm" />
                                    </div>
                                    <p className="text-green-400 mt-4 text-xs font-medium">
                                        Revenue generated from byproduct resale markets.
                                    </p>
                                </div>
                            </div>

                            {/* Small metric cards */}
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/30 flex items-center justify-between transition-colors">
                                <div>
                                    <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">
                                        Hub Availability
                                    </div>
                                    <div className="text-teal-900 dark:text-teal-300 text-3xl font-black font-headline">
                                        Global 24/7
                                    </div>
                                </div>
                                <Globe className="text-teal-700 dark:text-teal-400" size={36} />
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/30 flex items-center justify-between transition-colors">
                                <div>
                                    <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">
                                        Energy Saved
                                    </div>
                                    <div className="text-teal-900 dark:text-teal-300 text-3xl font-black font-headline">
                                        3.2 GWh
                                    </div>
                                </div>
                                <Battery className="text-teal-700 dark:text-teal-400" size={36} />
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/30 flex items-center justify-between transition-colors">
                                <div>
                                    <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">
                                        Waste Redirected
                                    </div>
                                    <div className="text-teal-900 dark:text-teal-300 text-3xl font-black font-headline">
                                        89%
                                    </div>
                                </div>
                                <Recycle className="text-teal-700 dark:text-teal-400" size={36} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── The Economic Case ── */}
                <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="font-headline text-teal-900 dark:text-teal-200 text-4xl md:text-5xl font-black tracking-tighter mb-8 leading-tight">
                                    The Economic Case for Sustainability
                                </h2>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                                            <BarChart3 className="text-teal-700 dark:text-teal-400" size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-teal-200 mb-1">
                                                Operational Cost Reduction
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                Reduce disposal costs while generating new income streams from reclassified byproducts.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                            <Leaf className="text-green-600 dark:text-green-400" size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-teal-200 mb-1">
                                                Net-Zero Pathways
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                Every trade has its carbon impact quantified, creating verifiable sustainability metrics.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Visual */}
                            <div className="bg-teal-900 p-10 rounded-2xl relative overflow-hidden">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-teal-300 text-xs font-bold uppercase tracking-widest mb-1">
                                            Waste Diverted
                                        </div>
                                        <div className="text-white text-4xl font-black font-headline">
                                            1.2M <span className="text-lg font-normal text-white/60">tons</span>
                                        </div>
                                        <p className="text-teal-400 text-xs mt-1">
                                            Total material diverted Feb 2023 across pilot markets.
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <div className="w-28 h-28 rounded-full border-4 border-green-400 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-white text-2xl font-black font-headline">94%</div>
                                                <div className="text-teal-400 text-[10px] uppercase">
                                                    Match Rate
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-teal-300 text-xs font-bold uppercase tracking-widest mb-1">
                                            Cost Savings
                                        </div>
                                        <div className="text-white text-3xl font-black font-headline">$42M</div>
                                    </div>
                                    <div>
                                        <div className="text-teal-300 text-xs font-bold uppercase tracking-widest mb-1">
                                            Active Hubs
                                        </div>
                                        <div className="text-white text-3xl font-black font-headline">14</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Partners ─── */}
                <section id="partners" className="py-24 border-t border-slate-200 dark:border-slate-700/30 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-center text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-[0.3em] mb-16">
                            Trusted by Industrial Leaders
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 items-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                            {['VERTEX', 'STRATUM', 'CORE-IND', 'NEXUS', 'PRISM'].map((name) => (
                                <div
                                    key={name}
                                    className="flex justify-center font-headline font-black text-2xl text-teal-900 dark:text-teal-400"
                                >
                                    {name}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── CTA Section ─── */}
                <section id="cta" className="mx-6 mb-24">
                    <div className="max-w-7xl mx-auto bg-teal-950 dark:bg-teal-900 rounded-3xl p-12 md:p-24 relative overflow-hidden text-center">
                        <div className="absolute inset-0 z-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDBMMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9zdmc+')] " />
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="font-headline text-white text-4xl md:text-6xl font-black tracking-tighter mb-8">
                                Ready to Optimize Your Industrial Footprint?
                            </h2>
                            <p className="text-teal-200 text-lg mb-12">
                                Connect with our engineering team for a feasibility assessment of
                                your production facility's circular potential.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link
                                    to="/login"
                                    className="bg-green-500 text-green-950 px-10 py-5 rounded-md font-bold text-base shadow-xl hover:scale-105 hover:bg-green-400 transition-all"
                                >
                                    Schedule Consultation
                                </Link>
                                <button className="bg-white/10 text-white backdrop-blur-md px-10 py-5 rounded-md font-bold text-base hover:bg-white/20 transition-all">
                                    Download Platform Overview
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* ─── Footer ─── */}
            <footer className="w-full py-12 px-6 border-t bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    <div className="col-span-1">
                        <div className="text-lg font-black text-teal-950 dark:text-teal-100 mb-6 font-headline">
                            MOLE
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                            Redefining industrial efficiency through precise ecological
                            synchronization. Built for the next century of manufacturing.
                        </p>
                        <div className="flex gap-4">
                            <Share2
                                size={18}
                                className="text-teal-900 dark:text-teal-400 cursor-pointer hover:text-teal-600 dark:hover:text-teal-200 transition-colors"
                            />
                            <Mail
                                size={18}
                                className="text-teal-900 dark:text-teal-400 cursor-pointer hover:text-teal-600 dark:hover:text-teal-200 transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <h4 className="text-teal-900 dark:text-teal-300 font-bold text-sm mb-4">
                            Documentation
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <a className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 hover:underline decoration-teal-500/30" href="#">
                                    API Reference
                                </a>
                            </li>
                            <li>
                                <a className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 hover:underline decoration-teal-500/30" href="#">
                                    System Requirements
                                </a>
                            </li>
                            <li>
                                <a className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 hover:underline decoration-teal-500/30" href="#">
                                    Network Protocols
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-teal-900 dark:text-teal-300 font-bold text-sm mb-4">
                            Platform
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <a className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 hover:underline decoration-teal-500/30" href="#">
                                    Case Studies
                                </a>
                            </li>
                            <li>
                                <a className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 hover:underline decoration-teal-500/30" href="#">
                                    Impact Metrics
                                </a>
                            </li>
                            <li>
                                <Link className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 hover:underline decoration-teal-500/30" to="/privacy">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-teal-900 dark:text-teal-300 font-bold text-sm mb-4">
                            Support
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <a className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 hover:underline decoration-teal-500/30" href="mailto:contact@mole.com">
                                    Contact Support
                                </a>
                            </li>
                            <li>
                                <Link className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 hover:underline decoration-teal-500/30" to="/privacy">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 hover:underline decoration-teal-500/30" to="/terms">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        © 2026 MOLE Industrial. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300" href="#">
                            LinkedIn
                        </a>
                        <a className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300" href="#">
                            Twitter/X
                        </a>
                        <a className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300" href="#">
                            GitHub
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
