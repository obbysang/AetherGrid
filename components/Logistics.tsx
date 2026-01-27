
import React, { useEffect, useState } from 'react';
import { WorkOrder } from '../types';
import { Calendar, Truck, Clock, CheckCircle, AlertOctagon, MoreHorizontal, User, Plus, X, ArrowRight, ArrowLeft, List, Grid } from 'lucide-react';
import { logisticsService } from '../services/logisticsService';

const ORDER_STATUSES: WorkOrder['status'][] = ['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'];

export const Logistics: React.FC = () => {
    const [orders, setOrders] = useState<WorkOrder[]>([]);
    const [viewMode, setViewMode] = useState<'BOARD' | 'LIST'>('BOARD');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // Form State
    const [newOrder, setNewOrder] = useState<Partial<WorkOrder>>({
        title: '',
        assetId: '',
        priority: 'MEDIUM',
        estimatedDuration: 4
    });

    useEffect(() => {
        // Load initial orders
        setOrders(logisticsService.getOrders());
        setIsLoading(false);
    }, []);

    const handleStatusChange = async (id: string, direction: 'NEXT' | 'PREV') => {
        const order = orders.find(o => o.id === id);
        if (!order) return;

        const currentIndex = ORDER_STATUSES.indexOf(order.status);
        let newIndex = direction === 'NEXT' ? currentIndex + 1 : currentIndex - 1;
        
        if (newIndex < 0 || newIndex >= ORDER_STATUSES.length) return;
        
        const newStatus = ORDER_STATUSES[newIndex];
        
        // Optimistic UI update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));

        try {
            await logisticsService.updateOrder(id, { status: newStatus });
        } catch (e) {
            // Revert on failure
            setOrders(prev => prev.map(o => o.id === id ? order : o));
            alert("Failed to update order status");
        }
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const created = await logisticsService.createWorkOrder(newOrder);
            setOrders(prev => [created, ...prev]);
            setIsModalOpen(false);
            setNewOrder({ title: '', assetId: '', priority: 'MEDIUM', estimatedDuration: 4 });
        } catch (e) {
            alert("Failed to create work order");
        }
    };

    const getStats = () => {
        const total = orders.length;
        const critical = orders.filter(o => o.priority === 'CRITICAL').length;
        const completed = orders.filter(o => o.status === 'COMPLETED').length;
        const active = orders.filter(o => o.status === 'IN_PROGRESS').length;
        return { total, critical, completed, active };
    };

    const stats = getStats();

    if (isLoading) return <div className="p-10 text-white">Loading Logistics Data...</div>;

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6 max-w-[1600px] mx-auto relative">
            {/* Header */}
            <div className="flex justify-between items-end flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Logistics & Repair</h1>
                    <p className="text-text-muted text-sm">Automated Work Order Management • Gemini 3 Pro Logistics Agent</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setViewMode(viewMode === 'BOARD' ? 'LIST' : 'BOARD')}
                        className="flex items-center gap-2 px-4 py-2 bg-background-panel border border-primary-dim rounded-lg text-text-muted hover:text-white transition-colors"
                    >
                        {viewMode === 'BOARD' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                        <span>{viewMode === 'BOARD' ? 'List View' : 'Board View'}</span>
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark font-bold rounded-lg shadow-[0_0_15px_rgba(6,249,249,0.2)] hover:bg-primary-dark transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Dispatch Crew</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 flex-shrink-0">
                <div className="bg-background-panel border border-primary-dim p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary"><Clock className="w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-bold text-white">4.2h</div>
                        <div className="text-xs text-text-muted uppercase">Avg Response Time</div>
                    </div>
                </div>
                <div className="bg-background-panel border border-primary-dim p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-success/10 rounded-lg text-success"><CheckCircle className="w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-bold text-white">{Math.round((stats.completed / stats.total) * 100 || 0)}%</div>
                        <div className="text-xs text-text-muted uppercase">Completion Rate</div>
                    </div>
                </div>
                <div className="bg-background-panel border border-primary-dim p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-alert/10 rounded-lg text-alert"><AlertOctagon className="w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.critical}</div>
                        <div className="text-xs text-text-muted uppercase">Critical Tickets</div>
                    </div>
                </div>
                <div className="bg-background-panel border border-primary-dim p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-lg text-white"><Truck className="w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.active}</div>
                        <div className="text-xs text-text-muted uppercase">Active Crews</div>
                    </div>
                </div>
            </div>

            {/* Board View */}
            {viewMode === 'BOARD' && (
                <div className="flex gap-4 overflow-x-auto flex-1 min-h-0 pb-2">
                    {ORDER_STATUSES.map((status) => (
                        <div key={status} className="flex-1 min-w-[280px] bg-background-panel/50 border border-primary-dim rounded-xl flex flex-col h-full">
                            <div className="p-4 border-b border-primary-dim flex justify-between items-center text-white">
                                <h3 className="font-bold uppercase text-sm tracking-wider text-primary">{status.replace('_', ' ')}</h3>
                                <span className="text-xs font-mono bg-black/20 px-2 py-0.5 rounded text-white">
                                    {orders.filter(o => o.status === status).length}
                                </span>
                            </div>
                            <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                                {orders.filter(o => o.status === status).map((wo) => (
                                    <div key={wo.id} className="bg-background-dark border border-primary-dim rounded-lg p-4 hover:border-primary/50 transition-all group relative overflow-hidden">
                                        {wo.priority === 'CRITICAL' && <div className="absolute top-0 right-0 w-3 h-3 bg-alert rounded-bl-lg shadow-[0_0_5px_#fa5c38]"></div>}
                                        
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] text-text-muted font-mono">{wo.id}</span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <button 
                                                    onClick={() => handleStatusChange(wo.id, 'PREV')}
                                                    disabled={status === 'PENDING'}
                                                    className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                                                 >
                                                     <ArrowLeft className="w-3 h-3 text-text-muted" />
                                                 </button>
                                                 <button 
                                                    onClick={() => handleStatusChange(wo.id, 'NEXT')}
                                                    disabled={status === 'COMPLETED'}
                                                    className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                                                 >
                                                     <ArrowRight className="w-3 h-3 text-text-muted" />
                                                 </button>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-white text-sm mb-1">{wo.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                                            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">{wo.assetId}</span>
                                            <span>• {wo.estimatedDuration}h est.</span>
                                        </div>
                                        
                                        {wo.assignedCrew && (
                                            <div className="flex items-center gap-2 pt-3 border-t border-primary-dim">
                                                <div className="w-5 h-5 rounded-full bg-background-panel flex items-center justify-center border border-primary-dim">
                                                    <User className="w-3 h-3 text-text-muted" />
                                                </div>
                                                <span className="text-xs text-white">{wo.assignedCrew}</span>
                                                {wo.scheduledDate && <span className="text-[10px] text-text-muted ml-auto font-mono">{wo.scheduledDate}</span>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* List View */}
            {viewMode === 'LIST' && (
                <div className="bg-background-panel border border-primary-dim rounded-xl overflow-hidden flex-1 flex flex-col">
                    <div className="grid grid-cols-7 gap-4 p-4 border-b border-primary-dim bg-background-dark/50 text-xs font-bold text-text-muted uppercase">
                        <div className="col-span-2">Work Order</div>
                        <div>Asset</div>
                        <div>Status</div>
                        <div>Priority</div>
                        <div>Crew</div>
                        <div className="text-right">Action</div>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {orders.map((wo) => (
                            <div key={wo.id} className="grid grid-cols-7 gap-4 p-4 border-b border-primary-dim/30 hover:bg-white/5 items-center text-sm transition-colors">
                                <div className="col-span-2">
                                    <div className="font-bold text-white">{wo.title}</div>
                                    <div className="text-xs text-text-muted font-mono">{wo.id}</div>
                                </div>
                                <div className="font-mono text-primary">{wo.assetId}</div>
                                <div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold 
                                        ${wo.status === 'COMPLETED' ? 'bg-success/20 text-success' : 
                                          wo.status === 'IN_PROGRESS' ? 'bg-primary/20 text-white' : 
                                          wo.status === 'SCHEDULED' ? 'bg-white/10 text-text-muted' : 
                                          'bg-alert/10 text-alert'}`}>
                                        {wo.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div>
                                    <span className={`font-bold ${wo.priority === 'CRITICAL' ? 'text-alert' : wo.priority === 'HIGH' ? 'text-orange-400' : 'text-text-muted'}`}>
                                        {wo.priority}
                                    </span>
                                </div>
                                <div className="text-text-muted text-xs">
                                    {wo.assignedCrew || 'Unassigned'}
                                </div>
                                <div className="flex justify-end gap-2">
                                     <button 
                                        onClick={() => handleStatusChange(wo.id, 'NEXT')}
                                        disabled={wo.status === 'COMPLETED'}
                                        className="p-1.5 border border-primary-dim rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                     >
                                        <ArrowRight className="w-4 h-4 text-primary" />
                                     </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Order Modal */}
            {isModalOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-background-dark border border-primary-dim rounded-xl w-[500px] shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-primary-dim pb-4">
                            <h2 className="text-xl font-bold text-white">Dispatch New Crew</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateOrder} className="space-y-4">
                            <div>
                                <label className="block text-xs text-text-muted mb-1 uppercase font-bold">Work Order Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newOrder.title}
                                    onChange={e => setNewOrder({...newOrder, title: e.target.value})}
                                    className="w-full bg-background-panel border border-primary-dim rounded p-2 text-white focus:border-primary outline-none"
                                    placeholder="e.g. Generator Bearing Inspection"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-text-muted mb-1 uppercase font-bold">Asset ID</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={newOrder.assetId}
                                        onChange={e => setNewOrder({...newOrder, assetId: e.target.value})}
                                        className="w-full bg-background-panel border border-primary-dim rounded p-2 text-white focus:border-primary outline-none"
                                        placeholder="WTG-..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-text-muted mb-1 uppercase font-bold">Priority</label>
                                    <select 
                                        value={newOrder.priority}
                                        onChange={e => setNewOrder({...newOrder, priority: e.target.value as any})}
                                        className="w-full bg-background-panel border border-primary-dim rounded p-2 text-white focus:border-primary outline-none"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs text-text-muted mb-1 uppercase font-bold">Estimated Hours</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={newOrder.estimatedDuration}
                                    onChange={e => setNewOrder({...newOrder, estimatedDuration: Number(e.target.value)})}
                                    className="w-full bg-background-panel border border-primary-dim rounded p-2 text-white focus:border-primary outline-none"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2 border border-primary-dim rounded text-text-muted hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-2 bg-primary text-background-dark font-bold rounded hover:bg-primary-dark transition-colors"
                                >
                                    Confirm Dispatch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
