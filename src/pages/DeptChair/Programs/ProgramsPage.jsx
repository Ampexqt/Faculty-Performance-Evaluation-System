import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import { ToastContainer } from '@/components/Toast/Toast';
import styles from './ProgramsPage.module.css';

export function ProgramsPage() {
    const [programs, setPrograms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userInfo, setUserInfo] = useState({
        departmentId: null,
        fullName: '',
        userId: null
    });

    // Edit/Delete Modal States
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);

    const [editFormData, setEditFormData] = useState({
        programCode: '',
        programName: '',
    });

    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    useEffect(() => {
        const departmentId = sessionStorage.getItem('departmentId');
        const fullName = sessionStorage.getItem('fullName') || 'Department Chair';
        const userId = sessionStorage.getItem('userId');
        setUserInfo({ departmentId, fullName, userId });
    }, []);

    useEffect(() => {
        if (userInfo.departmentId || userInfo.userId) {
            fetchPrograms();
        }
    }, [userInfo.departmentId, userInfo.userId]);

    const fetchPrograms = async () => {
        try {
            const queryParams = new URLSearchParams();
            // Use department_id to fetch all programs in the college, regardless of assigned chair
            if (userInfo.departmentId) queryParams.append('department_id', userInfo.departmentId);

            const response = await fetch(`http://localhost:5000/api/qce/programs?${queryParams.toString()}`);
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
            const userId = sessionStorage.getItem('userId');
            const response = await fetch('http://localhost:5000/api/qce/programs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    qceId: userId,
                    userType: 'faculty'
                })
            });
            const result = await response.json();
            if (result.success) {
                addToast('Program added successfully', 'success');
                setIsModalOpen(false);
                setFormData({ programCode: '', programName: '' });
                fetchPrograms();
            } else {
                addToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Error adding program:', error);
            addToast('An error occurred while adding program', 'error');
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({
            programCode: '',
            programName: '',
        });
    };


    const handleEditClick = (program) => {
        setSelectedProgram(program);
        setEditFormData({
            programCode: program.programCode,
            programName: program.programName
        });
        setEditModalOpen(true);
    };

    const handleDeleteClick = (program) => {
        setSelectedProgram(program);
        setDeleteModalOpen(true);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateProgram = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/qce/programs/${selectedProgram.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData)
            });
            const result = await response.json();
            if (result.success) {
                addToast('Program updated successfully', 'success');
                setEditModalOpen(false);
                fetchPrograms();
            } else {
                addToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Error updating program:', error);
            addToast('Error updating program', 'error');
        }
    };

    const handleDeleteProgram = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/programs/${selectedProgram.id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (result.success) {
                addToast('Program deleted successfully', 'success');
                setDeleteModalOpen(false);
                fetchPrograms();
            } else {
                addToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Error deleting program:', error);
            addToast('Error deleting program', 'error');
        }
    };

    const columns = [
        // ... (previous columns remain same, but modifying Actions)
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
            render: (_, program) => (
                <div className={styles.actions}>
                    <button
                        className={styles.iconButton}
                        title="Edit"
                        onClick={() => handleEditClick(program)}
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        className={styles.iconButton}
                        title="Delete"
                        onClick={() => handleDeleteClick(program)}
                    >
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

                {/* Edit Program Modal */}
                <Modal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    title="Edit Program"
                >
                    <form onSubmit={handleUpdateProgram} className={styles.modalForm}>
                        <Input
                            label="Program Code"
                            name="programCode"
                            type="text"
                            value={editFormData.programCode}
                            onChange={handleEditInputChange}
                            required
                        />

                        <Input
                            label="Program Name"
                            name="programName"
                            type="text"
                            value={editFormData.programName}
                            onChange={handleEditInputChange}
                            required
                        />

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setEditModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    title="Delete Program"
                >
                    <div className={styles.deleteConfirmation}>
                        <p>Are you sure you want to delete <strong>{selectedProgram?.programName}</strong>?</p>
                        <p className={styles.warningText}>This action cannot be undone.</p>

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setDeleteModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="danger" // Assuming danger variant exists, otherwise use primary with red style manually or standard button
                                onClick={handleDeleteProgram}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </DashboardLayout>
    );
}
