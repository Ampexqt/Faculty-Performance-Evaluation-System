import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './SubjectsPage.module.css';

export function SubjectsPage() {
    const [subjects, setSubjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userInfo, setUserInfo] = useState({
        departmentId: null,
        fullName: ''
    });

    const [formData, setFormData] = useState({
        subjectCode: '',
        descriptiveTitle: '',
        units: '',
    });

    useEffect(() => {
        const departmentId = localStorage.getItem('departmentId');
        const fullName = localStorage.getItem('fullName') || 'Department Chair';
        setUserInfo({ departmentId, fullName });
    }, []);

    useEffect(() => {
        if (userInfo.departmentId) {
            fetchSubjects();
        }
    }, [userInfo.departmentId]);

    const fetchSubjects = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/subjects?department_id=${userInfo.departmentId}`);
            const data = await response.json();
            if (data.success) {
                setSubjects(data.data.map(s => ({
                    id: s.id,
                    subjectCode: s.code,
                    descriptiveTitle: s.name,
                    units: s.units,
                    activeSections: s.activeSections || 0
                })));
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/qce/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subjectCode: formData.subjectCode,
                    subjectName: formData.descriptiveTitle,
                    units: formData.units,
                    departmentId: userInfo.departmentId
                })
            });
            const result = await response.json();
            if (result.success) {
                alert('Subject created successfully');
                setIsModalOpen(false);
                setFormData({ subjectCode: '', descriptiveTitle: '', units: '' });
                fetchSubjects();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error adding subject:', error);
        }
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
            userName={userInfo.fullName}
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
