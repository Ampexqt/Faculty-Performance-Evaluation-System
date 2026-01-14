import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './EvaluatorAccountsPage.module.css';

export function EvaluatorAccountsPage() {
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        honorific: '',
        firstName: '',
        middleInitial: '',
        lastName: '',
        suffix: '',
        sex: '',
        email: '',
        position: '',
        temporaryPassword: '',
    });

    // Edit form data
    const [editFormData, setEditFormData] = useState({
        honorific: '',
        firstName: '',
        middleInitial: '',
        lastName: '',
        suffix: '',
        sex: '',
        email: '',
        position: '',
    });

    const positions = ['VPAA', 'President'];
    const honorifics = ['Dr.', 'Prof.', 'Asst. Prof.', 'Assoc. Prof.'];
    const suffixes = ['Ph.D.', 'Ed.D.', 'DBA', 'DPA', 'MD'];

    // Fetch accounts
    const fetchData = async () => {
        try {
            setIsLoading(true);

            // Fetch accounts
            const accountsRes = await fetch('http://localhost:5000/api/zonal/evaluators');
            const accountsData = await accountsRes.json();

            if (accountsData.success) {
                setAccounts(accountsData.data);
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

        try {
            const response = await fetch('http://localhost:5000/api/zonal/evaluators', {
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
                setFormData({ honorific: '', firstName: '', middleInitial: '', lastName: '', suffix: '', sex: '', email: '', position: '', temporaryPassword: '' });
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
        setFormData({ honorific: '', firstName: '', middleInitial: '', lastName: '', suffix: '', sex: '', email: '', position: '', temporaryPassword: '' });
    };

    const handleEdit = (account) => {
        setSelectedAccount(account);
        setEditFormData({
            honorific: account.honorific || '',
            firstName: account.full_name?.split(' ')[0] || '',
            middleInitial: '',
            lastName: account.full_name?.split(' ').slice(1).join(' ') || '',
            suffix: account.suffix || '',
            sex: account.sex || '',
            email: account.email,
            position: account.position,
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
            const response = await fetch(`http://localhost:5000/api/zonal/evaluators/${selectedAccount.id}`, {
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
            const response = await fetch(`http://localhost:5000/api/zonal/evaluators/${selectedAccount.id}`, {
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
            width: '30%',
        },
        {
            header: 'Email',
            accessor: 'email',
            width: '30%',
        },
        {
            header: 'Position',
            accessor: 'position',
            width: '20%',
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
            width: '10%',
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
                        <h1 className={styles.title}>Evaluator Accounts</h1>
                        <p className={styles.subtitle}>Manage specialized evaluator accounts like VPAA and President.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Create Account
                    </Button>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={accounts} />
                </div>

                {/* Create Account Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Create Evaluator Account"
                >
                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Honorific / Prefix
                            </label>
                            <select
                                name="honorific"
                                value={formData.honorific}
                                onChange={handleInputChange}
                                className={styles.select}
                            >
                                <option value="">None</option>
                                {honorifics.map(hon => (
                                    <option key={hon} value={hon}>
                                        {hon}
                                    </option>
                                ))}
                            </select>
                        </div>

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

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Post-nominal Degree / Suffix
                            </label>
                            <select
                                name="suffix"
                                value={formData.suffix}
                                onChange={handleInputChange}
                                className={styles.select}
                            >
                                <option value="">None</option>
                                {suffixes.map(suf => (
                                    <option key={suf} value={suf}>
                                        {suf}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Sex<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="sex"
                                value={formData.sex}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select Sex</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
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
                                Position<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="position"
                                value={formData.position}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select a position</option>
                                {positions.map(pos => (
                                    <option key={pos} value={pos}>
                                        {pos}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Temporary Password"
                            name="temporaryPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.temporaryPassword}
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
                                {isSubmitting ? 'Creating...' : 'Create Account'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Edit Account Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={handleEditCancel}
                    title="Edit Evaluator Account"
                >
                    <form onSubmit={handleEditSubmit} className={styles.modalForm}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Honorific / Prefix
                            </label>
                            <select
                                name="honorific"
                                value={editFormData.honorific}
                                onChange={handleEditInputChange}
                                className={styles.select}
                            >
                                <option value="">None</option>
                                {honorifics.map(hon => (
                                    <option key={hon} value={hon}>
                                        {hon}
                                    </option>
                                ))}
                            </select>
                        </div>

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

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Post-nominal Degree / Suffix
                            </label>
                            <select
                                name="suffix"
                                value={editFormData.suffix}
                                onChange={handleEditInputChange}
                                className={styles.select}
                            >
                                <option value="">None</option>
                                {suffixes.map(suf => (
                                    <option key={suf} value={suf}>
                                        {suf}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Sex<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="sex"
                                value={editFormData.sex}
                                onChange={handleEditInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select Sex</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
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
                                Position<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="position"
                                value={editFormData.position}
                                onChange={handleEditInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select a position</option>
                                {positions.map(pos => (
                                    <option key={pos} value={pos}>
                                        {pos}
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
                    title="Delete Evaluator Account"
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
