import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    getMyDeals, updateDealStage, updateDealStatus, createNotification,
    type Transaction
} from '../lib/db';
import {
    Package, Truck, CheckCircle2, Clock,
    ArrowRight, Loader, ChevronRight, X,
    Handshake, MessageSquare, Award
} from 'lucide-react';

/* ─── Pipeline Stages ─── */
const PIPELINE_STAGES = [
    { id: 'agreement', label: 'Interested', icon: Handshake, color: 'bg-blue-500', lightBg: 'bg-blue-50', lightText: 'text-blue-700', border: 'border-blue-200' },
    { id: 'payment_pending', label: 'In Discussion', icon: MessageSquare, color: 'bg-amber-500', lightBg: 'bg-amber-50', lightText: 'text-amber-700', border: 'border-amber-200' },
    { id: 'logistics', label: 'Accepted', icon: CheckCircle2, color: 'bg-brand-500', lightBg: 'bg-brand-50', lightText: 'text-brand-700', border: 'border-brand-200' },
    { id: 'delivery', label: 'In Transit', icon: Truck, color: 'bg-purple-500', lightBg: 'bg-purple-50', lightText: 'text-purple-700', border: 'border-purple-200' },
    { id: 'review', label: 'Completed', icon: Award, color: 'bg-emerald-500', lightBg: 'bg-emerald-50', lightText: 'text-emerald-700', border: 'border-emerald-200' },
];

