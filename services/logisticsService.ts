
import { WorkOrder, RepairPart } from "../types";

const STORAGE_KEY = 'aether_work_orders';

// Initial Mock Data to seed if empty
const SEED_DATA: WorkOrder[] = [
    { 
        id: 'WO-2026-0127-001', 
        title: 'Blade Erosion Repair', 
        assetId: 'WTG-042', 
        status: 'PENDING', 
        priority: 'CRITICAL', 
        estimatedDuration: 6, 
        partsRequired: [{ partId: 'P-BLADE-KIT', quantity: 1, unitCost: 1500, name: 'Leading Edge Kit' }] 
    },
    { 
        id: 'WO-2026-0126-055', 
        title: 'Gearbox Oil Change', 
        assetId: 'WTG-011', 
        status: 'SCHEDULED', 
        priority: 'MEDIUM', 
        assignedCrew: 'Team Alpha', 
        scheduledDate: '2026-02-12', 
        estimatedDuration: 4, 
        partsRequired: [{ partId: 'P-OIL-FILT', quantity: 2, unitCost: 50, name: 'Oil Filter' }] 
    }
];

class LogisticsService {
    private orders: WorkOrder[] = [];

    constructor() {
        this.loadOrders();
    }

    private loadOrders() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                this.orders = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to load Work Orders", e);
                this.orders = [...SEED_DATA];
            }
        } else {
            this.orders = [...SEED_DATA];
            this.saveOrders();
        }
    }

    private saveOrders() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.orders));
    }

    public getOrders(): WorkOrder[] {
        return [...this.orders];
    }

    public getOrder(id: string): WorkOrder | undefined {
        return this.orders.find(o => o.id === id);
    }

    public async createWorkOrder(orderData: Partial<WorkOrder>): Promise<WorkOrder> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const newOrder: WorkOrder = {
            id: `WO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
            title: orderData.title || 'Untitled Maintenance',
            assetId: orderData.assetId || 'UNK-00',
            status: 'PENDING',
            priority: orderData.priority || 'MEDIUM',
            estimatedDuration: orderData.estimatedDuration || 2,
            partsRequired: orderData.partsRequired || [],
            ...orderData
        } as WorkOrder;

        this.orders.unshift(newOrder);
        this.saveOrders();
        return newOrder;
    }

    public async updateOrder(id: string, updates: Partial<WorkOrder>): Promise<WorkOrder> {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const index = this.orders.findIndex(o => o.id === id);
        if (index === -1) throw new Error(`Work Order ${id} not found`);

        this.orders[index] = { ...this.orders[index], ...updates };
        this.saveOrders();
        return this.orders[index];
    }

    public async dispatchRepairCrew(
        faultType: string,
        priorityLevel: number, // 1-5
        assetId: string,
        estimatedParts: RepairPart[],
        crewSize: number,
        estimatedHours: number
    ): Promise<string> { // Returns Work Order ID
        
        const priorityMap: Record<number, WorkOrder['priority']> = {
            1: 'CRITICAL',
            2: 'HIGH',
            3: 'MEDIUM',
            4: 'MEDIUM',
            5: 'LOW'
        };

        const order = await this.createWorkOrder({
            title: `Repair: ${faultType}`,
            assetId,
            priority: priorityMap[priorityLevel] || 'MEDIUM',
            estimatedDuration: estimatedHours,
            partsRequired: estimatedParts,
            crewSize,
            faultType
        });

        // Simulate "Intelligent Scheduling"
        // In a real app with Calendar API, we'd find the slot here.
        // For now, we'll auto-schedule if critical
        if (priorityLevel <= 2) {
            await this.updateOrder(order.id, {
                status: 'SCHEDULED',
                assignedCrew: 'Rapid Response Unit A',
                scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow
            });
        }

        return order.id;
    }
}

export const logisticsService = new LogisticsService();
