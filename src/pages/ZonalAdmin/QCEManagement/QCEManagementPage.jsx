import React, { useState } from 'react';
import { Plus, Key, Mail } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './QCEManagementPage.module.css';

// Mock data
const mockQCEAccounts = [
    {
        id: 1,
        name: 'John Doe',
        username: 'jdoe.qce',
        email: 'jdoe@university.edu',
        assignedCollege: 'College of Computing Studies',
        status: 'Active'
    },
    {
        id: 2,
        name: 'Jane Smith',
        username: 'jsmith.qce',
        email: 'jsmith@university.edu',
        assignedCollege: 'College of Arts and Sciences',
        status: 'Active'
    },
    {
        id: 3,
        name: 'Robert Johnson',
        username: 'rjohnson.qce',
        email: 'rjohnson@university.edu',
        assignedCollege: 'College of Education',
        status: 'Active'
    },
];

export function QCEManagementPage() {
    const [accounts] = useState(mockQCEAccounts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        assignedCollege: '',
        temporaryPassword: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Creating QCE account:', formData);
        setIsModalOpen(false);
        setFormData({ firstName: '', lastName: '', email: '', assignedCollege: '', temporaryPassword: '' });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({ firstName: '', lastName: '', email: '', assignedCollege: '', temporaryPassword: '' });
    };

    const columns = [
        {
            header: 'Name',
            accessor: 'name',
            width: '20%',
        },
        {
            header: 'Username',
            accessor: 'username',
            width: '15%',
        },
        {
            header: 'Email',
            accessor: 'email',
            width: '20%',
        },
        {
            header: 'Assigned College',
            accessor: 'assignedCollege',
            width: '25%',
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '10%',
            align: 'center',
            render: (value) => (
                <Badge variant={value === 'Active' ? 'active' : 'inactive'}>
                    {value}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '10%',
            align: 'center',
            render: () => (
                <div className={styles.actions}>
                    <button className={styles.actionButton} title="Reset Password">
                        <Key size={16} />
                    </button>
                    <button className={styles.actionButton} title="Send Email">
                        <Mail size={16} />
                    </button>
                </div>
            ),
        },
    ];

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
                        <Input
                            label="First Name"
                            name="firstName"
                            type="text"
                            placeholder="e.g. John"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                        />

                        <Input
                            label="Last Name"
                            name="lastName"
                            type="text"
                            placeholder="e.g. Doe"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                        />

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
                                name="assignedCollege"
                                value={formData.assignedCollege}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select a college</option>
                                <option value="College of Computing Studies">College of Computing Studies</option>
                                <option value="College of Arts and Sciences">College of Arts and Sciences</option>
                                <option value="College of Education">College of Education</option>
                                <option value="College of Technology">College of Technology</option>
                                <option value="College of Marine Engineering">College of Marine Engineering</option>
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
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                            >
                                Create Account
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
