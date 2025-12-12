import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import zppsuLogo from '@/assets/ZPPSU-LOGO.jpg';
import styles from './LoginPage.module.css';

export function LoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        const newErrors = {};
        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.password) newErrors.password = 'Password is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Mock credentials for different roles
        const credentials = {
            // Zonal Admin
            'admin': { password: 'admin123', role: 'Zonal Admin', redirect: '/zonal/dashboard' },

            // QCE Manager
            'qce': { password: 'qce123', role: 'QCE Manager', redirect: '/qce/dashboard' },

            // College Dean
            'dean': { password: 'dean123', role: 'College Dean', redirect: '/dean/overview' },

            // Department Chair
            'chair': { password: 'chair123', role: 'Dept. Chair', redirect: '/dept-chair/faculty' },

            // Faculty
            'faculty': { password: 'faculty123', role: 'Faculty', redirect: '/faculty/subjects' },

            // Student
            'student': { password: 'student123', role: 'Student', redirect: '/student/evaluations' },
        };

        // Check credentials
        const user = credentials[formData.username.toLowerCase()];

        if (!user) {
            setErrors({ username: 'Invalid username' });
            return;
        }

        if (user.password !== formData.password) {
            setErrors({ password: 'Invalid password' });
            return;
        }

        // Store user info in localStorage (for demo purposes)
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('username', formData.username);

        // Redirect to appropriate dashboard
        navigate(user.redirect);
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.logoSection}>
                    <div className={styles.logo}>
                        <img src={zppsuLogo} alt="ZPPSU Logo" className={styles.logoImage} />
                    </div>
                    <h1 className={styles.title}>Faculty Performance Evaluation System</h1>
                    <p className={styles.subtitle}>Sign in to your account to continue</p>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Welcome Back</h2>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <Input
                            label="Username"
                            name="username"
                            type="text"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleChange}
                            error={errors.username}
                            icon={User}
                            required
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            icon={Lock}
                            required
                        />

                        <div className={styles.forgotPassword}>
                            <Link to="/forgot-password" className={styles.link}>
                                Forgot Password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="large"
                            className={styles.submitButton}
                        >
                            Sign In
                            <ArrowRight size={18} />
                        </Button>
                    </form>

                    <div className={styles.footer}>
                        <p className={styles.footerText}>
                            Don't have an account?{' '}
                            <Link to="/register" className={styles.link}>
                                Register as Student
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Demo Credentials Hint */}
                <div className={styles.demoHint}>
                    <p className={styles.demoTitle}>🔐 Demo Credentials</p>
                    <div className={styles.demoGrid}>
                        <div className={styles.demoItem}>
                            <strong>Admin:</strong> admin / admin123
                        </div>
                        <div className={styles.demoItem}>
                            <strong>QCE:</strong> qce / qce123
                        </div>
                        <div className={styles.demoItem}>
                            <strong>Dean:</strong> dean / dean123
                        </div>
                        <div className={styles.demoItem}>
                            <strong>Chair:</strong> chair / chair123
                        </div>
                        <div className={styles.demoItem}>
                            <strong>Faculty:</strong> faculty / faculty123
                        </div>
                        <div className={styles.demoItem}>
                            <strong>Student:</strong> student / student123
                        </div>
                    </div>
                </div>

                <div className={styles.copyright}>
                    © 2024 Zamboanga Peninsula Polytechnic State University
                    <br />
                    Faculty Performance Evaluation System
                </div>
            </div>
        </div>
    );
}
