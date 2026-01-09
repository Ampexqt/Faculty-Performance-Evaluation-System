import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle, Lock } from 'lucide-react';
import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import styles from './ForgotPasswordPage.module.css';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        if (!newPassword || !confirmPassword) {
            setError('Please fill in all password fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, newPassword }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage(data.message || 'Password reset successfully!');
            } else {
                setError(data.message || 'Failed to process request. Please check if the email is correct.');
            }
        } catch (err) {
            console.error('Password reset error:', err);
            setError('An error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Reset Password</h1>
                    <p className={styles.subtitle}>
                        Enter your email address and create a new password.
                    </p>

                    {successMessage ? (
                        <div className={styles.successMessage}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                                <CheckCircle size={32} />
                            </div>
                            <p>{successMessage}</p>
                            <div style={{ marginTop: '1rem' }}>
                                <Link to="/login" className={styles.link} style={{ justifyContent: 'center' }}>
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={error && !email ? 'Email is required' : ''}
                                icon={Mail}
                                required
                            />

                            <Input
                                label="New Password"
                                name="newPassword"
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                icon={Lock}
                                required
                            />

                            <Input
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                icon={Lock}
                                required
                            />

                            {error && <div style={{ color: '#dc2626', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

                            <Button
                                type="submit"
                                variant="primary"
                                size="large"
                                disabled={isLoading}
                                className={styles.submitButton}
                            >
                                {isLoading ? 'Updating...' : 'Update Password'}
                                {!isLoading && <ArrowRight size={18} />}
                            </Button>
                        </form>
                    )}

                    {!successMessage && (
                        <div className={styles.backLink}>
                            <Link to="/login" className={styles.link}>
                                <ArrowLeft size={16} />
                                Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
