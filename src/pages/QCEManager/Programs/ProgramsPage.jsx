import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { Modal } from '@/components/Modal/Modal';
import { ToastContainer } from '@/components/Toast/Toast';
import styles from './ProgramsPage.module.css';

export function ProgramsPage() {
    const [programs, setPrograms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [formData, setFormData] = useState({
        programCode: '',
        programName: '',
    });

    // Toast notification helpers
    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, duration: 3000 }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Fetch programs on mount
    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        setIsLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.college_id) {
                    const response = await fetch(`http://localhost:5000/api/qce/programs?college_id=${user.college_id}`);
                    const data = await response.json();
                    if (data.success) {
                        setPrograms(data.data);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching programs:', error);
            addToast('Failed to load programs', 'error');
        } finally {
            setIsLoading(false);
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
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                addToast('Please login again', 'error');
                return;
            }
            const user = JSON.parse(userStr);

            const response = await fetch('http://localhost:5000/api/qce/programs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    qceId: user.id
                }),
            });

            const result = await response.json();

            if (result.success) {
                addToast('Program added successfully', 'success');
                setIsModalOpen(false);
                setFormData({ programCode: '', programName: '' });
                fetchPrograms(); // Refresh list
            } else {
                addToast(result.message || 'Failed to add program', 'error');
            }
        } catch (error) {
            console.error('Error adding program:', error);
            addToast('An error occurred', 'error');
        }
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
                    {isLoading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
                    ) : (
                        <Table columns={columns} data={programs} />
                    )}
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

                <ToastContainer toasts={toasts} removeToast={removeToast} />
            </div>
        </DashboardLayout>
    );
}
