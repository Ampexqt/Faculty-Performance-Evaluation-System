import React, { useState } from 'react';
import { Users, Briefcase, ClipboardList, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { StatCard } from '@/components/StatCard/StatCard';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './DeanOverviewPage.module.css';

// Mock data
const mockFacultyEvaluations = [
    {
        id: 1,
        facultyName: 'Prof. Alan Turing',
        department: 'Computer Science',
        averageScore: 4.85,
        rating: 'Excellent'
    },
    {
        id: 2,
        facultyName: 'Prof. Ada Lovelace',
        department: 'Information Tech',
        averageScore: 4.92,
        rating: 'Excellent'
    },
    {
        id: 3,
        facultyName: 'Prof. Grace Hopper',
        department: 'Computer Science',
        averageScore: 4.75,
        rating: 'Very Good'
    },
];

export function DeanOverviewPage() {
    const [evaluations] = useState(mockFacultyEvaluations);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Assigning Department Chair:', formData);
        setIsModalOpen(false);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
        });
    };

    const getRatingVariant = (rating) => {
        if (rating === 'Excellent') return 'success';
        if (rating === 'Very Good') return 'active';
        return 'warning';
    };

    const columns = [
        {
            header: 'Faculty Name',
            accessor: 'facultyName',
            width: '30%',
        },
        {
            header: 'Department',
            accessor: 'department',
            width: '25%',
        },
        {
            header: 'Average Score',
            accessor: 'averageScore',
            width: '20%',
            align: 'center',
            render: (value) => (
                <span className={styles.score}>{value}</span>
            ),
        },
        {
            header: 'Rating',
            accessor: 'rating',
            width: '15%',
            align: 'center',
            render: (value) => (
                <Badge variant={getRatingVariant(value)}>
                    {value}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '10%',
            align: 'center',
            render: () => (
                <button className={styles.viewButton}>View Details</button>
            ),
        },
    ];

    return (
        <DashboardLayout
            role="College Dean"
            userName="College Dean"
            notificationCount={3}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>College Performance</h1>
                        <p className={styles.subtitle}>Overview of faculty performance and department status.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        + Assign Dept. Chair
                    </Button>
                </div>

                <div className={styles.stats}>
                    <StatCard
                        title="Total Faculty"
                        value={86}
                        subtitle="Across 4 departments"
                        icon={Users}
                    />
                    <StatCard
                        title="Department Chairs"
                        value={4}
                        subtitle="All positions filled"
                        icon={Briefcase}
                    />
                    <StatCard
                        title="Evaluations"
                        value={342}
                        subtitle="+8% Completed this semester"
                        trendValue="+8%"
                        icon={ClipboardList}
                    />
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Faculty Evaluation Summary</h2>
                        <Button variant="ghost" size="small">
                            <Download size={16} />
                            Export Report
                        </Button>
                    </div>

                    <div className={styles.tableContainer}>
                        <Table columns={columns} data={evaluations} />
                    </div>
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
            </div>
        </DashboardLayout>
    );
}
