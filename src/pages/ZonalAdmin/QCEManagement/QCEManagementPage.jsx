import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './QCEManagementPage.module.css';

export function QCEManagementPage() {
    const [accounts, setAccounts] = useState([]);
    const [colleges, setColleges] = useState([]); // Store colleges list
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        firstName: '',
        middleInitial: '',
        lastName: '',
        email: '',
        collegeId: '',
        collegeId: '',
        password: '',
        confirmPassword: '',
    });

    // Edit form data
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        middleInitial: '',
        lastName: '',
        email: '',
        collegeId: '',
    });

    // Fetch accounts and colleges
    const fetchData = async () => {
        try {
            setIsLoading(true);

            // Fetch accounts
            const accountsRes = await fetch('http://localhost:5000/api/zonal/qce');
            const accountsData = await accountsRes.json();

            if (accountsData.success) {
                setAccounts(accountsData.data);
            }

            // Fetch colleges for dropdown
            const collegesRes = await fetch('http://localhost:5000/api/zonal/colleges');
            const collegesData = await collegesRes.json();

            if (collegesData.success) {
                setColleges(collegesData.data);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/zonal/qce', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                await fetchData(); // Refresh list
                setIsModalOpen(false);
                setFormData({ firstName: '', middleInitial: '', lastName: '', email: '', collegeId: '', password: '', confirmPassword: '' });
            } else {
                alert(data.message || 'Error creating account');
            }
        } catch (error) {
            console.error('Error creating account:', error);
            alert('Server error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({ firstName: '', middleInitial: '', lastName: '', email: '', collegeId: '', password: '', confirmPassword: '' });
    };

    const handleEdit = (account) => {
        const parts = account.full_name.split(' ');
        let firstName = parts[0];
        let middleInitial = '';
        let lastName = '';

        if (parts.length > 2 && parts[1].endsWith('.')) {
            // Assumes "First M. Last" format
            middleInitial = parts[1].replace('.', '');
            lastName = parts.slice(2).join(' ');
        } else {
            // Assumes "First Last" or complex names without clear middle initial
            lastName = parts.slice(1).join(' ');
        }

        setSelectedAccount(account);
        setEditFormData({
            firstName: firstName || '',
            middleInitial: middleInitial || '',
            lastName: lastName || '',
            email: account.email,
            collegeId: account.college_id || '',
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
            const response = await fetch(`http://localhost:5000/api/zonal/qce/${selectedAccount.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editFormData),
            });

            const data = await response.json();

            if (data.success) {
                await fetchData();
                setIsEditModalOpen(false);
                setSelectedAccount(null);
            } else {
                alert(data.message || 'Error updating account');
            }
        } catch (error) {
            console.error('Error updating account:', error);
            alert('Server error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditCancel = () => {
        setIsEditModalOpen(false);
        setSelectedAccount(null);
    };

    const handleDeleteClick = (account) => {
        setSelectedAccount(account);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsSubmitting(true);

        try {
            const response = await fetch(`http://localhost:5000/api/zonal/qce/${selectedAccount.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                await fetchData();
                setIsDeleteModalOpen(false);
                setSelectedAccount(null);
            } else {
                alert(data.message || 'Error deleting account');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Server error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setSelectedAccount(null);
    };

    const columns = [
        {
            header: 'Name',
            accessor: 'full_name',
            width: '25%',
        },
        {
            header: 'Email',
            accessor: 'email',
            width: '25%',
        },
        {
            header: 'Assigned College',
            accessor: 'assigned_college',
            width: '25%',
            render: (value) => value || <span className="text-gray-400 italic">Not Assigned</span>
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '10%',
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
                    <button
                        className={styles.actionButton}
                        title="Edit Account"
                        onClick={() => handleEdit(row)}
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        className={styles.actionButton}
                        title="Delete Account"
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
                        <h1 className={styles.title}>QCE Account Management</h1>
                        <p className={styles.subtitle}>Manage Quality Circle Evaluator accounts and permissions.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Create QCE Account
                    </Button>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={accounts} />
                </div>

                {/* Create QCE Account Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Create QCE Account"
                >
                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 sm:col-span-5">
                                <Input
                                    label="First Name"
                                    name="firstName"
                                    type="text"
                                    placeholder="e.g. John"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="col-span-12 sm:col-span-2">
                                <Input
                                    label="M.I."
                                    name="middleInitial"
                                    type="text"
                                    placeholder="M"
                                    maxLength={1}
                                    value={formData.middleInitial}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-span-12 sm:col-span-5">
                                <Input
                                    label="Last Name"
                                    name="lastName"
                                    type="text"
                                    placeholder="e.g. Doe"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="john@university.edu"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Assigned College<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="collegeId"
                                value={formData.collegeId}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select a college</option>
                                {colleges.map(college => (
                                    <option key={college.id} value={college.id}>
                                        {college.college_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />

                        <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
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
                                {isSubmitting ? 'Create Account' : 'Create Account'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Edit QCE Account Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={handleEditCancel}
                    title="Edit QCE Account"
                >
                    <form onSubmit={handleEditSubmit} className={styles.modalForm}>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 sm:col-span-5">
                                <Input
                                    label="First Name"
                                    name="firstName"
                                    type="text"
                                    placeholder="e.g. John"
                                    value={editFormData.firstName}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>
                            <div className="col-span-12 sm:col-span-2">
                                <Input
                                    label="M.I."
                                    name="middleInitial"
                                    type="text"
                                    placeholder="M"
                                    maxLength={1}
                                    value={editFormData.middleInitial}
                                    onChange={handleEditInputChange}
                                />
                            </div>
                            <div className="col-span-12 sm:col-span-5">
                                <Input
                                    label="Last Name"
                                    name="lastName"
                                    type="text"
                                    placeholder="e.g. Doe"
                                    value={editFormData.lastName}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="john@university.edu"
                            value={editFormData.email}
                            onChange={handleEditInputChange}
                            required
                        />

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Assigned College<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="collegeId"
                                value={editFormData.collegeId}
                                onChange={handleEditInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select a college</option>
                                {colleges.map(college => (
                                    <option key={college.id} value={college.id}>
                                        {college.college_name}
                                    </option>
                                ))}
                            </select>
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
                                {isSubmitting ? 'Updating...' : 'Update Account'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={handleDeleteCancel}
                    title="Delete QCE Account"
                >
                    <div className={styles.deleteConfirmation}>
                        <p className={styles.deleteMessage}>
                            Are you sure you want to delete the account for{' '}
                            <strong>{selectedAccount?.full_name}</strong>?
                        </p>
                        <p className={styles.deleteWarning}>
                            This action cannot be undone.
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
                                {isSubmitting ? 'Deleting...' : 'Delete Account'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
