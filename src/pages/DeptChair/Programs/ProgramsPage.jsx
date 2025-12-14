import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './ProgramsPage.module.css';

export function ProgramsPage() {
    const [programs, setPrograms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userInfo, setUserInfo] = useState({
        departmentId: null,
        fullName: ''
    });

    useEffect(() => {
        const departmentId = localStorage.getItem('departmentId');
        const fullName = localStorage.getItem('fullName') || 'Department Chair';
        setUserInfo({ departmentId, fullName });
    }, []);

    useEffect(() => {
        if (userInfo.departmentId) {
            fetchPrograms();
        }
    }, [userInfo.departmentId]);

    const fetchPrograms = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/programs?department_id=${userInfo.departmentId}`);
            const data = await response.json();
            if (data.success) {
                setPrograms(data.data.map(p => ({
                    ...p,
                    programCode: p.code,
                    programName: p.name,
                    students: p.enrolledStudents || 0
                })));
            }
        } catch (error) {
            console.error('Error fetching programs:', error);
        }
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userId = localStorage.getItem('userId');
            const response = await fetch('http://localhost:5000/api/qce/programs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, qceId: userId })
            });
            const result = await response.json();
            if (result.success) {
                alert('Program added successfully');
                setIsModalOpen(false);
                setFormData({ programCode: '', programName: '' });
                fetchPrograms();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error adding program:', error);
        }
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
            width: '20%',
        },
        {
            header: 'Program Name',
            accessor: 'programName',
            width: '50%',
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
            width: '15%',
            align: 'center',
            render: () => (
                <div className={styles.actions}>
                    <button className={styles.iconButton} title="Edit">
                        <Edit size={16} />
                    </button>
                    <button className={styles.iconButton} title="Delete">
                        <Trash2 size={16} />
                    </button>
                </div>
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
