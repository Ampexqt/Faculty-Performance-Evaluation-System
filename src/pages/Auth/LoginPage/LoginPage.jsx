import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import zppsuLogo from '@/assets/ZPPSU-LOGO.jpg';
import styles from './LoginPage.module.css';

import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
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
                // Call context login to set state and timer
                login(data.user);

                // Store user info in sessionStorage
                // session storage is also set by login(), but we need to set the extensive list below
                // Since login() sets 'user', we can rely on that, but the code below sets many individual items
                // explicitly used by legacy code. We keep them as is (now using sessionStorage).

                sessionStorage.setItem('user', JSON.stringify(data.user));
                sessionStorage.setItem('userRole', data.user.role);
                sessionStorage.setItem('userId', data.user.id);
                sessionStorage.setItem('userEmail', data.user.email);
                sessionStorage.setItem('fullName', data.user.full_name);

                // Store additional info based on role
                if (data.user.role === 'Zonal Admin') {
                    sessionStorage.setItem('username', data.user.username);
                    sessionStorage.setItem('zone', data.user.zone);
                } else if (data.user.role === 'QCE Manager') {
                    sessionStorage.setItem('position', data.user.position);
                    sessionStorage.setItem('collegeId', data.user.college_id);
                    sessionStorage.setItem('collegeName', data.user.college_name);
                    sessionStorage.setItem('departmentId', data.user.department_id || '');
                    sessionStorage.setItem('departmentName', data.user.department_name || '');
                } else if (data.user.role === 'Dean') {
                    sessionStorage.setItem('position', data.user.position);
                    sessionStorage.setItem('collegeId', data.user.college_id);
                    sessionStorage.setItem('collegeName', data.user.college_name);
                } else if (data.user.role === 'Department Chair') {
                    sessionStorage.setItem('position', data.user.position);
                    sessionStorage.setItem('collegeId', data.user.college_id);
                    sessionStorage.setItem('collegeName', data.user.college_name);
                    sessionStorage.setItem('departmentId', data.user.department_id || '');
                    sessionStorage.setItem('departmentName', data.user.department_name);
                } else if (data.user.role === 'Faculty') {
                    sessionStorage.setItem('position', data.user.position);
                    sessionStorage.setItem('collegeId', data.user.college_id);
                    sessionStorage.setItem('collegeName', data.user.college_name);
                    sessionStorage.setItem('departmentId', data.user.department_id || '');
                    sessionStorage.setItem('departmentName', data.user.department_name);
                } else if (data.user.role === 'Student') {
                    sessionStorage.setItem('collegeId', data.user.college_id);
                    sessionStorage.setItem('collegeName', data.user.college_name);
                    sessionStorage.setItem('programId', data.user.program_id);
                    sessionStorage.setItem('programName', data.user.program_name);
                    sessionStorage.setItem('section', data.user.section);
                    sessionStorage.setItem('yearLevel', data.user.year_level);
                    sessionStorage.setItem('studentId', data.user.student_id);
                } else if (data.user.role === 'President' || data.user.role === 'VPAA') {
                    sessionStorage.setItem('position', data.user.position);
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
                } else if (data.user.role === 'President') {
                    navigate('/president/dashboard');
                } else if (data.user.role === 'VPAA') {
                    navigate('/vpaa/dashboard');
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



                <div className={styles.copyright}>
                    © 2025 Zamboanga Peninsula Polytechnic State University
                    <br />
                    Faculty Performance Evaluation System
                </div>
            </div>
        </div>
    );
}
