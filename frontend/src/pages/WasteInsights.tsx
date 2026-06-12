import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    PieChart as PieChartIcon, TrendingUp, Package, Factory,
    Loader, Search, Recycle, BarChart3
} from 'lucide-react';
import {
    getTopWasteTypes, getTopDemandMaterials, getTopIndustries,
    type WasteInsight
} from '../lib/db';

/* ─── Card ─── */
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-2xl border border-surface-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon?: any }) => (
    <div className="flex items-center gap-3 px-6 pt-6 pb-4">
        {Icon && (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center shadow-sm">
                <Icon size={16} className="text-white" />
            </div>
        )}
        <div>
            <h3 className="font-bold text-surface-900 text-[16px]">{title}</h3>
            {subtitle && <p className="text-[13px] font-medium text-surface-400 mt-0.5">{subtitle}</p>}
        </div>
    </div>
);

/* ─── Chart Colors ─── */
const COLORS = ['#10B981', '#059669', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-surface-200 rounded-xl shadow-lg px-4 py-3 text-[12px]">
            <p className="font-bold text-surface-900 mb-1 capitalize">{label?.replace(/-/g, ' ') || payload[0]?.name}</p>
            {payload.map((entry: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-surface-600 font-medium">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color || entry.payload?.fill }} />
                    <span>Count: <span className="font-bold text-surface-900">{entry.value}</span></span>
                </div>
            ))}
        </div>
    );
};

