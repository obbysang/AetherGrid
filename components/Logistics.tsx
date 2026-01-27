import React from 'react';
import { WorkOrder } from '../types';
import { Calendar, Truck, Clock, CheckCircle, AlertOctagon, MoreHorizontal, User } from 'lucide-react';

const MOCK_WORK_ORDERS: WorkOrder[] = [
    { id: 'WO-2026-0127-001', title: 'Blade Erosion Repair', assetId: 'WTG-042', status: 'PENDING', priority: 'CRITICAL', estimatedDuration: 6, partsRequired: ['Leading Edge Kit', 'Epoxy'] },
    { id: 'WO-2026-0126-055', title: 'Gearbox Oil Change', assetId: 'WTG-011', status: 'SCHEDULED', priority: 'MEDIUM', assignedCrew: 'Team Alpha', scheduledDate: '2026-02-12', estimatedDuration: 4, partsRequired: ['Oil Filter', 'Lubricant'] },
    { id: 'WO-2026-0126-042', title: 'Inverter Replacement', assetId: 'SOL-105', status: 'IN_PROGRESS', priority: 'HIGH', assignedCrew: 'Team Bravo', scheduledDate: '2026-02-10', estimatedDuration: 8, partsRequired: ['Inverter Unit X5'] },
    { id: 'WO-2026-0125-019', title: 'Sensor Calibration', assetId: 'WTG-033', status: 'COMPLETED', priority: 'LOW', assignedCrew: 'Team Alpha', scheduledDate: '2026-02-08', estimatedDuration: 2, partsRequired: [] },
];

const KanbanColumn = ({ title, status, orders, color }: any) => (
    <div className="flex-1 min-w-[280px] bg-background-panel/50 border border-primary-dim rounded-xl flex flex-col h-full">
        <div className={`p-4 border-b border-primary-dim flex justify-between items-center ${color}`}>
            <h3 className="font-bold uppercase text-sm tracking-wider">{title}</h3>
            <span className="text-xs font-mono bg-black/20 px-2 py-0.5 rounded">{orders.length}</span>
        </div>
        <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
            {orders.map((wo: WorkOrder) => (
                <div key={wo.id} className="bg-background-dark border border-primary-dim rounded-lg p-4 hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden">
                    {wo.priority === 'CRITICAL' && <div className="absolute top-0 right-0 w-3 h-3 bg-alert rounded-bl-lg shadow-[0_0_5px_#fa5c38]"></div>}
                    
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-text-muted font-mono">{wo.id}</span>
                        <MoreHorizontal className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="font-bold text-white text-sm mb-1">{wo.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">{wo.assetId}</span>
                        <span>• {wo.estimatedDuration}h</span>
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
);

export const Logistics: React.FC = () => {
    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-end flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Logistics & Repair</h1>
                    <p className="text-text-muted text-sm">Automated Work Order Management • Gemini 3 Pro Logistics Agent</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-background-panel border border-primary-dim rounded-lg text-text-muted hover:text-white transition-colors">
                        <Calendar className="w-4 h-4" />
                        <span>Calendar View</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark font-bold rounded-lg shadow-[0_0_15px_rgba(6,249,249,0.2)] hover:bg-primary-dark transition-colors">
                        <Truck className="w-4 h-4" />
                        <span>Dispatch Crew</span>
                    </button>
                </div>
            </div>

            {/* Metrics */}
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
                        <div className="text-2xl font-bold text-white">92%</div>
                        <div className="text-xs text-text-muted uppercase">SLA Compliance</div>
                    </div>
                </div>
                <div className="bg-background-panel border border-primary-dim p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-alert/10 rounded-lg text-alert"><AlertOctagon className="w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-bold text-white">1</div>
                        <div className="text-xs text-text-muted uppercase">Safety Incidents</div>
                    </div>
                </div>
                <div className="bg-background-panel border border-primary-dim p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-lg text-white"><Truck className="w-6 h-6" /></div>
                    <div>
                        <div className="text-2xl font-bold text-white">3/5</div>
                        <div className="text-xs text-text-muted uppercase">Crews Active</div>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex gap-4 overflow-x-auto flex-1 min-h-0 pb-2">
                <KanbanColumn 
                    title="Pending Approval" 
                    status="PENDING" 
                    orders={MOCK_WORK_ORDERS.filter(o => o.status === 'PENDING')} 
                    color="text-alert"
                />
                <KanbanColumn 
                    title="Scheduled" 
                    status="SCHEDULED" 
                    orders={MOCK_WORK_ORDERS.filter(o => o.status === 'SCHEDULED')} 
                    color="text-primary"
                />
                <KanbanColumn 
                    title="In Progress" 
                    status="IN_PROGRESS" 
                    orders={MOCK_WORK_ORDERS.filter(o => o.status === 'IN_PROGRESS')} 
                    color="text-white"
                />
                <KanbanColumn 
                    title="Completed" 
                    status="COMPLETED" 
                    orders={MOCK_WORK_ORDERS.filter(o => o.status === 'COMPLETED')} 
                    color="text-success"
                />
            </div>
        </div>
    );
};