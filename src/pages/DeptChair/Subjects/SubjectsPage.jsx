import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './SubjectsPage.module.css';

// Mock data - Subjects offered in the department
const mockSubjects = [
    {
        id: 1,
        subjectCode: 'CS101',
        descriptiveTitle: 'Introduction to Computing',
        units: 3,
        activeSections: 4
    },
    {
        id: 2,
        subjectCode: 'CS102',
        descriptiveTitle: 'Computer Programming 1',
        units: 3,
        activeSections: 4
    },
    {
        id: 3,
        subjectCode: 'CS103',
        descriptiveTitle: 'Discrete Structures',
        units: 3,
        activeSections: 2
    },
];

export function SubjectsPage() {
    const [subjects] = useState(mockSubjects);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        subjectCode: '',
        descriptiveTitle: '',
        units: '',
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
        console.log('Adding Subject:', formData);
        setIsModalOpen(false);
        setFormData({
            subjectCode: '',
            descriptiveTitle: '',
            units: '',
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({
            subjectCode: '',
            descriptiveTitle: '',
            units: '',
        });
    };

    const columns = [
        {
            header: 'Subject Code',
            accessor: 'subjectCode',
            width: '20%',
        },
        {
            header: 'Descriptive Title',
            accessor: 'descriptiveTitle',
            width: '40%',
        },
        {
            header: 'Units',
            accessor: 'units',
            width: '15%',
            align: 'center',
        },
        {
            header: 'Active Sections',
            accessor: 'activeSections',
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
                        <h1 className={styles.title}>Subject Offerings</h1>
                        <p className={styles.subtitle}>Manage subjects offered this semester.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Add Subject
                    </Button>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={subjects} />
                </div>

                {/* Add Subject Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Add Subject"
                >
                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        <Input
                            label="Subject Code"
                            name="subjectCode"
                            type="text"
                            placeholder="e.g. CS101"
                            value={formData.subjectCode}
                            onChange={handleInputChange}
                            required
                        />

                        <Input
                            label="Descriptive Title"
                            name="descriptiveTitle"
                            type="text"
                            placeholder="e.g. Introduction to Computing"
                            value={formData.descriptiveTitle}
                            onChange={handleInputChange}
                            required
                        />

                        <Input
                            label="Units"
                            name="units"
                            type="number"
                            placeholder="e.g. 3"
                            value={formData.units}
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
                                Add Subject
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
