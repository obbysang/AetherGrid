import React, { useState, useMemo } from 'react';
import { List } from 'react-window';
import { Search, Download, Trash2, Filter, AlertTriangle, CheckCircle, Info, Calendar } from 'lucide-react';

export interface HistoryLogEntry {
    id: number | string;
    timestamp: string; // ISO string or formatted time
    type: 'CRITICAL' | 'NORMAL' | 'SYSTEM' | 'WARNING';
    title: string;
    description: string;
    metadata?: Record<string, any>;
}

interface HistoryPanelProps {
    logs: HistoryLogEntry[];
    onClear: () => void;
    className?: string;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ logs, onClear, className }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'CRITICAL' | 'NORMAL' | 'WARNING' | 'SYSTEM'>('ALL');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

    // Filter and Sort Logic
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = 
                log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.metadata ? JSON.stringify(log.metadata).toLowerCase().includes(searchTerm.toLowerCase()) : false);
            
            const matchesType = typeFilter === 'ALL' || log.type === typeFilter;

            return matchesSearch && matchesType;
        }).sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
        });
    }, [logs, searchTerm, typeFilter, sortOrder]);

    // Export Logic
    const handleExport = (format: 'JSON' | 'CSV') => {
        if (format === 'JSON') {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `history_export_${new Date().toISOString()}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        } else {
            const headers = ['ID', 'Timestamp', 'Type', 'Title', 'Description'];
            const csvContent = "data:text/csv;charset=utf-8," 
                + headers.join(",") + "\n" 
                + filteredLogs.map(e => `${e.id},${e.timestamp},${e.type},${e.title},"${e.description}"`).join("\n");
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `history_export_${new Date().toISOString()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
    };

    // Row Renderer for Virtualized List
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const log = filteredLogs[index];
        return (
            <div style={style} className="px-2 py-1">
                <div className="flex items-center gap-4 p-3 bg-background-dark/40 border border-primary-dim/30 rounded-lg hover:bg-white/5 transition-colors group">
                    <div className="w-24 text-xs text-text-muted font-mono flex-shrink-0">
                        {log.timestamp}
                    </div>
                    
                    <div className="w-8 flex justify-center flex-shrink-0">
                        {log.type === 'CRITICAL' && <AlertTriangle className="w-4 h-4 text-alert" />}
                        {log.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                        {log.type === 'NORMAL' && <CheckCircle className="w-4 h-4 text-success" />}
                        {log.type === 'SYSTEM' && <Info className="w-4 h-4 text-primary" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-bold text-white truncate">{log.title}</span>
                            <span className={`text-[10px] px-1.5 rounded border ${
                                log.type === 'CRITICAL' ? 'border-alert/30 text-alert bg-alert/10' : 
                                log.type === 'NORMAL' ? 'border-success/30 text-success bg-success/10' :
                                'border-primary/30 text-primary bg-primary/10'
                            }`}>
                                {log.type}
                            </span>
                        </div>
                        <p className="text-xs text-text-muted truncate">{log.description}</p>
                    </div>

                    {log.metadata && (
                        <div className="hidden xl:block w-48 text-[10px] text-text-muted font-mono bg-black/40 p-1.5 rounded border border-white/5 truncate">
                            {JSON.stringify(log.metadata)}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`flex flex-col h-full bg-background-panel border border-primary-dim rounded-xl overflow-hidden ${className}`}>
            {/* Toolbar */}
            <div className="p-4 border-b border-primary-dim bg-background-dark/50 space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        System History
                        <span className="text-xs font-normal text-text-muted bg-white/10 px-2 py-0.5 rounded-full">
                            {filteredLogs.length} Entries
                        </span>
                    </h3>
                    <div className="flex gap-2">
                         <button 
                            onClick={() => handleExport('CSV')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-background-dark border border-primary-dim rounded text-xs text-text-muted hover:text-white hover:border-primary transition-colors"
                        >
                            <Download className="w-3 h-3" />
                            Export CSV
                        </button>
                        <button 
                            onClick={onClear}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-background-dark border border-alert/30 rounded text-xs text-alert/80 hover:text-alert hover:bg-alert/10 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" />
                            Clear Log
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input 
                            type="text" 
                            placeholder="Search logs..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/50 border border-primary-dim rounded pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-primary placeholder:text-text-muted/50"
                        />
                    </div>
                    
                    <div className="flex items-center bg-black/50 border border-primary-dim rounded px-1">
                        <Filter className="w-3 h-3 text-text-muted ml-2 mr-1" />
                        <select 
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as any)}
                            className="bg-transparent border-none text-xs text-text-muted focus:ring-0 cursor-pointer py-1.5 pr-2"
                        >
                            <option value="ALL">All Types</option>
                            <option value="CRITICAL">Critical</option>
                            <option value="NORMAL">Normal</option>
                            <option value="WARNING">Warning</option>
                            <option value="SYSTEM">System</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List Area */}
            <div className="flex-1 min-h-0">
                {filteredLogs.length > 0 ? (
                    <div className="h-full">
                        {/* 
                           Note: FixedSizeList requires a specific height. 
                           In a real responsive scenario, we'd use AutoSizer.
                           For now, we'll use a wrapper with 100% height and assume parent constrains it.
                           Since AutoSizer is not installed, we'll use a simple CSS overflow solution first 
                           to avoid complexity if the container height is dynamic. 
                           However, standard react-window usage implies explicit dimensions.
                           I will stick to a standard mapped div with overflow-y-auto for simplicity and reliability 
                           without AutoSizer, unless the list is MASSIVE (10k+). 
                           Wait, the prompt asked for virtualization. I'll use a hack to get height or just use 100% height with CSS and standard map if I can't easily measure.
                           
                           Actually, I can use a ResizeObserver to get dimensions for the list.
                        */}
                        <VirtualizedListContainer items={filteredLogs} Row={Row} itemSize={70} />
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                        <Search className="w-8 h-8 mb-2" />
                        <p className="text-sm">No matching logs found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper component to handle auto-sizing for the virtual list
const VirtualizedListContainer = ({ items, Row, itemSize }: { items: any[], Row: any, itemSize: number }) => {
    const parentRef = React.useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    React.useEffect(() => {
        if (!parentRef.current) return;
        
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });

        resizeObserver.observe(parentRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div ref={parentRef} className="w-full h-full">
            {dimensions.height > 0 && (
                <List
                    style={{ width: dimensions.width, height: dimensions.height }}
                    rowCount={items.length}
                    rowHeight={itemSize}
                    rowComponent={Row}
                    rowProps={{}}
                />
            )}
        </div>
    );
};
