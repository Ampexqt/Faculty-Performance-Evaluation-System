import React, { useState, useEffect } from 'react';
import { Users, BookOpen, ClipboardList, UserPlus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { StatCard } from '@/components/StatCard/StatCard';
import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './DeptChairDashboardPage.module.css';

export function DeptChairDashboardPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stats, setStats] = useState({
        totalFaculty: 0,
        activeSubjects: 0,
        activeEvaluations: 0
    });
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        departmentId: null,
        departmentName: '',
        collegeName: ''
    });
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        employmentStatus: '',
        facultyRole: '',
        password: '',
    });

    useEffect(() => {
        const fullName = localStorage.getItem('fullName') || 'Department Chair';
        const departmentId = localStorage.getItem('departmentId');
        const departmentName = localStorage.getItem('departmentName') || 'Department';
        const collegeName = localStorage.getItem('collegeName') || 'College';
        setUserInfo({ fullName, departmentId, departmentName, collegeName });
    }, []);

    useEffect(() => {
        if (userInfo.departmentId) {
            fetchStats();
        }
    }, [userInfo.departmentId]);

    const fetchStats = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/stats?department_id=${userInfo.departmentId}`);
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Adding Faculty:', formData);
        setIsModalOpen(false);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            gender: '',
            employmentStatus: '',
            facultyRole: '',
            password: '',
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            gender: '',
            employmentStatus: '',
            facultyRole: '',
            password: '',
        });
    };

    return (
        <DashboardLayout
            role="Dept. Chair"
            userName={userInfo.fullName}
            notificationCount={2}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Department Management</h1>
                        <p className={styles.subtitle}>
                            <span style={{ fontWeight: '700', color: '#800000', fontSize: '1.1em' }}>
                                {userInfo.collegeName}
                            </span>
                            <span style={{ color: '#6b7280' }}> • Overview of faculty performance</span>
                        </p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <UserPlus size={18} />
                        Add Faculty
                    </Button>
                </div>

                <div className={styles.stats}>
                    <StatCard
                        title="Subjects Managed"
                        value={stats.activeSubjects}
                        subtitle="Active this semester"
                        icon={BookOpen}
                    />
                    <StatCard
                        title="Faculty Under Chair"
                        value={stats.totalFaculty}
                        subtitle="Regular & Part-time"
                        icon={Users}
                    />
                    <StatCard
                        title="Active Evaluations"
                        value={stats.activeEvaluations}
                        subtitle="Pending completion"
                        icon={ClipboardList}
                    />
                </div>

                {/* Add Faculty Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Add Faculty"
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
                                label="Last Name"
                                name="lastName"
                                type="text"
                                placeholder="e.g. Doe"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="john.doe@university.edu"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Gender <span className={styles.required}>*</span>
                            </label>
                            <select
                                name="gender"
                                className={styles.select}
                                value={formData.gender}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Employment Status <span className={styles.required}>*</span>
                            </label>
                            <select
                                name="employmentStatus"
                                className={styles.select}
                                value={formData.employmentStatus}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Status</option>
                                <option value="Regular">Regular</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Faculty Role <span className={styles.required}>*</span>
                            </label>
                            <select
                                name="facultyRole"
                                className={styles.select}
                                value={formData.facultyRole}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Role</option>
                                <option value="Professor">Professor</option>
                                <option value="Associate Professor">Associate Professor</option>
                                <option value="Assistant Professor">Assistant Professor</option>
                                <option value="Instructor">Instructor</option>
                                <option value="Visiting Lecturer">Visiting Lecturer</option>
                            </select>
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
                                Add Faculty
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
