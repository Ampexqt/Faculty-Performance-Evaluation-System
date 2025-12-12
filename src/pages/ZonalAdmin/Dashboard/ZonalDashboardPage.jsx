import React, { useState } from 'react';
import { Building2, Users, GraduationCap, Activity, Edit, Trash2, UserPlus, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { StatCard } from '@/components/StatCard/StatCard';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './ZonalDashboardPage.module.css';

// Mock data
const mockColleges = [
    { id: 1, name: 'College of Engineering', dean: 'Dr. Sarah Smith', facultyCount: 45, status: 'Active' },
    { id: 2, name: 'College of Arts and Sciences', dean: 'Dr. James Wilson', facultyCount: 62, status: 'Active' },
    { id: 3, name: 'College of Education', dean: 'Dr. Maria Garcia', facultyCount: 38, status: 'Active' },
    { id: 4, name: 'College of Technology', dean: 'Dr. Robert Brown', facultyCount: 51, status: 'Active' },
];

export function ZonalDashboardPage() {
    const [colleges] = useState(mockColleges);
    const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
    const [isQCEModalOpen, setIsQCEModalOpen] = useState(false);
    const [collegeFormData, setCollegeFormData] = useState({
        collegeName: '',
        collegeCode: '',
    });
    const [qceFormData, setQCEFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        assignedCollege: '',
        temporaryPassword: '',
    });

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

    const handleCollegeSubmit = (e) => {
        e.preventDefault();
        console.log('Creating college:', collegeFormData);
        setIsCollegeModalOpen(false);
        setCollegeFormData({ collegeName: '', collegeCode: '' });
    };

    const handleQCESubmit = (e) => {
        e.preventDefault();
        console.log('Creating QCE account:', qceFormData);
        setIsQCEModalOpen(false);
        setQCEFormData({ firstName: '', lastName: '', email: '', assignedCollege: '', temporaryPassword: '' });
    };

    const handleCollegeCancel = () => {
        setIsCollegeModalOpen(false);
        setCollegeFormData({ collegeName: '', collegeCode: '' });
    };

    const handleQCECancel = () => {
        setIsQCEModalOpen(false);
        setQCEFormData({ firstName: '', lastName: '', email: '', assignedCollege: '', temporaryPassword: '' });
    };

    const columns = [
        {
            header: 'College Name',
            accessor: 'name',
            width: '35%',
        },
        {
            header: 'Dean',
            accessor: 'dean',
            width: '25%',
        },
        {
            header: 'Faculty Count',
            accessor: 'facultyCount',
            width: '15%',
            align: 'center',
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '15%',
            align: 'center',
            render: (value) => (
                <Badge variant={value === 'Active' ? 'active' : 'inactive'}>
                    {value}
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
                        value={8}
                        subtitle="2 new this year"
                        trendValue="+12%"
                        icon={Building2}
                    />
                    <StatCard
                        title="QCE Accounts"
                        value={12}
                        subtitle="All active"
                        icon={Users}
                    />
                    <StatCard
                        title="Total Faculty"
                        value={342}
                        subtitle="+5% Across all colleges"
                        trendValue="+5%"
                        icon={GraduationCap}
                    />
                    <StatCard
                        title="Active Evaluations"
                        value="1,205"
                        subtitle="+24% Current semester"
                        trendValue="+24%"
                        icon={Activity}
                    />
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Managed Colleges</h2>
                        <Button variant="ghost" size="small">
                            View All
                        </Button>
                    </div>

                    <div className={styles.tableContainer}>
                        <Table columns={columns} data={colleges} />
                    </div>
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
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                            >
                                Create College
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
                                name="assignedCollege"
                                value={qceFormData.assignedCollege}
                                onChange={handleQCEInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select a college</option>
                                <option value="College of Computing Studies">College of Computing Studies</option>
                                <option value="College of Arts and Sciences">College of Arts and Sciences</option>
                                <option value="College of Education">College of Education</option>
                                <option value="College of Technology">College of Technology</option>
                                <option value="College of Marine Engineering">College of Marine Engineering</option>
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
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                            >
                                Create Account
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
