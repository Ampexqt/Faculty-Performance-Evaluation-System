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
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email/School ID is required';
        if (!formData.password) newErrors.password = 'Password is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // Call login API
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Login failed
                setErrors({
                    password: data.message || 'Invalid username or password'
                });
                setIsLoading(false);
                return;
            }

            // Login successful
            if (data.success) {
                // Store user info in localStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('userRole', data.user.role);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('fullName', data.user.full_name);

                // Store additional info based on role
                if (data.user.role === 'Zonal Admin') {
                    localStorage.setItem('username', data.user.username);
                    localStorage.setItem('zone', data.user.zone);
                } else if (data.user.role === 'QCE Manager') {
                    localStorage.setItem('position', data.user.position);
                    localStorage.setItem('collegeId', data.user.college_id);
                    localStorage.setItem('collegeName', data.user.college_name);
                    localStorage.setItem('departmentId', data.user.department_id || '');
                    localStorage.setItem('departmentName', data.user.department_name || '');
                } else if (data.user.role === 'Dean') {
                    localStorage.setItem('position', data.user.position);
                    localStorage.setItem('collegeId', data.user.college_id);
                    localStorage.setItem('collegeName', data.user.college_name);
                } else if (data.user.role === 'Department Chair') {
                    localStorage.setItem('position', data.user.position);
                    localStorage.setItem('collegeId', data.user.college_id);
                    localStorage.setItem('collegeName', data.user.college_name);
                    localStorage.setItem('departmentId', data.user.department_id);
                    localStorage.setItem('departmentName', data.user.department_name);
                } else if (data.user.role === 'Faculty') {
                    localStorage.setItem('position', data.user.position);
                    localStorage.setItem('collegeId', data.user.college_id);
                    localStorage.setItem('collegeName', data.user.college_name);
                    localStorage.setItem('departmentId', data.user.department_id);
                    localStorage.setItem('departmentName', data.user.department_name);
                } else if (data.user.role === 'Student') {
                    localStorage.setItem('collegeId', data.user.college_id);
                    localStorage.setItem('collegeName', data.user.college_name);
                    localStorage.setItem('programId', data.user.program_id);
                    localStorage.setItem('programName', data.user.program_name);
                    localStorage.setItem('section', data.user.section);
                    localStorage.setItem('yearLevel', data.user.year_level);
                    localStorage.setItem('studentId', data.user.student_id);
                }

                // Redirect based on role
                if (data.user.role === 'Zonal Admin') {
                    navigate('/zonal/dashboard');
                } else if (data.user.role === 'QCE Manager') {
                    navigate('/qce/dashboard');
                } else if (data.user.role === 'Dean') {
                    navigate('/dean/overview');
                } else if (data.user.role === 'Department Chair') {
                    navigate('/dept-chair/faculty');
                } else if (data.user.role === 'Faculty') {
                    navigate('/faculty/overview');
                } else if (data.user.role === 'Student') {
                    navigate('/student/dashboard');
                } else {
                    // Default fallback
                    navigate('/dashboard');
                }
            }

        } catch (error) {
            console.error('Login error:', error);
            setErrors({
                password: 'Unable to connect to server. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
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
                            label="Email / School ID"
                            name="email"
                            type="text"
                            placeholder="Enter your email or school ID"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
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
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                            {!isLoading && <ArrowRight size={18} />}
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
                            <strong>Zonal Admin:</strong> admin@faculty.edu / admin123
                        </div>
                        <div className={styles.demoItem}>
                            <strong>QCE Manager:</strong> kyle@gmail.com / password123
                        </div>
                    </div>
                </div>

                <div className={styles.copyright}>
                    © 2025 Zamboanga Peninsula Polytechnic State University
                    <br />
                    Faculty Performance Evaluation System
                </div>
            </div>
        </div>
    );
}
