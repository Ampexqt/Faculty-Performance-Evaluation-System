import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import styles from './Toast.module.css';

export function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        warning: <AlertCircle size={20} />,
        info: <AlertCircle size={20} />
    };

    return (
        <div className={`${styles.toast} ${styles[type]}`}>
            <div className={styles.icon}>
                {icons[type]}
            </div>
            <div className={styles.message}>
                {message}
            </div>
            <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                <X size={16} />
            </button>
        </div>
    );
}

export function ToastContainer({ toasts, removeToast }) {
    return (
        <div className={styles.toastContainer}>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                    duration={toast.duration}
                />
            ))}
        </div>
    );
}
