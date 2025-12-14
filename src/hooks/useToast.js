import { useState, useCallback } from 'react';

let toastId = 0;

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = toastId++;
        const newToast = { id, message, type, duration };

        setToasts((prevToasts) => [...prevToasts, newToast]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, []);

    const success = useCallback((message, duration) => {
        showToast(message, 'success', duration);
    }, [showToast]);

    const error = useCallback((message, duration) => {
        showToast(message, 'error', duration);
    }, [showToast]);

    const warning = useCallback((message, duration) => {
        showToast(message, 'warning', duration);
    }, [showToast]);

    const info = useCallback((message, duration) => {
        showToast(message, 'info', duration);
    }, [showToast]);

    return {
        toasts,
        removeToast,
        showToast,
        success,
        error,
        warning,
        info
    };
}
