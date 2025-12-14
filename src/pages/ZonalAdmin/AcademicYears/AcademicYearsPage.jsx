import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import { ToastContainer } from '@/components/Toast/Toast';
import { useToast } from '@/hooks/useToast';
import styles from './AcademicYearsPage.module.css';

export function AcademicYearsPage() {
    const toast = useToast();
    const [semesters, setSemesters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        academicYear: '',
        semester: '',
        startDate: '',
        endDate: '',
    });

    // Edit form data
    const [editFormData, setEditFormData] = useState({
        academicYear: '',
        semester: '',
        startDate: '',
        endDate: '',
    });

    // Fetch academic years
    const fetchAcademicYears = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/zonal/academic-years');
            const data = await response.json();

            if (data.success) {
                setSemesters(data.data);
            }
        } catch (error) {
            console.error('Error fetching academic years:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAcademicYears();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Generate year code with semester (e.g., "2024-2025-1" for 1st Semester)
            const yearCode = formData.academicYear.replace(/\s+/g, '');
            const semesterNum = formData.semester === '1st Semester' ? '1' : '2';
            const fullYearCode = `${yearCode}-${semesterNum}`;

            console.log('Submitting academic year:', {
                year_code: fullYearCode,
                year_label: formData.academicYear,
                semester: formData.semester,
                start_date: formData.startDate,
                end_date: formData.endDate
            });

            const response = await fetch('http://localhost:5000/api/zonal/academic-years', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    year_code: fullYearCode,
                    year_label: formData.academicYear,
                    semester: formData.semester,
                    start_date: formData.startDate,
                    end_date: formData.endDate
                }),
            });

            const data = await response.json();

            if (data.success) {
                await fetchAcademicYears();
                setIsModalOpen(false);
                setFormData({ academicYear: '', semester: '', startDate: '', endDate: '' });
                toast.success('Academic year created successfully!');
            } else {
                toast.error(data.message || 'Error creating academic year');
            }
        } catch (error) {
            console.error('Error creating academic year:', error);
            toast.error('Server error occurred. Please check the console for details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({ academicYear: '', semester: '', startDate: '', endDate: '' });
    };

    // Edit handlers
    const handleEdit = (semester) => {
        setSelectedSemester(semester);
        setEditFormData({
            academicYear: semester.year_label,
            semester: semester.semester,
            startDate: semester.start_date ? semester.start_date.split('T')[0] : '',
            endDate: semester.end_date ? semester.end_date.split('T')[0] : '',
        });
        setIsEditModalOpen(true);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Generate year code with semester
            const yearCode = editFormData.academicYear.replace(/\s+/g, '');
            const semesterNum = editFormData.semester === '1st Semester' ? '1' : '2';
            const fullYearCode = `${yearCode}-${semesterNum}`;

            console.log('Updating academic year:', selectedSemester.id, {
                year_code: fullYearCode,
                year_label: editFormData.academicYear,
                semester: editFormData.semester,
                start_date: editFormData.startDate,
                end_date: editFormData.endDate
            });

            const response = await fetch(`http://localhost:5000/api/zonal/academic-years/${selectedSemester.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    year_code: fullYearCode,
                    year_label: editFormData.academicYear,
                    semester: editFormData.semester,
                    start_date: editFormData.startDate,
                    end_date: editFormData.endDate
                }),
            });

            const data = await response.json();

            if (data.success) {
                await fetchAcademicYears();
                setIsEditModalOpen(false);
                setSelectedSemester(null);
                toast.success('Academic year updated successfully!');
            } else {
                toast.error(data.message || 'Error updating academic year');
            }
        } catch (error) {
            console.error('Error updating academic year:', error);
            toast.error('Server error occurred. Please check the console for details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditCancel = () => {
        setIsEditModalOpen(false);
        setSelectedSemester(null);
    };

    // Delete handlers
    const handleDeleteClick = (semester) => {
        setSelectedSemester(semester);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsSubmitting(true);

        try {
            const response = await fetch(`http://localhost:5000/api/zonal/academic-years/${selectedSemester.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                await fetchAcademicYears();
                setIsDeleteModalOpen(false);
                setSelectedSemester(null);
                toast.success('Academic year deleted successfully!');
            } else {
                toast.error(data.message || 'Error deleting academic year');
            }
        } catch (error) {
            console.error('Error deleting academic year:', error);
            toast.error('Server error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setSelectedSemester(null);
    };

    // Activate/Close handlers
    const handleActivateClick = (semester) => {
        setSelectedSemester(semester);
        setIsActivateModalOpen(true);
    };

    const handleActivateConfirm = async () => {
        setIsSubmitting(true);

        try {
            // First, deactivate all other semesters
            await fetch('http://localhost:5000/api/zonal/academic-years/deactivate-all', {
                method: 'POST',
            });

            // Then activate this semester
            const response = await fetch(`http://localhost:5000/api/zonal/academic-years/${selectedSemester.id}/activate`, {
                method: 'PUT',
            });

            const data = await response.json();

            if (data.success) {
                await fetchAcademicYears();
                setIsActivateModalOpen(false);
                setSelectedSemester(null);
                toast.success('Academic year activated successfully!');
            } else {
                toast.error(data.message || 'Error activating academic year');
            }
        } catch (error) {
            console.error('Error activating academic year:', error);
            toast.error('Server error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleActivateCancel = () => {
        setIsActivateModalOpen(false);
        setSelectedSemester(null);
    };

    const handleCloseClick = (semester) => {
        setSelectedSemester(semester);
        setIsCloseModalOpen(true);
    };

    const handleCloseConfirm = async () => {
        setIsSubmitting(true);

        try {
            const response = await fetch(`http://localhost:5000/api/zonal/academic-years/${selectedSemester.id}/close`, {
                method: 'PUT',
            });

            const data = await response.json();

            if (data.success) {
                await fetchAcademicYears();
                setIsCloseModalOpen(false);
                setSelectedSemester(null);
                toast.success('Academic year closed successfully!');
            } else {
                toast.error(data.message || 'Error closing academic year');
            }
        } catch (error) {
            console.error('Error closing academic year:', error);
            toast.error('Server error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseCancel = () => {
        setIsCloseModalOpen(false);
        setSelectedSemester(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const columns = [
        {
            header: 'Academic Year',
            accessor: 'year_label',
            width: '20%',
        },
        {
            header: 'Semester',
            accessor: 'semester',
            width: '20%',
        },
        {
            header: 'Start Date',
            accessor: 'start_date',
            width: '15%',
            render: (value) => formatDate(value)
        },
        {
            header: 'End Date',
            accessor: 'end_date',
            width: '15%',
            render: (value) => formatDate(value)
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '15%',
            align: 'center',
            render: (value) => (
                <Badge variant={value === 'active' ? 'active' : 'inactive'}>
                    {value === 'active' ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '15%',
            align: 'center',
            render: (_, row) => (
                <div className={styles.actions}>
                    {row.status === 'active' ? (
                        <Button
                            variant="danger"
                            size="small"
                            onClick={() => handleCloseClick(row)}
                        >
                            Close
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="small"
                            onClick={() => handleActivateClick(row)}
                        >
                            Activate
                        </Button>
                    )}
                    <button
                        className={styles.actionButton}
                        aria-label="Edit"
                        onClick={() => handleEdit(row)}
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        className={styles.actionButton}
                        aria-label="Delete"
                        onClick={() => handleDeleteClick(row)}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <DashboardLayout role="Zonal Admin" userName="Zonal Admin">
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            role="Zonal Admin"
            userName="Zonal Admin"
            notificationCount={3}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Academic Years & Semesters</h1>
                        <p className={styles.subtitle}>Manage academic calendar and evaluation periods.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Open New Semester
                    </Button>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={semesters} />
                </div>

                {/* Open New Semester Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Open New Semester"
                >
                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        <Input
                            label="Academic Year"
                            name="academicYear"
                            type="text"
                            placeholder="e.g. 2024-2025"
                            value={formData.academicYear}
                            onChange={handleInputChange}
                            required
                        />

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Semester<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select an option</option>
                                <option value="1st Semester">1st Semester</option>
                                <option value="2nd Semester">2nd Semester</option>
                            </select>
                        </div>

                        <div className={styles.dateRow}>
                            <div className={styles.dateField}>
                                <Input
                                    label="Start Date"
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={styles.dateField}>
                                <Input
                                    label="End Date"
                                    name="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Create & Activate' : 'Create & Activate'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Edit Semester Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={handleEditCancel}
                    title="Edit Semester"
                >
                    <form onSubmit={handleEditSubmit} className={styles.modalForm}>
                        <Input
                            label="Academic Year"
                            name="academicYear"
                            type="text"
                            placeholder="e.g. 2024-2025"
                            value={editFormData.academicYear}
                            onChange={handleEditInputChange}
                            required
                        />

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Semester<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="semester"
                                value={editFormData.semester}
                                onChange={handleEditInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select an option</option>
                                <option value="1st Semester">1st Semester</option>
                                <option value="2nd Semester">2nd Semester</option>
                            </select>
                        </div>

                        <div className={styles.dateRow}>
                            <div className={styles.dateField}>
                                <Input
                                    label="Start Date"
                                    name="startDate"
                                    type="date"
                                    value={editFormData.startDate}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>
                            <div className={styles.dateField}>
                                <Input
                                    label="End Date"
                                    name="endDate"
                                    type="date"
                                    value={editFormData.endDate}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleEditCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Updating...' : 'Update Semester'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={handleDeleteCancel}
                    title="Delete Semester"
                >
                    <div className={styles.deleteConfirmation}>
                        <p className={styles.deleteMessage}>
                            Are you sure you want to delete{' '}
                            <strong>{selectedSemester?.year_label} - {selectedSemester?.semester}</strong>?
                        </p>
                        <p className={styles.deleteWarning}>
                            This action cannot be undone. All associated evaluation data will be permanently removed.
                        </p>

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleDeleteCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="danger"
                                onClick={handleDeleteConfirm}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Deleting...' : 'Delete Semester'}
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* Activate Confirmation Modal */}
                <Modal
                    isOpen={isActivateModalOpen}
                    onClose={handleActivateCancel}
                    title="Activate Semester"
                >
                    <div className={styles.deleteConfirmation}>
                        <p className={styles.deleteMessage}>
                            Are you sure you want to activate{' '}
                            <strong>{selectedSemester?.year_label} - {selectedSemester?.semester}</strong>?
                        </p>
                        <p className={styles.deleteWarning}>
                            This will automatically deactivate all other semesters. Only one semester can be active at a time.
                        </p>

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleActivateCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleActivateConfirm}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Activating...' : 'Activate Semester'}
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* Close Confirmation Modal */}
                <Modal
                    isOpen={isCloseModalOpen}
                    onClose={handleCloseCancel}
                    title="Close Semester"
                >
                    <div className={styles.deleteConfirmation}>
                        <p className={styles.deleteMessage}>
                            Are you sure you want to close{' '}
                            <strong>{selectedSemester?.year_label} - {selectedSemester?.semester}</strong>?
                        </p>
                        <p className={styles.deleteWarning}>
                            This will deactivate the semester and set its status to inactive.
                        </p>

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleCloseCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="danger"
                                onClick={handleCloseConfirm}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Closing...' : 'Close Semester'}
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* Toast Notifications */}
                <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
            </div>
        </DashboardLayout>
    );
}
