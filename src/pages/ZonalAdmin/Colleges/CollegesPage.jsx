import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './CollegesPage.module.css';

// Mock data
const mockColleges = [
    {
        id: 1,
        code: 'CCS',
        name: 'College of Computing Studies',
        dean: 'Dr. Sarah Smith',
        status: 'Active'
    },
    {
        id: 2,
        code: 'CAS',
        name: 'College of Arts and Sciences',
        dean: 'Dr. James Wilson',
        status: 'Active'
    },
    {
        id: 3,
        code: 'CED',
        name: 'College of Education',
        dean: 'Dr. Maria Garcia',
        status: 'Active'
    },
    {
        id: 4,
        code: 'COT',
        name: 'College of Technology',
        dean: 'Dr. Robert Brown',
        status: 'Active'
    },
    {
        id: 5,
        code: 'CME',
        name: 'College of Marine Engineering',
        dean: 'Capt. John Doe',
        status: 'Inactive'
    },
];

export function CollegesPage() {
    const [colleges] = useState(mockColleges);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        collegeName: '',
        collegeCode: '',
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
        console.log('Creating college:', formData);
        setIsModalOpen(false);
        setFormData({ collegeName: '', collegeCode: '' });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({ collegeName: '', collegeCode: '' });
    };

    const columns = [
        {
            header: 'Code',
            accessor: 'code',
            width: '10%',
        },
        {
            header: 'College Name',
            accessor: 'name',
            width: '40%',
        },
        {
            header: 'Dean',
            accessor: 'dean',
            width: '25%',
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
            render: () => (
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
                        <h1 className={styles.title}>Colleges Management</h1>
                        <p className={styles.subtitle}>Manage university colleges and their details.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Add New College
                    </Button>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={colleges} />
                </div>

                {/* Create College Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Create New College"
                >
                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        <Input
                            label="College Name"
                            name="collegeName"
                            type="text"
                            placeholder="e.g. College of Computing Studies"
                            value={formData.collegeName}
                            onChange={handleInputChange}
                            required
                        />

                        <Input
                            label="College Code"
                            name="collegeCode"
                            type="text"
                            placeholder="e.g. CCS"
                            value={formData.collegeCode}
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
                                Create College
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
