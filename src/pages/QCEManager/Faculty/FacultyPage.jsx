import React, { useState } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { Input } from '@/components/Input/Input';
import { Modal } from '@/components/Modal/Modal';
import styles from './FacultyPage.module.css';

// Mock data
const mockFaculty = [
    {
        id: 1,
        name: 'Prof. Alan Turing',
        department: 'Computer Science',
        status: 'Regular',
        teachingLoad: '18 units'
    },
    {
        id: 2,
        name: 'Prof. Ada Lovelace',
        department: 'Information Technology',
        status: 'Regular',
        teachingLoad: '21 units'
    },
    {
        id: 3,
        name: 'Inst. Linus Torvalds',
        department: 'Computer Science',
        status: 'Part-time',
        teachingLoad: '9 units'
    },
];

export function FacultyPage() {
    const [faculty] = useState(mockFaculty);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: '',
        role: '',
        employmentStatus: '',
        email: '',
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
        console.log('Adding faculty member:', formData);
        setIsModalOpen(false);
        setFormData({
            firstName: '',
            lastName: '',
            gender: '',
            role: '',
            employmentStatus: '',
            email: '',
            password: '',
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({
            firstName: '',
            lastName: '',
            gender: '',
            role: '',
            employmentStatus: '',
            email: '',
            password: '',
        });
    };

    const columns = [
        {
            header: 'Name',
            accessor: 'name',
            width: '30%',
        },
        {
            header: 'Department',
            accessor: 'department',
            width: '25%',
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '20%',
            align: 'center',
            render: (value) => (
                <Badge variant={value === 'Regular' ? 'active' : 'warning'}>
                    {value}
                </Badge>
            ),
        },
        {
            header: 'Teaching Load',
            accessor: 'teachingLoad',
            width: '15%',
            align: 'center',
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '10%',
            align: 'center',
            render: () => (
                <button className={styles.actionButton} aria-label="More actions">
                    <MoreHorizontal size={16} />
                </button>
            ),
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
                        <h1 className={styles.title}>Faculty Directory</h1>
                        <p className={styles.subtitle}>Manage faculty members and their teaching assignments.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Add Faculty Member
                    </Button>
                </div>

                <div className={styles.searchContainer}>
                    <Input
                        type="text"
                        placeholder="Search faculty name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={faculty} />
                </div>

                {/* Add Faculty Member Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Add Faculty Member"
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

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Gender<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Role<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select role</option>
                                <option value="Dean">Dean</option>
                                <option value="Visiting Lecturer">Visiting Lecturer</option>
                                <option value="Program Chair">Program Chair</option>
                                <option value="Department Chair">Department Chair</option>
                                <option value="J.O">J.O</option>
                                <option value="Professor">Professor</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Employment Status<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="employmentStatus"
                                value={formData.employmentStatus}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select employment status</option>
                                <option value="Regular">Regular</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contractual">Contractual</option>
                                <option value="Temporary">Temporary</option>
                            </select>
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
                                Add Faculty Member
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
