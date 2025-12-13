import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './ProgramsPage.module.css';

// Mock data - Programs in department
const mockPrograms = [
    {
        id: 1,
        programCode: 'BSCS',
        programName: 'Bachelor of Science in Computer Science',
        yearLevel: '1-4',
        students: 120
    },
    {
        id: 2,
        programCode: 'BSIT',
        programName: 'Bachelor of Science in Information Technology',
        yearLevel: '1-4',
        students: 95
    },
    {
        id: 3,
        programCode: 'ACT',
        programName: 'Associate in Computer Technology',
        yearLevel: '1-2',
        students: 45
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
        console.log('Adding Program:', formData);
        setIsModalOpen(false);
        setFormData({
            programCode: '',
            programName: '',
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({
            programCode: '',
            programName: '',
        });
    };

    const columns = [
        {
            header: 'Program Code',
            accessor: 'programCode',
            width: '15%',
        },
        {
            header: 'Program Name',
            accessor: 'programName',
            width: '45%',
        },
        {
            header: 'Year Level',
            accessor: 'yearLevel',
            width: '15%',
            align: 'center',
        },
        {
            header: 'Students',
            accessor: 'students',
            width: '15%',
            align: 'center',
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '10%',
            align: 'center',
            render: () => (
                <button className={styles.editButton}>Edit</button>
            ),
        },
    ];

    return (
        <DashboardLayout
            role="Dept. Chair"
            userName="Department Chair"
            notificationCount={2}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Department Programs</h1>
                        <p className={styles.subtitle}>Manage programs and courses within your department.</p>
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
