import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import styles from './Modal.module.css';

export function Modal({
    isOpen = false,
    onClose,
    title,
    children,
    className,
    ...props
}) {
    // Close modal on ESC key press
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={cn(styles.modal, className)}
                onClick={(e) => e.stopPropagation()}
                {...props}
            >
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
}
