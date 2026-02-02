
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { MissionControl } from './components/MissionControl';
import { PerceptionLab } from './components/PerceptionLab';
import { ScadaAnalytics } from './components/ScadaAnalytics';
import { SiteSupervisor } from './components/SiteSupervisor';
import { Configuration } from './components/Configuration';
import { Logistics } from './components/Logistics';
import { SolarPlanner } from './components/SolarPlanner';
import { Login } from './components/Login';
import { View } from './types';
import { authService } from './services/authService';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.MISSION_CONTROL);
    const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true to disable login
    const [isLoading, setIsLoading] = useState(false); // No longer need loading state for auth check

    /* Authentication logic disabled
    useEffect(() => {
        setIsAuthenticated(authService.isAuthenticated());
        setIsLoading(false);
    }, []);
    */

    const renderView = () => {
        switch (currentView) {
            case View.MISSION_CONTROL:
                return <MissionControl />;
            case View.PERCEPTION_LAB:
                return <PerceptionLab />;
            case View.SCADA_ANALYTICS:
                return <ScadaAnalytics />;
            case View.SITE_SUPERVISOR:
                return <SiteSupervisor />;
            case View.LOGISTICS:
                return <Logistics />;
            case View.SOLAR_PLANNER:
                return <SolarPlanner />;
            case View.CONFIGURATION:
                return <Configuration />;
            default:
                return <MissionControl />;
        }
    };

    if (isLoading) return null;

    /* Authentication barrier disabled
    if (!isAuthenticated) {
        return <Login onLogin={() => setIsAuthenticated(true)} />;
    }
    */

    return (
        <Layout currentView={currentView} onNavigate={setCurrentView}>
            {renderView()}
        </Layout>
    );
};

export default App;
