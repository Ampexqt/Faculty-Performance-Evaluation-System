import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './FacultyAccountsPage.module.css';

// Mock data - Faculty accounts
const mockFaculty = [
    {
        id: 1,
        facultyName: 'Prof. Alan Turing',
        role: 'Professor',
        status: 'Regular',
        assignedSubjects: 3
    },
    {
        id: 2,
        facultyName: 'Prof. Ada Lovelace',
        role: 'Associate Professor',
        status: 'Regular',
        assignedSubjects: 4
    },
    {
        id: 3,
        facultyName: 'Prof. Grace Hopper',
        role: 'Professor',
        status: 'Part-time',
        assignedSubjects: 2
    },
    {
        id: 4,
        facultyName: 'Dr. John von Neumann',
        role: 'Visiting Lecturer',
        status: 'Part-time',
        assignedSubjects: 2
    },
];

export function FacultyAccountsPage() {
    const [faculty] = useState(mockFaculty);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        facultyRole: '',
        assignedProgram: '',
        password: '',
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
        console.log('Creating Faculty Account:', formData);
        setIsModalOpen(false);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            gender: '',
            facultyRole: '',
            assignedProgram: '',
            password: '',
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            gender: '',
            facultyRole: '',
            assignedProgram: '',
            password: '',
        });
    };

    const getStatusVariant = (status) => {
        if (status === 'Regular') return 'success';
        if (status === 'Part-time') return 'active';
        return 'default';
    };

    const columns = [
        {
            header: 'Faculty Name',
            accessor: 'facultyName',
            width: '30%',
        },
        {
            header: 'Role',
            accessor: 'role',
            width: '25%',
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '15%',
            align: 'center',
            render: (value) => (
                <Badge variant={getStatusVariant(value)}>
                    {value}
                </Badge>
            ),
        },
        {
            header: 'Assigned Subjects',
            accessor: 'assignedSubjects',
            width: '15%',
            align: 'center',
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '15%',
            align: 'center',
            render: () => (
                <button className={styles.editButton}>Edit</button>
            ),
        },
    ];

    return (
        <DashboardLayout
            role="Dept. Chair"
            userName="Department Chair"
            notificationCount={2}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Faculty Accounts</h1>
                        <p className={styles.subtitle}>Manage faculty accounts and assignments.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <UserPlus size={18} />
                        Create Faculty Account
                    </Button>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={faculty} />
                </div>

                {/* Create Faculty Account Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Create Faculty Account"
                >
                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        <div className={styles.formRow}>
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
                        </div>

                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="john.doe@university.edu"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Gender <span className={styles.required}>*</span>
                            </label>
                            <select
                                name="gender"
                                className={styles.select}
                                value={formData.gender}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Faculty Role <span className={styles.required}>*</span>
                            </label>
                            <select
                                name="facultyRole"
                                className={styles.select}
                                value={formData.facultyRole}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Role</option>
                                <option value="Professor">Professor</option>
                                <option value="Associate Professor">Associate Professor</option>
                                <option value="Assistant Professor">Assistant Professor</option>
                                <option value="Instructor">Instructor</option>
                                <option value="Visiting Lecturer">Visiting Lecturer</option>
                                <option value="Program Chair">Program Chair</option>
                            </select>
                        </div>

                        {/* Conditional Program Assignment Field */}
                        {formData.facultyRole === 'Program Chair' && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Assigned Program <span className={styles.required}>*</span>
                                </label>
                                <select
                                    name="assignedProgram"
                                    className={styles.select}
                                    value={formData.assignedProgram}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Program</option>
                                    <option value="BSCS">BSCS - Bachelor of Science in Computer Science</option>
                                    <option value="BSIT">BSIT - Bachelor of Science in Information Technology</option>
                                    <option value="ACT">ACT - Associate in Computer Technology</option>
                                </select>
                            </div>
                        )}

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
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
