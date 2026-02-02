
// Simulated Auth Service
const TOKEN_KEY = 'aether_auth_token';
const USER_KEY = 'aether_user';

export const authService = {
    login: async (password: string) => {
        /* Disabled logic
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (password === 'gemini2026') { // Hardcoded for demo
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-token';
            const user = { name: 'Cmdr. J. Vance', role: 'ORCHESTRATOR LVL 4' };
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            return user;
        }
        throw new Error('Invalid credentials');
        */
        return { name: 'Cmdr. J. Vance', role: 'ORCHESTRATOR LVL 4' };
    },

    logout: () => {
        /* Disabled logic
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        */
    },

    isAuthenticated: () => {
        /* Disabled logic
        return !!localStorage.getItem(TOKEN_KEY);
        */
        return true;
    },

    getUser: () => {
        /* Disabled logic
        const u = localStorage.getItem(USER_KEY);
        return u ? JSON.parse(u) : null;
        */
        return { name: 'Cmdr. J. Vance', role: 'ORCHESTRATOR LVL 4' };
    }
};