const WasteInsights = () => {
    const [loading, setLoading] = useState(true);
    const [wasteTypes, setWasteTypes] = useState<WasteInsight[]>([]);
    const [demandMaterials, setDemandMaterials] = useState<WasteInsight[]>([]);
    const [industries, setIndustries] = useState<WasteInsight[]>([]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [wt, dm, ind] = await Promise.all([
                getTopWasteTypes(8),
                getTopDemandMaterials(8),
                getTopIndustries(8),
            ]);
            setWasteTypes(wt);
            setDemandMaterials(dm);
            setIndustries(ind);
            setLoading(false);
        };
        load();
    }, []);

    const totalListings = wasteTypes.reduce((s, w) => s + w.count, 0);
    const totalDemand = demandMaterials.reduce((s, w) => s + w.count, 0);
    const totalIndustries = industries.length;

    if (loading) return (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
                <Loader className="animate-spin text-brand-500" size={28} />
                <p className="text-[14px] text-surface-400 font-medium">Loading insights...</p>
            </div>
        </div>
    );

    return (
        <div className="p-6 lg:p-8 max-w-[1480px] mx-auto space-y-6 animate-fade-in">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
                            <PieChartIcon size={20} className="text-white" />
                        </div>
                        <h1 className="text-[28px] font-extrabold tracking-tight text-surface-900">Waste Insights</h1>
                    </div>
                    <p className="text-surface-400 text-[15px] font-medium">
                        Market intelligence from the MOLE circular economy platform.
                    </p>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Listings', value: totalListings, icon: Package, gradient: 'from-brand-500 to-emerald-600', change: 'Active' },
                    { label: 'Material Requests', value: totalDemand, icon: Search, gradient: 'from-amber-500 to-orange-500', change: 'Demand' },
                    { label: 'Industries Active', value: totalIndustries, icon: Factory, gradient: 'from-purple-500 to-indigo-600', change: 'Sectors' },
                ].map(kpi => (
                    <Card key={kpi.label} className="relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300 hover:shadow-md">
                        <div className={`absolute top-0 right-0 w-[100px] h-[100px] bg-gradient-to-bl ${kpi.gradient} rounded-bl-[60px] opacity-[0.06] group-hover:opacity-[0.1] transition-opacity`} />
                        <div className="p-6 relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-sm`}>
                                    <kpi.icon size={18} className="text-white" />
                                </div>
                                <span className="text-[12px] font-bold px-2.5 py-1 rounded-lg text-emerald-700 bg-emerald-50">{kpi.change}</span>
                            </div>
                            <p className="text-[12px] font-semibold text-surface-400 uppercase tracking-wide">{kpi.label}</p>
                            <p className="text-[32px] font-extrabold text-surface-900 tracking-tight leading-tight mt-1">{kpi.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Top Listed Waste Types */}
                <Card>
                    <CardHeader title="Most Listed Waste Types" subtitle="Distribution across the marketplace" icon={BarChart3} />
                    <div className="px-6 pb-6">
                        {wasteTypes.length === 0 ? (
                            <div className="text-center py-10">
                                <Recycle size={24} className="text-surface-200 mx-auto mb-2" />
                                <p className="text-[13px] text-surface-400 font-medium">No listings data available yet</p>
                            </div>
                        ) : (
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={wasteTypes.map(w => ({ name: w.label.replace(/-/g, ' '), count: w.count }))} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" horizontal={false} />
                                        <XAxis type="number" stroke="#A1A1AA" fontSize={11} fontWeight={500} tickLine={false} axisLine={false} />
                                        <YAxis type="category" dataKey="name" stroke="#A1A1AA" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} width={120} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="count" fill="#10B981" radius={[0, 6, 6, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </Card>

                {/* High Demand Materials */}
                <Card>
                    <CardHeader title="High Demand Materials" subtitle="Most requested by buyers" icon={TrendingUp} />
                    <div className="px-6 pb-6">
                        {demandMaterials.length === 0 ? (
                            <div className="text-center py-10">
                                <Search size={24} className="text-surface-200 mx-auto mb-2" />
                                <p className="text-[13px] text-surface-400 font-medium">No demand data available yet</p>
                            </div>
                        ) : (
                            <div className="h-[300px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={demandMaterials.map(d => ({ name: d.label.replace(/-/g, ' '), value: d.count }))}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={4}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                            labelLine={false}
                                        >
                                            {demandMaterials.map((_, idx) => (
                                                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Industry Breakdown */}
            <Card>
                <CardHeader title="Top Performing Industries" subtitle="Companies grouped by sector" icon={Factory} />
                <div className="px-6 pb-6">
                    {industries.length === 0 ? (
                        <div className="text-center py-10">
                            <Factory size={24} className="text-surface-200 mx-auto mb-2" />
                            <p className="text-[13px] text-surface-400 font-medium">No industry data yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {industries.map((ind, i) => (
                                <div key={ind.label} className="p-4 rounded-xl bg-surface-50 border border-surface-100 hover:bg-white hover:shadow-sm transition-all text-center group">
                                    <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-sm`} style={{ backgroundColor: COLORS[i % COLORS.length] + '20' }}>
                                        <Factory size={18} style={{ color: COLORS[i % COLORS.length] }} />
                                    </div>
                                    <p className="text-[20px] font-extrabold text-surface-900">{ind.count}</p>
                                    <p className="text-[12px] font-bold text-surface-600 mt-1 capitalize">{ind.label}</p>
                                    <p className="text-[10px] text-surface-400 font-medium mt-0.5">companies</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {/* Supply vs Demand Gap Analysis */}
            {wasteTypes.length > 0 && demandMaterials.length > 0 && (
                <Card>
                    <CardHeader title="Supply vs Demand Gap" subtitle="Materials with highest unmet demand" icon={Recycle} />
                    <div className="px-6 pb-6">
                        <div className="space-y-3">
                            {demandMaterials.slice(0, 5).map(dm => {
                                const supply = wasteTypes.find(wt => wt.label === dm.label)?.count || 0;
                                const gap = dm.count - supply;
                                const ratio = supply > 0 ? Math.min((supply / dm.count) * 100, 100) : 0;

                                return (
                                    <div key={dm.label} className="flex items-center gap-4 py-3 border-b border-surface-100 last:border-0">
                                        <div className="w-[140px]">
                                            <p className="text-[13px] font-bold text-surface-900 capitalize">{dm.label.replace(/-/g, ' ')}</p>
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${ratio >= 80 ? 'bg-emerald-500' : ratio >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                                                    style={{ width: `${ratio}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-[12px] font-bold w-[160px] shrink-0">
                                            <span className="text-surface-600">{supply} supply</span>
                                            <span className="text-surface-400">vs</span>
                                            <span className="text-surface-600">{dm.count} demand</span>
                                        </div>
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${gap > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {gap > 0 ? `−${gap} gap` : 'Balanced'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default WasteInsights;
