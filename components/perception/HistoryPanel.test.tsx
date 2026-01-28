import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { HistoryPanel, HistoryLogEntry } from './HistoryPanel';

// Mock react-window because it requires layout measuring which is hard in JSDOM
// We'll replace it with a simple list for testing logic
vi.mock('react-window', () => ({
    List: ({ rowComponent, rowCount, rowHeight, ...props }: any) => {
        const Row = rowComponent;
        return (
            <div data-testid="virtual-list">
                {Array.from({ length: rowCount }).map((_, index) => (
                    <Row key={index} index={index} style={{ height: rowHeight, top: index * rowHeight }} />
                ))}
            </div>
        );
    },
}));

describe('HistoryPanel', () => {
    const mockLogs: HistoryLogEntry[] = [
        { id: 1, timestamp: '10:00', type: 'CRITICAL', title: 'Critical Error', description: 'Something bad' },
        { id: 2, timestamp: '10:01', type: 'NORMAL', title: 'Routine Check', description: 'All good' },
        { id: 3, timestamp: '10:02', type: 'WARNING', title: 'Warning Sign', description: 'Watch out' },
    ];

    const mockClear = vi.fn();

    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            callback: any;
            constructor(callback: any) {
                this.callback = callback;
            }
            observe(target: any) {
                // Trigger immediately with mock dimensions
                this.callback([{ contentRect: { width: 500, height: 500 } }]);
            }
            unobserve() {}
            disconnect() {}
        } as any;
    });

    it('renders logs correctly', async () => {
        render(<HistoryPanel logs={mockLogs} onClear={mockClear} />);
        expect(await screen.findByText('Critical Error')).toBeInTheDocument();
        expect(screen.getByText('Routine Check')).toBeInTheDocument();
        expect(screen.getByText('Warning Sign')).toBeInTheDocument();
    });

    it('filters by search term', async () => {
        render(<HistoryPanel logs={mockLogs} onClear={mockClear} />);
        const searchInput = screen.getByPlaceholderText('Search logs...');
        fireEvent.change(searchInput, { target: { value: 'Critical' } });

        expect(await screen.findByText('Critical Error')).toBeInTheDocument();
        expect(screen.queryByText('Routine Check')).not.toBeInTheDocument();
    });

    it('filters by type', async () => {
        render(<HistoryPanel logs={mockLogs} onClear={mockClear} />);
        const filterSelect = screen.getByRole('combobox');
        fireEvent.change(filterSelect, { target: { value: 'NORMAL' } });

        expect(screen.queryByText('Critical Error')).not.toBeInTheDocument();
        expect(await screen.findByText('Routine Check')).toBeInTheDocument();
    });

    it('calls onClear when clear button is clicked', () => {
        render(<HistoryPanel logs={mockLogs} onClear={mockClear} />);
        const clearButton = screen.getByText('Clear Log');
        fireEvent.click(clearButton);
        expect(mockClear).toHaveBeenCalled();
    });
});
