import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PerceptionLab } from '../PerceptionLab';

// Mock child components to isolate PerceptionLab logic
vi.mock('./HistoryPanel', () => ({
    HistoryPanel: () => <div data-testid="history-panel">History Panel Content</div>
}));

vi.mock('./ThreeDViewer', () => ({
    ThreeDViewer: () => <div data-testid="3d-viewer">3D Viewer Content</div>
}));

describe('PerceptionLab', () => {
    it('renders in LIVE mode by default', () => {
        render(<PerceptionLab />);
        expect(screen.getByText('LIVE FEED')).toHaveClass('bg-primary/20');
        // Check for LIVE specific elements (Overlay UI)
        expect(screen.getByText('TARGET LOCK: BLADE-B')).toBeInTheDocument(); 
    });

    it('switches to HISTORY mode', () => {
        render(<PerceptionLab />);
        const historyBtn = screen.getByText('HISTORY');
        fireEvent.click(historyBtn);
        
        expect(screen.getByTestId('history-panel')).toBeInTheDocument();
        expect(screen.queryByText('TARGET LOCK: BLADE-B')).not.toBeInTheDocument();
    });

    it('switches to 3D MODEL mode', () => {
        render(<PerceptionLab />);
        const threeDBtn = screen.getByText('3D MODEL');
        fireEvent.click(threeDBtn);
        
        expect(screen.getByTestId('3d-viewer')).toBeInTheDocument();
    });
});
