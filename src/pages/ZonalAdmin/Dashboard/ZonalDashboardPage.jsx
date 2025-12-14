import React, { useState, useEffect } from 'react';
import { Building2, Users, GraduationCap, Activity, Edit, Trash2, UserPlus, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { StatCard } from '@/components/StatCard/StatCard';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './ZonalDashboardPage.module.css';

export function ZonalDashboardPage() {
    const [stats, setStats] = useState({
        totalColleges: 0,
        qceAccounts: 0,
        totalFaculty: 0,
        activeEvaluations: 0,
        newCollegesThisYear: 0
    });
    const [colleges, setColleges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal states
    const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
    const [isQCEModalOpen, setIsQCEModalOpen] = useState(false);

    // Form states
    const [collegeFormData, setCollegeFormData] = useState({
        collegeName: '',
        collegeCode: '',
    });
    const [qceFormData, setQCEFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        collegeId: '',
        temporaryPassword: '',
    });

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            // Only set loading on initial load, not refreshes
            if (stats.totalColleges === 0) setIsLoading(true);

            // Fetch stats
            const statsRes = await fetch('http://localhost:5000/api/zonal/dashboard/stats');
            const statsData = await statsRes.json();

            if (statsData.success) {
                setStats(statsData.data);
            }

            // Fetch colleges
            const collegesRes = await fetch('http://localhost:5000/api/zonal/dashboard/colleges');
            const collegesData = await collegesRes.json();

            if (collegesData.success) {
                setColleges(collegesData.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleCollegeInputChange = (e) => {
        const { name, value } = e.target;
        setCollegeFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleQCEInputChange = (e) => {
        const { name, value } = e.target;
        setQCEFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCollegeSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:5000/api/zonal/colleges', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    college_name: collegeFormData.collegeName,
                    college_code: collegeFormData.collegeCode,
                    dean_id: null,
                    faculty_count: 0
                }),
            });

            const data = await response.json();

            if (data.success) {
                await fetchDashboardData(); // Refresh stats and table
                setIsCollegeModalOpen(false);
                setCollegeFormData({ collegeName: '', collegeCode: '' });
                // Optional: Add success toast/alert here
            } else {
                alert(data.message || 'Error creating college');
            }
        } catch (error) {
            console.error('Error creating college:', error);
            alert('Server error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQCESubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:5000/api/zonal/qce', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(qceFormData),
            });

            const data = await response.json();

            if (data.success) {
                await fetchDashboardData(); // Refresh stats to show new count
                setIsQCEModalOpen(false);
                setQCEFormData({ firstName: '', lastName: '', email: '', collegeId: '', temporaryPassword: '' });
            } else {
                alert(data.message || 'Error creating QCE account');
            }
        } catch (error) {
            console.error('Error creating QCE account:', error);
            alert('Server error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCollegeCancel = () => {
        setIsCollegeModalOpen(false);
        setCollegeFormData({ collegeName: '', collegeCode: '' });
    };

    const handleQCECancel = () => {
        setIsQCEModalOpen(false);
        setQCEFormData({ firstName: '', lastName: '', email: '', collegeId: '', temporaryPassword: '' });
    };

    const columns = [
        {
            header: 'College Name',
            accessor: 'college_name',
            width: '35%',
        },
        {
            header: 'Dean',
            accessor: 'dean_name',
            width: '25%',
            render: (value) => value || <span className="text-gray-400 italic">Not Assigned</span>
        },
        {
            header: 'Faculty Count',
            accessor: 'faculty_count',
            width: '15%',
            align: 'center',
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '15%',
            align: 'center',
            render: (value) => (
                <Badge variant={value === 'active' ? 'active' : 'inactive'}>
                    {value === 'active' ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '10%',
            align: 'center',
            render: (_, row) => (
                <div className={styles.actions}>
                    <button className={styles.actionButton} aria-label="Edit">
                        <Edit size={16} />
                    </button>
                    <button className={styles.actionButton} aria-label="Delete">
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <DashboardLayout role="Zonal Admin" userName="Zonal Admin">
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            role="Zonal Admin"
            userName="Zonal Admin"
            notificationCount={3}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Dashboard Overview</h1>
                        <p className={styles.subtitle}>Welcome back, Administrator. Here's what's happening today.</p>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.qceButton} onClick={() => setIsQCEModalOpen(true)}>
                            <UserPlus size={18} />
                            New QCE Account
                        </button>
                        <button className={styles.createButton} onClick={() => setIsCollegeModalOpen(true)}>
                            <Plus size={18} />
                            Create College
                        </button>
                    </div>
                </div>

                <div className={styles.stats}>
                    <StatCard
                        title="Total Colleges"
                        value={stats.totalColleges}
                        subtitle={`${stats.newCollegesThisYear} new this year`}
                        trendValue={stats.newCollegesThisYear > 0 ? `+${stats.newCollegesThisYear}` : null}
                        icon={Building2}
                    />
                    <StatCard
                        title="QCE Accounts"
                        value={stats.qceAccounts}
                        subtitle="All active"
                        icon={Users}
                    />
                    <StatCard
                        title="Total Faculty"
                        value={stats.totalFaculty}
                        subtitle="Across all colleges"
                        icon={GraduationCap}
                    />
                    <StatCard
                        title="Active Evaluations"
                        value={stats.activeEvaluations}
                        subtitle="Current semester"
                        icon={Activity}
                    />
                </div>

                {/* Create College Modal */}
                <Modal
                    isOpen={isCollegeModalOpen}
                    onClose={handleCollegeCancel}
                    title="Create New College"
                >
                    <form onSubmit={handleCollegeSubmit} className={styles.modalForm}>
                        <Input
                            label="College Name"
                            name="collegeName"
                            type="text"
                            placeholder="e.g. College of Computing Studies"
                            value={collegeFormData.collegeName}
                            onChange={handleCollegeInputChange}
                            required
                        />

                        <Input
                            label="College Code"
                            name="collegeCode"
                            type="text"
                            placeholder="e.g. CCS"
                            value={collegeFormData.collegeCode}
                            onChange={handleCollegeInputChange}
                            required
                        />

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleCollegeCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating...' : 'Create College'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Create QCE Account Modal */}
                <Modal
                    isOpen={isQCEModalOpen}
                    onClose={handleQCECancel}
                    title="Create QCE Account"
                >
                    <form onSubmit={handleQCESubmit} className={styles.modalForm}>
                        <Input
                            label="First Name"
                            name="firstName"
                            type="text"
                            placeholder="e.g. John"
                            value={qceFormData.firstName}
                            onChange={handleQCEInputChange}
                            required
                        />

                        <Input
                            label="Last Name"
                            name="lastName"
                            type="text"
                            placeholder="e.g. Doe"
                            value={qceFormData.lastName}
                            onChange={handleQCEInputChange}
                            required
                        />


                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="john@university.edu"
                            value={qceFormData.email}
                            onChange={handleQCEInputChange}
                            required
                        />

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Assigned College<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="collegeId"
                                value={qceFormData.collegeId}
                                onChange={handleQCEInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select a college</option>
                                {colleges.map(college => (
                                    <option key={college.id} value={college.id}>
                                        {college.college_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Temporary Password"
                            name="temporaryPassword"
                            type="password"
                            placeholder="••••••••"
                            value={qceFormData.temporaryPassword}
                            onChange={handleQCEInputChange}
                            required
                        />

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleQCECancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
