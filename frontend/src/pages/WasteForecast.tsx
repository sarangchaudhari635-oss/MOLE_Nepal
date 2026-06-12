import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, Package, TrendingUp,
    CheckCircle2, Search, Trash2, Loader,
    Globe, Building2, User, MessageSquare, Clock, MapPin
} from 'lucide-react';
import {
    createWasteForecast, getMyWasteForecasts, deleteWasteForecast,
    findMatchesForForecast, getAllWasteForecasts,
    createWasteScheduleEntry, getWasteScheduleForMonth, deleteWasteScheduleEntry,
    getWasteScheduleRecurring,
    type WasteForecast, type MaterialRequest, type WasteForecastPublic,
    type WasteSchedule, type WasteScheduleRecurring
} from '../lib/db';
import { supabase } from '../lib/supabase';

const wasteTypes = [
    { value: '', label: 'Select waste type...' },
    { value: 'steel-scrap', label: 'Steel & Iron Scrap' },
    { value: 'aluminum', label: 'Aluminum & Light Alloys' },
    { value: 'copper', label: 'Copper & Brass' },
    { value: 'plastics-hdpe', label: 'HDPE Plastics' },
    { value: 'plastics-pp', label: 'Polypropylene (PP)' },
    { value: 'rubber', label: 'Rubber & Elastomers' },
    { value: 'glass-cullet', label: 'Glass Cullet' },
    { value: 'wood-biomass', label: 'Wood & Biomass' },
    { value: 'chemical-solvents', label: 'Chemical Solvents' },
    { value: 'textile-fiber', label: 'Textile & Fibers' },
    { value: 'electronic-pcb', label: 'Electronic Components' },
    { value: 'concrete-aggregate', label: 'Concrete Aggregate' },
];

const WasteForecastPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'mine' | 'global' | 'schedule'>('mine');

    // My Forecasts State
    const [myForecasts, setMyForecasts] = useState<WasteForecast[]>([]);
    const [matches, setMatches] = useState<Record<string, MaterialRequest[]>>({});
    const [isMyLoading, setIsMyLoading] = useState(true);
    const [myId, setMyId] = useState<string | null>(null);

    // Global Forecasts State
    const [globalForecasts, setGlobalForecasts] = useState<WasteForecastPublic[]>([]);
    const [isGlobalLoading, setIsGlobalLoading] = useState(true);

    // Waste Schedule State
    const [wasteSchedules, setWasteSchedules] = useState<WasteSchedule[]>([]);
    const [recurringSchedules, setRecurringSchedules] = useState<WasteScheduleRecurring[]>([]);
    const [isScheduleLoading, setIsScheduleLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State - Forecast
    const [form, setForm] = useState({
        wasteType: '',
        quantity: '',
        unit: 'Tons',
        availableFrom: '',
        description: ''
    });

    // Form State - Schedule
    const [scheduleForm, setScheduleForm] = useState({
        wasteType: '',
        quantity: '',
        unit: 'Tons',
        scheduleDate: new Date().toISOString().split('T')[0],
        timeFrom: '',
        timeTo: '',
        location: '',
        hazardLevel: 'non-hazardous',
        description: ''
    });

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setMyId(user.id);
            loadMyForecasts();
            loadGlobalForecasts();
            loadWasteSchedules();
        };
        init();

        // Realtime Subscription for Global Forecasts
        const channel = supabase
            .channel('public:waste_forecasts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'waste_forecasts' }, () => {
                loadGlobalForecasts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        loadWasteSchedules();
    }, [currentMonth]);

    const loadMyForecasts = async () => {
        setIsMyLoading(true);
        const data = await getMyWasteForecasts();
        setMyForecasts(data);

        // Find matches for each forecast
        const newMatches: Record<string, MaterialRequest[]> = {};
        for (const f of data) {
            const m = await findMatchesForForecast(f.waste_type);
            if (m.length > 0) newMatches[f.id] = m;
        }
        setMatches(newMatches);
        setIsMyLoading(false);
    };

    const loadGlobalForecasts = async () => {
        // setIsGlobalLoading(true); // Don't show loader on refresh to avoid flickering
        const data = await getAllWasteForecasts();
        setGlobalForecasts(data);
        setIsGlobalLoading(false);
    };

    const loadWasteSchedules = async () => {
        setIsScheduleLoading(true);
        const data = await getWasteScheduleForMonth(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
        const recurring = await getWasteScheduleRecurring();
        setWasteSchedules(data);
        setRecurringSchedules(recurring);
        setIsScheduleLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.wasteType || !form.quantity || !form.availableFrom) return;

        setIsSubmitting(true);
        const { error } = await createWasteForecast({
            waste_type: form.wasteType,
            quantity: parseFloat(form.quantity),
            unit: form.unit,
            available_from: new Date(form.availableFrom).toISOString(),
            description: form.description
        });

        if (!error) {
            setForm({
                wasteType: '',
                quantity: '',
                unit: 'Tons',
                availableFrom: '',
                description: ''
            });
            await loadMyForecasts();
            setActiveTab('mine');
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this forecast?')) return;
        await deleteWasteForecast(id);
        await loadMyForecasts();
    };

    const handleScheduleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scheduleForm.wasteType || !scheduleForm.quantity || !scheduleForm.scheduleDate) return;

        setIsSubmitting(true);
        const { error } = await createWasteScheduleEntry({
            waste_type: scheduleForm.wasteType,
            quantity: parseFloat(scheduleForm.quantity),
            unit: scheduleForm.unit,
            schedule_date: scheduleForm.scheduleDate,
            time_from: scheduleForm.timeFrom || undefined,
            time_to: scheduleForm.timeTo || undefined,
            location: scheduleForm.location || undefined,
            hazard_level: scheduleForm.hazardLevel,
            description: scheduleForm.description || undefined,
            is_active: true,
            frequency: 'once'
        });

        if (!error) {
            setScheduleForm({
                wasteType: '',
                quantity: '',
                unit: 'Tons',
                scheduleDate: new Date().toISOString().split('T')[0],
                timeFrom: '',
                timeTo: '',
                location: '',
                hazardLevel: 'non-hazardous',
                description: ''
            });
            await loadWasteSchedules();
        }
        setIsSubmitting(false);
    };

    const handleDeleteSchedule = async (id: string) => {
        if (!confirm('Are you sure you want to delete this schedule?')) return;
        await deleteWasteScheduleEntry(id);
        await loadWasteSchedules();
    };

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getSchedulesForDate = (dateStr: string) => {
        return wasteSchedules.filter(s => s.schedule_date === dateStr);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
                    <TrendingUp className="text-brand-600" />
                    Waste Generation Forecast
                </h1>
                <p className="text-surface-500 mt-1">
                    Input your production schedules or view industry-wide future waste availability.
                </p>
            </header>

            {/* ─── Tabs ─── */}
            <div className="flex gap-4 border-b border-surface-200 mb-8 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('mine')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'mine'
                            ? 'text-brand-600 border-b-2 border-brand-600'
                            : 'text-surface-500 hover:text-surface-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <User size={16} />
                        My Production Schedule
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'schedule'
                            ? 'text-brand-600 border-b-2 border-brand-600'
                            : 'text-surface-500 hover:text-surface-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        Waste Schedule
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('global')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'global'
                            ? 'text-brand-600 border-b-2 border-brand-600'
                            : 'text-surface-500 hover:text-surface-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Globe size={16} />
                        Industry Forecasts
                        <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                            LIVE
                        </span>
                    </div>
                </button>
            </div>

            {activeTab === 'mine' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ─── Form Section ─── */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6 sticky top-8">
                            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Calendar className="text-brand-500" size={20} />
                                New Forecast
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-surface-700 mb-1">Waste Type</label>
                                    <select
                                        className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-white"
                                        value={form.wasteType}
                                        onChange={e => setForm({ ...form, wasteType: e.target.value })}
                                        required
                                    >
                                        {wasteTypes.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-surface-700 mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                            placeholder="0.00"
                                            value={form.quantity}
                                            onChange={e => setForm({ ...form, quantity: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-surface-700 mb-1">Unit</label>
                                        <select
                                            className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                            value={form.unit}
                                            onChange={e => setForm({ ...form, unit: e.target.value })}
                                        >
                                            <option>Tons</option>
                                            <option>Kg</option>
                                            <option>Liters</option>
                                            <option>Units</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-surface-700 mb-1">Expected Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={form.availableFrom}
                                        onChange={e => setForm({ ...form, availableFrom: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-surface-700 mb-1">Notes (Optional)</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none h-20"
                                        placeholder="Production details..."
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? <Loader className="animate-spin" size={18} /> : <Package size={18} />}
                                    Add Forecast
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ─── My List Section ─── */}
                    <div className="lg:col-span-2 space-y-6">
                        {isMyLoading ? (
                            <div className="flex items-center justify-center h-64 text-surface-400">
                                <Loader className="animate-spin mb-2" />
                                <span className="ml-2">Loading your forecasts...</span>
                            </div>
                        ) : myForecasts.length === 0 ? (
                            <div className="bg-surface-50 border-2 border-dashed border-surface-200 rounded-xl p-12 text-center">
                                <TrendingUp className="mx-auto text-surface-300 mb-4" size={48} />
                                <h3 className="text-lg font-medium text-surface-700">No forecasts yet</h3>
                                <p className="text-surface-500">Add your production schedule to start matching.</p>
                            </div>
                        ) : (
                            myForecasts.map(forecast => (
                                <div key={forecast.id} className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden group">
                                    <div className="p-5 flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-surface-900">{forecast.waste_type}</h3>
                                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                                                    Forecast
                                                </span>
                                            </div>
                                            <p className="text-surface-500 text-sm mb-3">
                                                Expected: <span className="font-medium text-surface-900">{new Date(forecast.available_from).toLocaleDateString()}</span>
                                                <span className="mx-2">•</span>
                                                Volume: <span className="font-medium text-surface-900">{forecast.quantity} {forecast.unit}</span>
                                            </p>

                                            {matches[forecast.id] && matches[forecast.id].length > 0 ? (
                                                <div className="bg-green-50 border border-green-100 rounded-lg p-3 mt-3">
                                                    <div className="flex items-center gap-2 text-green-800 font-medium text-sm mb-2">
                                                        <CheckCircle2 size={16} />
                                                        {matches[forecast.id].length} Potential Buyer{matches[forecast.id].length > 1 ? 's' : ''} Found
                                                    </div>
                                                    <div className="space-y-2">
                                                        {matches[forecast.id].slice(0, 2).map(match => (
                                                            <div key={match.id} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-green-100/50 shadow-sm">
                                                                <span className="font-medium text-surface-700">
                                                                    {(match as any).companies?.company_name || 'Unknown Company'}
                                                                </span>
                                                                <span className="text-surface-500 text-xs">
                                                                    Needs {match.quantity_required} {match.unit}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {matches[forecast.id].length > 2 && (
                                                            <div className="text-xs text-green-600 pl-1">
                                                                + {matches[forecast.id].length - 2} more...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-surface-400 text-sm mt-3 bg-surface-50 p-2 rounded-lg">
                                                    <Search size={14} />
                                                    <span>Searching for buyers...</span>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleDelete(forecast.id)}
                                            className="text-surface-400 hover:text-red-600 transition-colors p-2"
                                            title="Delete Forecast"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : activeTab === 'schedule' ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* ─── Schedule Form Section ─── */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6 sticky top-8">
                            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Calendar className="text-brand-500" size={20} />
                                Add Waste Schedule
                            </h2>

                            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-sm">
                                <div>
                                    <label className="block font-medium text-surface-700 mb-1">Waste Type</label>
                                    <select
                                        className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-sm"
                                        value={scheduleForm.wasteType}
                                        onChange={e => setScheduleForm({ ...scheduleForm, wasteType: e.target.value })}
                                        required
                                    >
                                        {wasteTypes.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block font-medium text-surface-700 mb-1">Qty</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                            placeholder="0.00"
                                            value={scheduleForm.quantity}
                                            onChange={e => setScheduleForm({ ...scheduleForm, quantity: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-surface-700 mb-1">Unit</label>
                                        <select
                                            className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-sm"
                                            value={scheduleForm.unit}
                                            onChange={e => setScheduleForm({ ...scheduleForm, unit: e.target.value })}
                                        >
                                            <option>Tons</option>
                                            <option>Kg</option>
                                            <option>Liters</option>
                                            <option>Units</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-medium text-surface-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                        value={scheduleForm.scheduleDate}
                                        onChange={e => setScheduleForm({ ...scheduleForm, scheduleDate: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block font-medium text-surface-700 mb-1">From Time</label>
                                        <input
                                            type="time"
                                            className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                            value={scheduleForm.timeFrom}
                                            onChange={e => setScheduleForm({ ...scheduleForm, timeFrom: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-surface-700 mb-1">To Time</label>
                                        <input
                                            type="time"
                                            className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                            value={scheduleForm.timeTo}
                                            onChange={e => setScheduleForm({ ...scheduleForm, timeTo: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-medium text-surface-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                        placeholder="Facility/Line"
                                        value={scheduleForm.location}
                                        onChange={e => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-surface-700 mb-1">Hazard Level</label>
                                    <select
                                        className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-sm"
                                        value={scheduleForm.hazardLevel}
                                        onChange={e => setScheduleForm({ ...scheduleForm, hazardLevel: e.target.value })}
                                    >
                                        <option>non-hazardous</option>
                                        <option>hazardous</option>
                                        <option>ee/crt</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-medium text-surface-700 mb-1">Notes</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none h-16 text-sm"
                                        placeholder="Details..."
                                        value={scheduleForm.description}
                                        onChange={e => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
                                >
                                    {isSubmitting ? <Loader className="animate-spin" size={16} /> : <Package size={16} />}
                                    Add Schedule
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ─── Calendar & Schedule View ─── */}
                    <div className="lg:col-span-3 space-y-6">
                        {isScheduleLoading ? (
                            <div className="flex items-center justify-center h-96 text-surface-400">
                                <Loader className="animate-spin mb-2" />
                                <span className="ml-2">Loading schedules...</span>
                            </div>
                        ) : (
                            <>
                                {/* Month Navigation */}
                                <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-bold text-lg text-surface-900">
                                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                                                className="px-3 py-1 text-sm border border-surface-300 hover:bg-surface-50 rounded-lg transition-colors"
                                            >
                                                ← Prev
                                            </button>
                                            <button
                                                onClick={() => setCurrentMonth(new Date())}
                                                className="px-3 py-1 text-sm bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg transition-colors font-medium"
                                            >
                                                Today
                                            </button>
                                            <button
                                                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                                                className="px-3 py-1 text-sm border border-surface-300 hover:bg-surface-50 rounded-lg transition-colors"
                                            >
                                                Next →
                                            </button>
                                        </div>
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="grid grid-cols-7 gap-2">
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                            <div key={day} className="text-center font-bold text-sm text-surface-600 py-2">
                                                {day}
                                            </div>
                                        ))}
                                        {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
                                            <div key={`empty-${i}`} className="aspect-square" />
                                        ))}
                                        {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                                            const day = i + 1;
                                            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                            const daySchedules = getSchedulesForDate(dateStr);
                                            const isToday = new Date().toISOString().split('T')[0] === dateStr;

                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                                                    className={`aspect-square rounded-lg border transition-all text-sm flex items-center justify-center relative font-medium cursor-pointer
                                                        ${selectedDate === dateStr ? 'bg-brand-600 text-white border-brand-600 ring-2 ring-brand-300' : 
                                                          daySchedules.length > 0 ? 'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100' :
                                                          isToday ? 'bg-surface-100 border-surface-300 text-surface-900' :
                                                          'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'}`}
                                                >
                                                    <div className="text-center">
                                                        <div>{day}</div>
                                                        {daySchedules.length > 0 && (
                                                            <div className="text-[10px] font-bold mt-0.5">
                                                                {daySchedules.length}
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Selected Date Details */}
                                {selectedDate && (
                                    <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
                                        <h3 className="font-bold text-lg text-surface-900 mb-4 flex items-center gap-2">
                                            <Calendar size={20} className="text-brand-600" />
                                            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </h3>

                                        <div className="space-y-4">
                                            {getSchedulesForDate(selectedDate).length === 0 ? (
                                                <p className="text-surface-500 text-sm">No waste schedules for this date.</p>
                                            ) : (
                                                getSchedulesForDate(selectedDate).map(schedule => (
                                                    <div key={schedule.id} className="border border-surface-200 rounded-lg p-4 bg-surface-50/50 flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-surface-900 mb-2">{schedule.waste_type}</h4>
                                                            <div className="space-y-1 text-sm text-surface-600">
                                                                <div className="flex items-center gap-2">
                                                                    <Package size={14} />
                                                                    <span>{schedule.quantity} {schedule.unit}</span>
                                                                </div>
                                                                {schedule.time_from && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock size={14} />
                                                                        <span>{schedule.time_from}{schedule.time_to ? ` - ${schedule.time_to}` : ''}</span>
                                                                    </div>
                                                                )}
                                                                {schedule.location && (
                                                                    <div className="flex items-center gap-2">
                                                                        <MapPin size={14} />
                                                                        <span>{schedule.location}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-[12px] font-medium px-2 py-0.5 rounded capitalize ${
                                                                        schedule.hazard_level === 'hazardous' ? 'bg-red-100 text-red-700' :
                                                                        schedule.hazard_level === 'ee/crt' ? 'bg-orange-100 text-orange-700' :
                                                                        'bg-green-100 text-green-700'
                                                                    }`}>
                                                                        {schedule.hazard_level}
                                                                    </span>
                                                                </div>
                                                                {schedule.description && (
                                                                    <p className="italic text-surface-500 mt-2">"{schedule.description}"</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteSchedule(schedule.id)}
                                                            className="text-surface-400 hover:text-red-600 transition-colors p-2 ml-2"
                                                            title="Delete Schedule"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Recurring Schedules Summary */}
                                {recurringSchedules.length > 0 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                            <Clock size={18} />
                                            Recurring Schedules
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            {recurringSchedules.map(recurring => (
                                                <div key={recurring.id} className="text-blue-800">
                                                    <span className="font-medium">{recurring.waste_type}</span> - {recurring.quantity} {recurring.unit} {recurring.frequency}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ) : (
                /* ─── Global List Section ─── */
                <div className="space-y-4">
                    {isGlobalLoading ? (
                        <div className="flex items-center justify-center h-64 text-surface-400">
                            <Loader className="animate-spin mb-2" />
                            <span className="ml-2">Loading live forecasts...</span>
                        </div>
                    ) : globalForecasts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-surface-500">No active forecasts in the network.</p>
                        </div>
                    ) : (
                        globalForecasts.map(forecast => (
                            <div key={forecast.id} className="bg-white rounded-xl shadow-sm border border-surface-200 p-5 hover:border-brand-200 transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-surface-900">{forecast.waste_type}</h3>
                                            <div className="flex items-center gap-2 text-sm text-surface-500 mt-1">
                                                <span className="font-medium text-surface-700">
                                                    {forecast.companies?.company_name || 'Confidential Supplier'}
                                                </span>
                                                <span>•</span>
                                                <span>{forecast.companies?.location || 'Unknown Location'}</span>
                                            </div>
                                            <div className="mt-3 flex items-center gap-4 text-sm">
                                                <div className="bg-surface-50 px-2.5 py-1 rounded-md text-surface-700 border border-surface-200">
                                                    <span className="font-semibold">{forecast.quantity} {forecast.unit}</span> Available
                                                </div>
                                                <div className="text-brand-700 flex items-center gap-1.5 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100">
                                                    <Calendar size={14} />
                                                    Available {new Date(forecast.available_from).toLocaleDateString()}
                                                </div>
                                            </div>
                                            {forecast.description && (
                                                <p className="text-surface-500 text-sm mt-3 bg-surface-50/50 p-2 rounded italic">
                                                    "{forecast.description}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {myId !== forecast.company_id && (
                                        <button
                                            onClick={() => navigate(`/app/messages?partnerId=${forecast.company_id}`)}
                                            className="px-4 py-2 bg-white border border-surface-300 hover:border-brand-500 hover:text-brand-600 text-surface-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            <MessageSquare size={16} />
                                            Contact Supplier
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default WasteForecastPage;