const MyDeals = () => {
    const [deals, setDeals] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [myId, setMyId] = useState<string | null>(null);
    const [movingDealId, setMovingDealId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setMyId(user.id);
            const data = await getMyDeals();
            setDeals(data);
            setLoading(false);
        };
        init();
    }, []);

    const handleMoveStage = async (deal: Transaction, nextStage: string) => {
        setMovingDealId(deal.id);
        const { error } = await updateDealStage(deal.id, nextStage);
        if (!error) {
            // Auto-complete deal if moved to 'review'
            if (nextStage === 'review') {
                await updateDealStatus(deal.id, 'completed');
            }

            // Send notification to partner
            const isSeller = deal.seller_id === myId;
            const partnerId = isSeller ? deal.buyer_id : deal.seller_id;
            const stageName = PIPELINE_STAGES.find(s => s.id === nextStage)?.label || nextStage;
            await createNotification({
                company_id: partnerId,
                type: 'info',
                title: `Deal Updated: ${deal.material}`,
                body: `The deal for ${deal.material} has moved to "${stageName}" stage.`,
                action_url: '/app/deals',
            });

            // Refresh
            const refreshed = await getMyDeals();
            setDeals(refreshed);
            setSuccessMsg(`Deal moved to "${stageName}"`);
            setTimeout(() => setSuccessMsg(null), 3000);
        }
        setMovingDealId(null);
    };

    const getDealsForStage = (stageId: string) =>
        deals.filter(d => d.stage === stageId);

    const getNextStage = (currentStage: string) => {
        const idx = PIPELINE_STAGES.findIndex(s => s.id === currentStage);
        return idx < PIPELINE_STAGES.length - 1 ? PIPELINE_STAGES[idx + 1] : null;
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
                <Loader className="animate-spin text-brand-500" size={28} />
                <p className="text-[14px] text-surface-400 font-medium">Loading deals...</p>
            </div>
        </div>
    );

    return (
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto animate-fade-in">

            {/* Success Toast */}
            {successMsg && (
                <div className="fixed top-20 right-6 z-50 animate-slide-in-top">
                    <div className="bg-surface-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-[13px] font-semibold">
                        <CheckCircle2 size={16} className="text-brand-400" />
                        {successMsg}
                        <button onClick={() => setSuccessMsg(null)} className="ml-2 text-white/50 hover:text-white">
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center shadow-md shadow-brand-500/20">
                            <Handshake size={20} className="text-white" />
                        </div>
                        <h1 className="text-[28px] font-extrabold tracking-tight text-surface-900">Deal Pipeline</h1>
                    </div>
                    <p className="text-surface-400 text-[15px] font-medium">
                        Track and manage your active deals through every stage.
                        <span className="ml-2 text-brand-600 font-bold">{deals.length} deal{deals.length !== 1 ? 's' : ''} active</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={`px-4 py-2.5 text-[13px] font-bold rounded-xl border transition-all ${viewMode === 'kanban' ? 'bg-surface-900 text-white border-surface-900' : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'}`}
                    >
                        Kanban
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2.5 text-[13px] font-bold rounded-xl border transition-all ${viewMode === 'list' ? 'bg-surface-900 text-white border-surface-900' : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'}`}
                    >
                        List View
                    </button>
                </div>
            </div>

            {/* Pipeline Overview Bar */}
            <div className="grid grid-cols-5 gap-3 mb-8">
                {PIPELINE_STAGES.map(stage => {
                    const count = getDealsForStage(stage.id).length;
                    const Icon = stage.icon;
                    return (
                        <div key={stage.id} className={`${stage.lightBg} border ${stage.border} rounded-xl p-3.5 flex items-center gap-3 transition-all hover:shadow-sm`}>
                            <div className={`w-9 h-9 rounded-lg ${stage.color} flex items-center justify-center shadow-sm`}>
                                <Icon size={16} className="text-white" />
                            </div>
                            <div>
                                <p className={`text-[12px] font-bold ${stage.lightText} uppercase tracking-wide`}>{stage.label}</p>
                                <p className="text-[18px] font-extrabold text-surface-900">{count}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {deals.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-surface-200">
                    <div className="w-20 h-20 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-5 border border-surface-200">
                        <Package size={32} className="text-surface-300" />
                    </div>
                    <h3 className="text-[20px] font-extrabold text-surface-900 mb-2">No Active Deals</h3>
                    <p className="text-surface-400 max-w-sm mx-auto text-[14px] font-medium mb-4">
                        Start a conversation with a supplier or buyer to initiate a new deal.
                    </p>
                    <a href="/app/opportunities" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-[13px] font-bold px-6 py-3 rounded-xl shadow-md transition-all">
                        Browse Opportunities <ArrowRight size={14} />
                    </a>
                </div>
            ) : viewMode === 'kanban' ? (
                /* ─── Kanban Board ─── */
                <div className="grid grid-cols-5 gap-4 min-h-[500px]">
                    {PIPELINE_STAGES.map(stage => {
                        const stageDeals = getDealsForStage(stage.id);
                        const Icon = stage.icon;
                        return (
                            <div key={stage.id} className="flex flex-col">
                                {/* Column Header */}
                                <div className={`${stage.lightBg} border ${stage.border} rounded-xl px-4 py-3 mb-3 flex items-center justify-between`}>
                                    <div className="flex items-center gap-2">
                                        <Icon size={14} className={stage.lightText} />
                                        <span className={`text-[12px] font-bold uppercase tracking-wider ${stage.lightText}`}>{stage.label}</span>
                                    </div>
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stage.color} text-white`}>
                                        {stageDeals.length}
                                    </span>
                                </div>

                                {/* Deal Cards */}
                                <div className="flex-1 space-y-3">
                                    {stageDeals.map(deal => {
                                        const isSeller = deal.seller_id === myId;
                                        const partnerName = isSeller ? deal.buyer?.company_name : deal.seller?.company_name;
                                        const nextStage = getNextStage(deal.stage);
                                        const isMoving = movingDealId === deal.id;

                                        return (
                                            <div key={deal.id} className="bg-white rounded-2xl border border-surface-200/60 p-4 shadow-sm hover:shadow-md transition-all group">
                                                {/* Role Badge */}
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${isSeller ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {isSeller ? 'Selling' : 'Buying'}
                                                    </span>
                                                    <span className="text-[10px] text-surface-400 font-medium">
                                                        {new Date(deal.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                    </span>
                                                </div>

                                                {/* Material */}
                                                <h4 className="text-[14px] font-bold text-surface-900 leading-tight mb-1 line-clamp-1">{deal.material}</h4>
                                                <p className="text-[11px] text-surface-500 font-medium truncate mb-3">
                                                    {partnerName || 'Unknown Partner'}
                                                </p>

                                                {/* Value */}
                                                <div className="flex items-center justify-between mb-3 py-2 px-3 bg-surface-50 rounded-lg border border-surface-100">
                                                    <span className="text-[11px] text-surface-400 font-medium">{deal.amount} units</span>
                                                    <span className="text-[14px] font-bold text-brand-600">₹{deal.price.toLocaleString()}</span>
                                                </div>

                                                {/* Move Button */}
                                                {nextStage && (
                                                    <button
                                                        onClick={() => handleMoveStage(deal, nextStage.id)}
                                                        disabled={isMoving}
                                                        className="w-full py-2.5 bg-surface-900 hover:bg-black text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-60 shadow-sm"
                                                    >
                                                        {isMoving ? (
                                                            <Loader size={13} className="animate-spin" />
                                                        ) : (
                                                            <>Move to {nextStage.label} <ChevronRight size={13} /></>
                                                        )}
                                                    </button>
                                                )}
                                                {!nextStage && (
                                                    <div className="w-full py-2.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200">
                                                        <Award size={13} /> Deal Complete
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {stageDeals.length === 0 && (
                                        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-surface-200 rounded-2xl p-6 min-h-[120px]">
                                            <p className="text-[12px] text-surface-300 font-medium text-center">No deals</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ─── List View ─── */
                <div className="space-y-4">
                    {deals.map(deal => {
                        const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.id === deal.stage);
                        const isSeller = deal.seller_id === myId;
                        const partnerName = isSeller ? deal.buyer?.company_name : deal.seller?.company_name;
                        const nextStage = getNextStage(deal.stage);
                        const isMoving = movingDealId === deal.id;
                        const currentStage = PIPELINE_STAGES[currentStageIndex];

                        return (
                            <div key={deal.id} className="bg-white border border-surface-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${isSeller ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {isSeller ? 'Selling' : 'Buying'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${currentStage.lightBg} ${currentStage.lightText} ${currentStage.border} border`}>
                                                {currentStage.label}
                                            </span>
                                            <span className="text-surface-400 text-[11px] font-medium">• {new Date(deal.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-[18px] font-bold text-surface-900 mb-1">{deal.material}</h3>
                                        <p className="text-surface-500 text-[13px] font-medium">
                                            Partner: <span className="font-semibold text-brand-600">{partnerName || 'Unknown'}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[22px] font-bold text-brand-600">₹{deal.price.toLocaleString()}</p>
                                        <p className="text-surface-500 text-[12px] font-medium">{deal.amount} units</p>
                                    </div>
                                </div>

                                {/* Progress Stepper */}
                                <div className="relative mb-6">
                                    <div className="absolute left-0 top-4 w-full h-1 bg-surface-100 -z-10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-500 transition-all duration-1000 ease-out"
                                            style={{ width: `${(currentStageIndex / (PIPELINE_STAGES.length - 1)) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between w-full">
                                        {PIPELINE_STAGES.map((stage, idx) => {
                                            const StageIcon = stage.icon;
                                            const isCompleted = idx <= currentStageIndex;
                                            const isCurrent = idx === currentStageIndex;
                                            return (
                                                <div key={stage.id} className="flex flex-col items-center gap-2">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                                        ? `${stage.color} border-transparent text-white shadow-md scale-110`
                                                        : 'bg-white border-surface-200 text-surface-300'
                                                        }`}>
                                                        {isCompleted ? <CheckCircle2 size={16} /> : <StageIcon size={16} />}
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? stage.lightText : isCompleted ? 'text-surface-600' : 'text-surface-300'}`}>
                                                        {stage.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-surface-100">
                                    <div className="flex items-center gap-2 text-[12px] text-surface-400 font-medium">
                                        <Clock size={13} />
                                        <span>Created {new Date(deal.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {nextStage && (
                                            <button
                                                onClick={() => handleMoveStage(deal, nextStage.id)}
                                                disabled={isMoving}
                                                className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-[12px] font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-brand-500/15 disabled:opacity-60"
                                            >
                                                {isMoving ? <Loader size={13} className="animate-spin" /> : <>Move to {nextStage.label} <ArrowRight size={13} /></>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyDeals;
