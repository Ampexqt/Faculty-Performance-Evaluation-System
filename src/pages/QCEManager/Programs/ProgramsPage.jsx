import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { Modal } from '@/components/Modal/Modal';
import styles from './ProgramsPage.module.css';

// Mock data
const mockPrograms = [
    {
        id: 1,
        code: 'BSCS',
        name: 'Bachelor of Science in Computer Science',
        enrolledStudents: 450,
        activeSections: 12
    },
    {
        id: 2,
        code: 'BSIT',
        name: 'Bachelor of Science in Information Technology',
        enrolledStudents: 620,
        activeSections: 16
    },
];

export function ProgramsPage() {
    const [programs] = useState(mockPrograms);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        programCode: '',
        programName: '',
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
        console.log('Adding program:', formData);
        setIsModalOpen(false);
        setFormData({ programCode: '', programName: '' });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({ programCode: '', programName: '' });
    };

    const columns = [
        {
            header: 'Program Code',
            accessor: 'code',
            width: '15%',
        },
        {
            header: 'Program Name',
            accessor: 'name',
            width: '50%',
        },
        {
            header: 'Enrolled Students',
            accessor: 'enrolledStudents',
            width: '20%',
            align: 'center',
        },
        {
            header: 'Active Sections',
            accessor: 'activeSections',
            width: '15%',
            align: 'center',
        },
    ];

    return (
        <DashboardLayout
            role="QCE Manager"
            userName="QCE Manager"
            notificationCount={5}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Programs Overview</h1>
                        <p className={styles.subtitle}>View academic programs under your supervision.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Add Program
                    </Button>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={programs} />
                </div>

                {/* Add Program Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Add Program"
                >
                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        <Input
                            label="Program Code"
                            name="programCode"
                            type="text"
                            placeholder="e.g. BSCS"
                            value={formData.programCode}
                            onChange={handleInputChange}
                            required
                        />

                        <Input
                            label="Program Name"
                            name="programName"
                            type="text"
                            placeholder="e.g. Bachelor of Science in Computer Science"
                            value={formData.programName}
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
                                Add Program
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
