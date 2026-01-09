import React, { useState, useEffect } from 'react';
import { Plus, PenSquare, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { Modal } from '@/components/Modal/Modal';
import { ToastContainer } from '@/components/Toast/Toast';
import styles from './ProgramsPage.module.css';

export function ProgramsPage() {
    const [programs, setPrograms] = useState([]);
    const [userName, setUserName] = useState('QCE Manager');

    useEffect(() => {
        const storedName = localStorage.getItem('fullName');
        if (storedName) {
            setUserName(storedName);
        }
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);
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

    const handleEdit = (program) => {
        setSelectedProgram(program);
        setFormData({
            programCode: program.code,
            programName: program.name,
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:5000/api/qce/programs/${selectedProgram.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    programCode: formData.programCode,
                    programName: formData.programName,
                }),
            });

            const result = await response.json();

            if (result.success) {
                addToast('Program updated successfully', 'success');
                setIsEditModalOpen(false);
                setSelectedProgram(null);
                setFormData({ programCode: '', programName: '' });
                fetchPrograms();
            } else {
                addToast(result.message || 'Failed to update program', 'error');
            }
        } catch (error) {
            console.error('Error updating program:', error);
            addToast('An error occurred', 'error');
        }
    };

    const handleEditCancel = () => {
        setIsEditModalOpen(false);
        setSelectedProgram(null);
        setFormData({ programCode: '', programName: '' });
    };

    const handleDeleteClick = (program) => {
        setSelectedProgram(program);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/programs/${selectedProgram.id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                addToast('Program deleted successfully', 'success');
                setIsDeleteModalOpen(false);
                setSelectedProgram(null);
                fetchPrograms();
            } else {
                addToast(result.message || 'Failed to delete program', 'error');
            }
        } catch (error) {
            console.error('Error deleting program:', error);
            addToast('An error occurred', 'error');
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setSelectedProgram(null);
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
            width: '40%',
        },
        {
            header: 'Enrolled Students',
            accessor: 'enrolledStudents',
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
            width: '15%',
            align: 'center',
            render: (value, row) => (
                <div className={styles.actionButtons}>
                    <button
                        className={styles.actionButton}
                        onClick={() => handleEdit(row)}
                        aria-label="Edit program"
                    >
                        <PenSquare size={16} />
                    </button>
                    <button
                        className={styles.actionButton}
                        onClick={() => handleDeleteClick(row)}
                        aria-label="Delete program"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout
            role="QCE Manager"
            userName={userName}
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

                {/* Edit Program Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={handleEditCancel}
                    title="Edit Program"
                >
                    <form onSubmit={handleEditSubmit} className={styles.modalForm}>
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
                                onClick={handleEditCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                            >
                                Update Program
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Program Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={handleDeleteCancel}
                    title="Delete Program"
                >
                    <div className={styles.deleteModalContent}>
                        <p>Are you sure you want to delete <strong>{selectedProgram?.name}</strong>?</p>
                        <p className={styles.deleteWarning}>This action cannot be undone.</p>

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleDeleteCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="danger"
                                onClick={handleDeleteConfirm}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </Modal>

                <ToastContainer toasts={toasts} removeToast={removeToast} />
            </div>
        </DashboardLayout>
    );
}
