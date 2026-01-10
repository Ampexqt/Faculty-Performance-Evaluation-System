import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Inactivity Timer
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 15 minutes
    // Store timer ref inside a state or ref is not enough due to closures?
    // Using a simple variable outside effect might be tricky.
    // Better to use useRef for the timer.
    // But since `resetInactivityTimer` needs to call `logout`, which depends on `navigate`, it should be inside component.

    // We'll use a ref for the timer ID
    const timerRef = React.useRef(null);

    const logout = () => {
        sessionStorage.clear();
        setUser(null);
        navigate('/login');
    };

    const resetInactivityTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (user) {
            timerRef.current = setTimeout(() => {
                console.log('User inactive, logging out...');
                logout();
            }, INACTIVITY_LIMIT);
        }
    };

    useEffect(() => {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

        let lastActivityTime = Date.now();
        const THROTTLE_MS = 1000;

        const handleActivity = () => {
            const now = Date.now();
            if (now - lastActivityTime > THROTTLE_MS) {
                resetInactivityTimer();
                lastActivityTime = now;
            }
        };

        if (user) {
            // Add event listeners
            events.forEach(event => window.addEventListener(event, handleActivity));
            resetInactivityTimer(); // Start timer
        }

        return () => {
            // Remove event listeners
            events.forEach(event => window.removeEventListener(event, handleActivity));
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [user]);

    // Check for existing session on mount
    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from session storage", e);
                sessionStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        // We rely on the caller (LoginPage) to set other sessionStorage items if needed,
        // or we can expect them to be set before calling this.
        // But for `user`, we handle it here.
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const value = {
        user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
