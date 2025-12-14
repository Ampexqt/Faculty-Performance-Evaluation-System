import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import { ToastContainer } from '@/components/Toast/Toast';
import styles from './SubjectsPage.module.css';

export function SubjectsPage() {
    const [subjects, setSubjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userInfo, setUserInfo] = useState({
        departmentId: null,
        fullName: ''
    });
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Edit/Delete Modal States
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);

    const [editFormData, setEditFormData] = useState({
        subjectCode: '',
        descriptiveTitle: '',
        units: ''
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
                addToast('Subject created successfully', 'success');
                setIsModalOpen(false);
                setFormData({ subjectCode: '', descriptiveTitle: '', units: '' });
                fetchSubjects();
            } else {
                addToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Error adding subject:', error);
            addToast('An error occurred while adding subject', 'error');
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

    const handleEditClick = (subject) => {
        setSelectedSubject(subject);
        setEditFormData({
            subjectCode: subject.subjectCode,
            descriptiveTitle: subject.descriptiveTitle,
            units: subject.units
        });
        setEditModalOpen(true);
    };

    const handleDeleteClick = (subject) => {
        setSelectedSubject(subject);
        setDeleteModalOpen(true);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateSubject = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/qce/subjects/${selectedSubject.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subjectCode: editFormData.subjectCode,
                    subjectName: editFormData.descriptiveTitle,
                    units: editFormData.units
                })
            });
            const result = await response.json();
            if (result.success) {
                addToast('Subject updated successfully', 'success');
                setEditModalOpen(false);
                fetchSubjects();
            } else {
                addToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Error updating subject:', error);
            addToast('Error updating subject', 'error');
        }
    };

    const handleDeleteSubject = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/subjects/${selectedSubject.id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (result.success) {
                addToast('Subject deleted successfully', 'success');
                setDeleteModalOpen(false);
                fetchSubjects();
            } else {
                addToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Error deleting subject:', error);
            addToast('Error deleting subject', 'error');
        }
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
            render: (value, subject) => (
                <div className={styles.actionButtons}>
                    <button
                        className={styles.iconButton}
                        onClick={() => handleEditClick(subject)}
                        title="Edit"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        className={styles.iconButton}
                        onClick={() => handleDeleteClick(subject)}
                        title="Delete"
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

                {/* Edit Subject Modal */}
                <Modal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    title="Edit Subject"
                >
                    <form onSubmit={handleUpdateSubject} className={styles.modalForm}>
                        <Input
                            label="Subject Code"
                            name="subjectCode"
                            type="text"
                            placeholder="e.g. CS101"
                            value={editFormData.subjectCode}
                            onChange={handleEditInputChange}
                            required
                        />

                        <Input
                            label="Descriptive Title"
                            name="descriptiveTitle"
                            type="text"
                            placeholder="e.g. Introduction to Computing"
                            value={editFormData.descriptiveTitle}
                            onChange={handleEditInputChange}
                            required
                        />

                        <Input
                            label="Units"
                            name="units"
                            type="number"
                            placeholder="e.g. 3"
                            value={editFormData.units}
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
                    title="Delete Subject"
                >
                    <div className={styles.deleteConfirmation}>
                        <p>Are you sure you want to delete <strong>{selectedSubject?.subjectCode} - {selectedSubject?.descriptiveTitle}</strong>?</p>
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
                                variant="danger"
                                onClick={handleDeleteSubject}
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
