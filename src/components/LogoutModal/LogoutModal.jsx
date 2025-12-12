import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import styles from './LogoutModal.module.css';

export function LogoutModal({ isOpen, onClose, onConfirm, userName }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Confirm Logout"
        >
            <div className={styles.content}>
                <div className={styles.iconContainer}>
                    <LogOut size={48} className={styles.icon} />
                </div>

                <div className={styles.message}>
                    <h3 className={styles.messageTitle}>Are you sure you want to logout?</h3>
                    <p className={styles.messageText}>
                        {userName ? `You will be logged out as ${userName}.` : 'You will be logged out of your account.'}
                    </p>
                </div>

                <div className={styles.actions}>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className={styles.cancelButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={onConfirm}
                        className={styles.logoutButton}
                    >
                        <LogOut size={18} />
                        Logout
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
