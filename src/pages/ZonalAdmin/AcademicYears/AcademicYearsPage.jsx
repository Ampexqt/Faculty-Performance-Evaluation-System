import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './AcademicYearsPage.module.css';

// Mock data
const mockSemesters = [
    {
        id: 1,
        academicYear: '2023-2024',
        semester: '1st Semester',
        startDate: 'Aug 2023',
        endDate: 'Dec 2023',
        status: 'Active'
    },
    {
        id: 2,
        academicYear: '2022-2023',
        semester: '2nd Semester',
        startDate: 'Jan 2023',
        endDate: 'May 2023',
        status: 'Closed'
    },
    {
        id: 3,
        academicYear: '2022-2023',
        semester: '1st Semester',
        startDate: 'Aug 2022',
        endDate: 'Dec 2022',
        status: 'Closed'
    },
];

export function AcademicYearsPage() {
    const [semesters] = useState(mockSemesters);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        academicYear: '',
        semester: '',
        startDate: '',
        endDate: '',
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
        console.log('Opening new semester:', formData);
        setIsModalOpen(false);
        setFormData({ academicYear: '', semester: '', startDate: '', endDate: '' });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({ academicYear: '', semester: '', startDate: '', endDate: '' });
    };

    const columns = [
        {
            header: 'Academic Year',
            accessor: 'academicYear',
            width: '20%',
        },
        {
            header: 'Semester',
            accessor: 'semester',
            width: '20%',
        },
        {
            header: 'Start Date',
            accessor: 'startDate',
            width: '15%',
        },
        {
            header: 'End Date',
            accessor: 'endDate',
            width: '15%',
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '15%',
            align: 'center',
            render: (value) => (
                <Badge variant={value === 'Active' ? 'active' : 'warning'}>
                    {value}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '15%',
            align: 'center',
            render: (_, row) => (
                row.status === 'Active' ? (
                    <Button variant="danger" size="small">
                        Close Semester
                    </Button>
                ) : (
                    <span className={styles.archivedText}>Archived</span>
                )
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
                        <h1 className={styles.title}>Academic Years & Semesters</h1>
                        <p className={styles.subtitle}>Manage academic calendar and evaluation periods.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Open New Semester
                    </Button>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={semesters} />
                </div>

                {/* Open New Semester Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Open New Semester"
                >
                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        <Input
                            label="Academic Year"
                            name="academicYear"
                            type="text"
                            placeholder="e.g. 2024-2025"
                            value={formData.academicYear}
                            onChange={handleInputChange}
                            required
                        />

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Semester<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select an option</option>
                                <option value="1st Semester">1st Semester</option>
                                <option value="2nd Semester">2nd Semester</option>
                            </select>
                        </div>

                        <div className={styles.dateRow}>
                            <div className={styles.dateField}>
                                <Input
                                    label="Start Date"
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={styles.dateField}>
                                <Input
                                    label="End Date"
                                    name="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

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
                                Create & Activate
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
