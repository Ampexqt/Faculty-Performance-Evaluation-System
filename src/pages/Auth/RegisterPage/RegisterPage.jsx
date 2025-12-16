import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, IdCard } from 'lucide-react';
import { Input } from '@/components/Input/Input';
import { Select } from '@/components/Select/Select';
import { Button } from '@/components/Button/Button';
import { useToast } from '@/hooks/useToast';
import styles from './RegisterPage.module.css';

// Mock data - Replace with actual API calls
// Mock data - Replace with actual API calls
// const DEPARTMENTS = [];
// const PROGRAMS_BY_DEPARTMENT = {};

const YEAR_LEVELS = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
];

const SECTIONS = [
    { value: 'A', label: 'Section A' },
    { value: 'B', label: 'Section B' },
    { value: 'C', label: 'Section C' },
    { value: 'D', label: 'Section D' },
    { value: 'E', label: 'Section E' },
    { value: 'F', label: 'Section F' },
    { value: 'G', label: 'Section G' },
    { value: 'H', label: 'Section H' },
];

const SEX_OPTIONS = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
];

import { ToastContainer } from '@/components/Toast/Toast';

export function RegisterPage() {
    const navigate = useNavigate();
    const { toasts, removeToast, success, error } = useToast(); // Destructure directly

    // Create a toast object wrapper to maintain existing calls like toast.success()
    const toast = { success, error };

    const [formData, setFormData] = useState({
        schoolId: '',
        firstName: '',
        lastName: '',
        middleInitial: '',
        sex: '',
        email: '',
        department: '',
        program: '',
        yearLevel: '',
        section: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [departments, setDepartments] = useState([]);
    const [availablePrograms, setAvailablePrograms] = useState([]);

    // Fetch colleges (departments) on mount
    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/zonal/colleges');
                const data = await response.json();
                if (data.success) {
                    setDepartments(data.data.map(college => ({
                        value: college.id,
                        label: college.college_name
                    })));
                } else {
                    console.error('Failed to fetch colleges:', data.message);
                }
            } catch (error) {
                console.error('Error fetching colleges:', error);
            }
        };

        fetchColleges();
    }, []);

    // Fetch programs when department (college) changes
    useEffect(() => {
        const fetchPrograms = async () => {
            if (!formData.department) {
                setAvailablePrograms([]);
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/api/qce/programs?college_id=${formData.department}`);
                const data = await response.json();
                if (data.success) {
                    setAvailablePrograms(data.data.map(program => ({
                        value: program.id,
                        label: program.name
                    })));
                } else {
                    console.error('Failed to fetch programs:', data.message);
                    setAvailablePrograms([]);
                }
            } catch (error) {
                console.error('Error fetching programs:', error);
                setAvailablePrograms([]);
            }
        };

        fetchPrograms();
    }, [formData.department]);

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

        // Update available programs when department changes
        if (name === 'department') {
            // Programs will be fetched by the useEffect hook
            setFormData(prev => ({
                ...prev,
                program: '' // Reset program when department changes
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // School ID validation
        if (!formData.schoolId) {
            newErrors.schoolId = 'School ID is required';
        } else if (!/^\d{7}$/.test(formData.schoolId)) {
            newErrors.schoolId = 'School ID must be 7 numbers (e.g. 2365335)';
        }

        // First Name validation
        if (!formData.firstName) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.trim().length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        }

        // Last Name validation
        if (!formData.lastName) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.trim().length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        }

        // Middle Initial validation (optional but if provided, must be 1 character)
        if (formData.middleInitial && formData.middleInitial.length > 1) {
            newErrors.middleInitial = 'Middle initial should be 1 character only';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Department validation
        if (!formData.department) {
            newErrors.department = 'Department is required';
        }

        // Program validation
        if (!formData.program) {
            newErrors.program = 'Program is required';
        }

        // Year Level validation
        if (!formData.yearLevel) {
            newErrors.yearLevel = 'Year level is required';
        }

        // Section validation
        if (!formData.section) {
            newErrors.section = 'Section is required';
        }

        // Sex validation
        if (!formData.sex) {
            newErrors.sex = 'Sex is required';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        // Confirm Password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Registration successful! Please login with your credentials.');
                // Add a small delay so user can see the toast before navigating
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setErrors(prev => ({
                    ...prev,
                    submit: data.message || 'Registration failed'
                }));
                // Show error as toast if it's a general error
                if (!data.message.includes('School ID') && !data.message.includes('Email')) {
                    toast.error(data.message || 'Registration failed');
                } else if (data.message.includes('Student with this School ID or Email already exists')) {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('An error occurred during registration. Please try again.');
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <Link to="/login" className={styles.backButton}>
                            <ArrowLeft size={20} />
                        </Link>
                        <div className={styles.headerContent}>
                            <h2 className={styles.title}>Student Registration</h2>
                            <p className={styles.subtitle}>
                                Create your account to participate in faculty evaluations.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formRow}>
                            <Input
                                label="School ID"
                                name="schoolId"
                                type="text"
                                placeholder="e.g. 2365335"
                                value={formData.schoolId}
                                onChange={handleChange}
                                error={errors.schoolId}
                                icon={IdCard}
                                required
                            />

                            <Input
                                label="First Name"
                                name="firstName"
                                type="text"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                error={errors.firstName}
                                icon={User}
                                required
                            />
                        </div>

                        <div className={styles.formRow}>
                            <Input
                                label="Last Name"
                                name="lastName"
                                type="text"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                error={errors.lastName}
                                icon={User}
                                required
                            />

                            <Input
                                label="Middle Initial"
                                name="middleInitial"
                                type="text"
                                placeholder="M.I."
                                maxLength={1}
                                value={formData.middleInitial}
                                onChange={handleChange}
                                error={errors.middleInitial}
                                icon={User}
                            />
                        </div>

                        <Select
                            label="Sex"
                            name="sex"
                            placeholder="Select sex"
                            value={formData.sex}
                            onChange={handleChange}
                            options={SEX_OPTIONS}
                            error={errors.sex}
                            required
                        />

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            icon={Mail}
                            required
                        />

                        <Select
                            label="Department"
                            name="department"
                            placeholder="Select your department"
                            value={formData.department}
                            onChange={handleChange}
                            options={departments}
                            error={errors.department}
                            required
                        />

                        <Select
                            label="Program"
                            name="program"
                            placeholder="Select your program"
                            value={formData.program}
                            onChange={handleChange}
                            options={availablePrograms}
                            error={errors.program}
                            disabled={!formData.department}
                            required
                        />

                        <div className={styles.formRow}>
                            <Select
                                label="Year Level"
                                name="yearLevel"
                                placeholder="Select year level"
                                value={formData.yearLevel}
                                onChange={handleChange}
                                options={YEAR_LEVELS}
                                error={errors.yearLevel}
                                required
                            />

                            <Select
                                label="Section"
                                name="section"
                                placeholder="Select section"
                                value={formData.section}
                                onChange={handleChange}
                                options={SECTIONS}
                                error={errors.section}
                                required
                            />
                        </div>

                        <div className={styles.formRow}>
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="Create password"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                icon={Lock}
                                required
                            />

                            <Input
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={errors.confirmPassword}
                                icon={Lock}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="large"
                            className={styles.submitButton}
                        >
                            Register Account
                        </Button>
                    </form>

                    <div className={styles.footer}>
                        <p className={styles.footerText}>
                            Already have an account?{' '}
                            <Link to="/login" className={styles.link}>
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
}
