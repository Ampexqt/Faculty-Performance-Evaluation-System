import React, { useState, useEffect } from 'react';
import { Users, ClipboardList, BookOpen } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { StatCard } from '@/components/StatCard/StatCard';
import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import { ToastContainer } from '@/components/Toast/Toast';
import styles from './DeanOverviewPage.module.css';

export function DeanOverviewPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '',
        middleInitial: '',
        lastName: '',
        email: '',
        password: '',
        gender: '',
    });

    // Get user info from sessionStorage
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        collegeName: '',
    });

    useEffect(() => {
        const fullName = sessionStorage.getItem('fullName') || 'College Dean';
        const collegeName = sessionStorage.getItem('collegeName') || 'Not Assigned';
        const userId = sessionStorage.getItem('userId');
        const collegeId = sessionStorage.getItem('collegeId');
        setUserInfo({ fullName, collegeName, collegeId });
    }, []);

    // State for dashboard stats
    const [stats, setStats] = useState({
        totalFaculty: 0,
        totalPrograms: 0,
        totalEvaluations: 0
    });

    useEffect(() => {
        if (userInfo.collegeId) {
            fetchStats();
        }
    }, [userInfo.collegeId]);

    const fetchStats = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/stats?college_id=${userInfo.collegeId}`);
            const data = await response.json();

            if (data.success) {
                setStats({
                    totalFaculty: data.data.totalFaculty,
                    totalPrograms: data.data.totalPrograms,
                    totalEvaluations: data.data.activeEvaluations || 0 // Handle undefined/null
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };

    // Toast notification helpers
    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, duration: 3000 }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userId = sessionStorage.getItem('userId');

            const response = await fetch('http://localhost:5000/api/qce/faculty', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    middleInitial: formData.middleInitial,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    gender: formData.gender,
                    // departmentId removed as per request
                    role: 'Department Chair',
                    employmentStatus: 'Regular', // Default for Dept Chair
                    qceId: userId,
                    creatorType: 'faculty' // Specify this is a Dean (Faculty) creating the user
                }),
            });

            const result = await response.json();

            if (result.success) {
                addToast('Department Chair assigned successfully', 'success');
                setIsModalOpen(false);
                setFormData({
                    firstName: '',
                    middleInitial: '',
                    lastName: '',
                    email: '',
                    password: '',
                    gender: '',
                });
            } else {
                addToast(result.message || 'Failed to create account', 'error');
            }
        } catch (error) {
            console.error('Error creating chair:', error);
            addToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({
            firstName: '',
            middleInitial: '',
            lastName: '',
            email: '',
            password: '',
            gender: '',
        });
    };

    const [activeYear, setActiveYear] = useState(null);

    useEffect(() => {
        const fetchActiveYear = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/zonal/academic-years/active');
                const data = await response.json();
                if (data.success && data.data) {
                    setActiveYear(data.data);
                }
            } catch (error) {
                console.error('Error fetching active academic year:', error);
            }
        };
        fetchActiveYear();

        // ... previous logic
    }, []);

    // ... (rest of input handling)

    return (
        <DashboardLayout
            role="College Dean"
            userName={userInfo.fullName}
            notificationCount={3}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Department Overview</h1>
                        <p className={styles.subtitle}>
                            <span style={{ fontWeight: '700', color: '#800000', fontSize: '1.1em' }}>
                                {userInfo.collegeName}
                            </span>
                            <span style={{ color: '#6b7280' }}> • Overview of faculty performance within your college.</span>
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {activeYear && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#F3F4F6',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                color: '#374151',
                                border: '1px solid #E5E7EB'
                            }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: '#F59E0B', // Gold/Amber dot
                                    boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.2)'
                                }} />
                                <span style={{ fontWeight: 500 }}>
                                    A.Y. {activeYear.year_label} - {activeYear.semester}
                                </span>
                            </div>
                        )}
                        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                            + Assign Dept. Chair
                        </Button>
                    </div>
                </div>

                <div className={styles.stats}>
                    <StatCard
                        title="Total Faculty"
                        value={stats.totalFaculty}
                        subtitle="Within department"
                        icon={Users}
                    />
                    <StatCard
                        title="Evaluations"
                        value={stats.totalEvaluations}
                        subtitle="Completed this semester"
                        icon={ClipboardList}
                        trend={{ value: 0, label: 'vs last semester' }}
                    />
                    <StatCard
                        title="Programs"
                        value={stats.totalPrograms}
                        subtitle="Active programs"
                        icon={BookOpen}
                    />
                </div>

                {/* Assign Department Chair Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Assign Department Chair"
                >
                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        <div className={styles.formRow}>
                            <Input
                                label="First Name"
                                name="firstName"
                                type="text"
                                placeholder="e.g. John"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                label="M.I."
                                name="middleInitial"
                                type="text"
                                placeholder="A"
                                value={formData.middleInitial}
                                onChange={handleInputChange}
                                maxLength="2"
                            />
                            <Input
                                label="Last Name"
                                name="lastName"
                                type="text"
                                placeholder="e.g. Doe"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className={styles.formRow}>
                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                placeholder="john.doe@university.edu"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    Gender <span style={{ color: '#DC2626' }}>*</span>
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                    className={styles.select}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>



                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                            >
                                Assign Chair
                            </Button>
                        </div>
                    </form>
                </Modal>

                <ToastContainer toasts={toasts} removeToast={removeToast} />
            </div>
        </DashboardLayout>
    );
}
