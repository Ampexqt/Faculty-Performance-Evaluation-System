import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import { Pagination } from '@/components/Pagination/Pagination';
import styles from './CollegesPage.module.css';

export function CollegesPage() {
    const [colleges, setColleges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCollege, setSelectedCollege] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4; // Show 4 items per page

    // Form data for creating college
    const [formData, setFormData] = useState({
        collegeName: '',
        collegeCode: '',
    });

    // Edit form data
    const [editFormData, setEditFormData] = useState({
        collegeName: '',
        collegeCode: '',
    });

    // Fetch colleges data
    const fetchColleges = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/zonal/colleges');
            const data = await response.json();

            if (data.success) {
                setColleges(data.data);
            }
        } catch (error) {
            console.error('Error fetching colleges:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchColleges();
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
            const response = await fetch('http://localhost:5000/api/zonal/colleges', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    college_name: formData.collegeName,
                    college_code: formData.collegeCode,
                    dean_id: null, // Dean assignment not implemented in UI yet
                    faculty_count: 0
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Refresh list
                await fetchColleges();
                setCurrentPage(1); // Reset to first page
                setIsModalOpen(false);
                setFormData({ collegeName: '', collegeCode: '' });
            } else {
                alert(data.message || 'Error creating college');
            }
        } catch (error) {
            console.error('Error creating college:', error);
            alert('Server error while creating college');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({ collegeName: '', collegeCode: '' });
    };

    const handleEdit = (college) => {
        setSelectedCollege(college);
        setEditFormData({
            collegeName: college.college_name,
            collegeCode: college.college_code,
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
            const response = await fetch(`http://localhost:5000/api/zonal/colleges/${selectedCollege.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    college_name: editFormData.collegeName,
                    college_code: editFormData.collegeCode,
                }),
            });

            const data = await response.json();

            if (data.success) {
                await fetchColleges();
                setIsEditModalOpen(false);
                setSelectedCollege(null);
            } else {
                alert(data.message || 'Error updating college');
            }
        } catch (error) {
            console.error('Error updating college:', error);
            alert('Server error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditCancel = () => {
        setIsEditModalOpen(false);
        setSelectedCollege(null);
    };

    const handleDeleteClick = (college) => {
        setSelectedCollege(college);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsSubmitting(true);

        try {
            const response = await fetch(`http://localhost:5000/api/zonal/colleges/${selectedCollege.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                await fetchColleges();
                setIsDeleteModalOpen(false);
                setSelectedCollege(null);
            } else {
                alert(data.message || 'Error deleting college');
            }
        } catch (error) {
            console.error('Error deleting college:', error);
            alert('Server error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setSelectedCollege(null);
    };

    const columns = [
        {
            header: 'Code',
            accessor: 'college_code',
            width: '10%',
        },
        {
            header: 'College Name',
            accessor: 'college_name',
            width: '40%',
        },
        {
            header: 'Dean',
            accessor: 'dean_id', // Currently just ID, would need join or separate fetch for name if not in view
            width: '25%',
            render: (value) => value ? `Dean ID: ${value}` : <span className="text-gray-400 italic">Not Assigned</span>
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
            width: '10%',
            align: 'center',
            render: (_, row) => (
                <div className={styles.actions}>
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

    // Pagination calculations
    const totalPages = Math.ceil(colleges.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedColleges = colleges.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

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
                        <h1 className={styles.title}>Colleges Management</h1>
                        <p className={styles.subtitle}>Manage university colleges and their details.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Add New College
                    </Button>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={paginatedColleges} />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        totalItems={colleges.length}
                    />
                </div>

                {/* Create College Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Create New College"
                >
                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        <Input
                            label="College Name"
                            name="collegeName"
                            type="text"
                            placeholder="e.g. College of Computing Studies"
                            value={formData.collegeName}
                            onChange={handleInputChange}
                            required
                        />

                        <Input
                            label="College Code"
                            name="collegeCode"
                            type="text"
                            placeholder="e.g. CCS"
                            value={formData.collegeCode}
                            onChange={handleInputChange}
                            required
                        />

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
                                {isSubmitting ? 'Creating...' : 'Create College'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Edit College Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={handleEditCancel}
                    title="Edit College"
                >
                    <form onSubmit={handleEditSubmit} className={styles.modalForm}>
                        <Input
                            label="College Name"
                            name="collegeName"
                            type="text"
                            placeholder="e.g. College of Computing Studies"
                            value={editFormData.collegeName}
                            onChange={handleEditInputChange}
                            required
                        />

                        <Input
                            label="College Code"
                            name="collegeCode"
                            type="text"
                            placeholder="e.g. CCS"
                            value={editFormData.collegeCode}
                            onChange={handleEditInputChange}
                            required
                        />

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
                                {isSubmitting ? 'Updating...' : 'Update College'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={handleDeleteCancel}
                    title="Delete College"
                >
                    <div className={styles.deleteConfirmation}>
                        <p className={styles.deleteMessage}>
                            Are you sure you want to delete{' '}
                            <strong>{selectedCollege?.college_name}</strong>?
                        </p>
                        <p className={styles.deleteWarning}>
                            This action cannot be undone. All associated data will be permanently removed.
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
                                {isSubmitting ? 'Deleting...' : 'Delete College'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
