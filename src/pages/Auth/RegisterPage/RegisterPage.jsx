import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, IdCard } from 'lucide-react';
import { Input } from '@/components/Input/Input';
import { Select } from '@/components/Select/Select';
import { Button } from '@/components/Button/Button';
import styles from './RegisterPage.module.css';

// Mock data - Replace with actual API calls
const DEPARTMENTS = [
    { value: 'ccs', label: 'College of Computer Studies' },
    { value: 'coe', label: 'College of Engineering' },
    { value: 'cba', label: 'College of Business Administration' },
    { value: 'cte', label: 'College of Teacher Education' },
    { value: 'cas', label: 'College of Arts and Sciences' },
];

const PROGRAMS_BY_DEPARTMENT = {
    ccs: [
        { value: 'bsit', label: 'BS Information Technology' },
        { value: 'bscs', label: 'BS Computer Science' },
        { value: 'bsis', label: 'BS Information Systems' },
    ],
    coe: [
        { value: 'bsce', label: 'BS Civil Engineering' },
        { value: 'bsee', label: 'BS Electrical Engineering' },
        { value: 'bsme', label: 'BS Mechanical Engineering' },
    ],
    cba: [
        { value: 'bsba', label: 'BS Business Administration' },
        { value: 'bsaccountancy', label: 'BS Accountancy' },
        { value: 'bshm', label: 'BS Hospitality Management' },
    ],
    cte: [
        { value: 'beed', label: 'Bachelor of Elementary Education' },
        { value: 'bsed', label: 'Bachelor of Secondary Education' },
    ],
    cas: [
        { value: 'bspsych', label: 'BS Psychology' },
        { value: 'ab-english', label: 'AB English' },
        { value: 'ab-polsci', label: 'AB Political Science' },
    ],
};

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

export function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        schoolId: '',
        firstName: '',
        lastName: '',
        middleInitial: '',
        email: '',
        department: '',
        program: '',
        yearLevel: '',
        section: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [availablePrograms, setAvailablePrograms] = useState([]);

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
            setAvailablePrograms(PROGRAMS_BY_DEPARTMENT[value] || []);
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
        } else if (!/^\d{4}-\d{5}$/.test(formData.schoolId)) {
            newErrors.schoolId = 'School ID must be in format: YYYY-NNNNN (e.g., 2023-00123)';
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

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // TODO: Replace with actual API call
        console.log('Registration data:', formData);

        // Mock successful registration
        alert('Registration successful! Please login with your credentials.');
        navigate('/login');
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
                                placeholder="e.g. 2023-00123"
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
                            options={DEPARTMENTS}
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
        </div>
    );
}
