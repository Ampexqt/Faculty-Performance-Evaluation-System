import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './SchedulesPage.module.css';

// Mock data - Assigned subjects to faculty
const mockSchedules = [
    {
        id: 1,
        subject: 'CS101',
        descriptiveTitle: 'Introduction to Computing',
        section: 'BSCS 1-A',
        faculty: 'Prof. Alan Turing'
    },
    {
        id: 2,
        subject: 'CS101',
        descriptiveTitle: 'Introduction to Computing',
        section: 'BSCS 1-B',
        faculty: 'Prof. Alan Turing'
    },
    {
        id: 3,
        subject: 'CS102',
        descriptiveTitle: 'Computer Programming 1',
        section: 'BSCS 1-A',
        faculty: 'Prof. Ada Lovelace'
    },
];

export function SchedulesPage() {
    const [schedules] = useState(mockSchedules);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        yearLevel: '',
        section: '',
        faculty: '',
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
        console.log('Assigning Subject:', formData);
        setIsModalOpen(false);
        setFormData({
            subject: '',
            yearLevel: '',
            section: '',
            faculty: '',
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({
            subject: '',
            yearLevel: '',
            section: '',
            faculty: '',
        });
    };

    const columns = [
        {
            header: 'Subject',
            accessor: 'subject',
            width: '15%',
        },
        {
            header: 'Descriptive Title',
            accessor: 'descriptiveTitle',
            width: '35%',
        },
        {
            header: 'Section',
            accessor: 'section',
            width: '20%',
        },
        {
            header: 'Faculty',
            accessor: 'faculty',
            width: '30%',
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
                        <h1 className={styles.title}>Assigned Subjects</h1>
                        <p className={styles.subtitle}>View assigned subjects to faculty members.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Assign Subject
                    </Button>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={schedules} />
                </div>

                {/* Assign Subject Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Assign Subject"
                >
                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        {/* Subject Dropdown */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Subject <span className={styles.required}>*</span>
                            </label>
                            <select
                                name="subject"
                                className={styles.select}
                                value={formData.subject}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Subject</option>
                                <option value="CS101">CS101 - Introduction to Computing</option>
                                <option value="CS102">CS102 - Computer Programming 1</option>
                                <option value="CS103">CS103 - Discrete Structures</option>
                            </select>
                        </div>

                        {/* Year Level and Section Row */}
                        <div className={styles.formRow}>
                            {/* Year Level Dropdown */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Year Level <span className={styles.required}>*</span>
                                </label>
                                <select
                                    name="yearLevel"
                                    className={styles.select}
                                    value={formData.yearLevel}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Year</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>

                            {/* Section Dropdown */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Section <span className={styles.required}>*</span>
                                </label>
                                <select
                                    name="section"
                                    className={styles.select}
                                    value={formData.section}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Section</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                    <option value="E">E</option>
                                    <option value="F">F</option>
                                    <option value="G">G</option>
                                    <option value="H">H</option>
                                </select>
                            </div>
                        </div>

                        {/* Faculty Dropdown */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Faculty <span className={styles.required}>*</span>
                            </label>
                            <select
                                name="faculty"
                                className={styles.select}
                                value={formData.faculty}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Faculty</option>
                                <option value="Prof. Alan Turing">Prof. Alan Turing</option>
                                <option value="Prof. Ada Lovelace">Prof. Ada Lovelace</option>
                                <option value="Prof. Grace Hopper">Prof. Grace Hopper</option>
                                <option value="Dr. John von Neumann">Dr. John von Neumann</option>
                            </select>
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
                                Assign Subject
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
