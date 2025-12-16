import React, { useState, useEffect } from 'react';
import { Plus, PenSquare, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { Input } from '@/components/Input/Input';
import { Modal } from '@/components/Modal/Modal';
import { ToastContainer } from '@/components/Toast/Toast';
import styles from './FacultyPage.module.css';

export function FacultyPage() {
    const [faculty, setFaculty] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: '',
        role: '',
        employmentStatus: '',
        email: '',
        email: '',
        password: '',
        assignedPrograms: [],
    });
    const [programs, setPrograms] = useState([]);

    // Toast notification helpers
    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, duration: 3000 }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Fetch faculty on mount
    useEffect(() => {
        fetchFaculty();
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
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
        }
    };

    const fetchFaculty = async () => {
        setIsLoading(true);
        try {
            // Get user from localStorage to find college_id if possible
            const userStr = localStorage.getItem('user');
            let queryParams = '';
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.college_id) {
                    queryParams = `?college_id=${user.college_id}`;
                }
            }

            const response = await fetch(`http://localhost:5000/api/qce/faculty${queryParams}`);
            const data = await response.json();

            if (data.success) {
                setFaculty(data.data);
            } else {
                console.error('Failed to fetch faculty:', data.message);
            }
        } catch (error) {
            console.error('Error fetching faculty:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProgramChange = (programCode) => {
        setFormData(prev => {
            const current = prev.assignedPrograms || [];
            if (current.includes(programCode)) {
                return { ...prev, assignedPrograms: current.filter(c => c !== programCode) };
            } else {
                return { ...prev, assignedPrograms: [...current, programCode] };
            }
        });
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

        // Validate program selection if Program Chair
        if (formData.role === 'Program Chair' && (!formData.assignedPrograms || formData.assignedPrograms.length === 0)) {
            addToast('Please select at least one program', 'error');
            return;
        }

        try {
            // Get QCE user ID from localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                addToast('User session not found. Please login again.', 'error');
                return;
            }

            const user = JSON.parse(userStr);

            const response = await fetch('http://localhost:5000/api/qce/faculty', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    assignedPrograms: formData.role === 'Program Chair' ? formData.assignedPrograms : [],
                    qceId: user.id // Pass QCE ID to backend
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Close modal and reset form
                setIsModalOpen(false);
                setFormData({
                    firstName: '',
                    lastName: '',
                    gender: '',
                    role: '',
                    employmentStatus: '',
                    email: '',
                    password: '',
                    assignedPrograms: [],
                });
                // Refresh list
                fetchFaculty();
                addToast('Faculty member added successfully!', 'success');
            } else {
                addToast(result.message || 'Failed to add faculty member', 'error');
            }
        } catch (error) {
            console.error('Error adding faculty:', error);
            addToast('An error occurred. Please try again.', 'error');
        }
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
            assignedPrograms: [],
        });
    };

    const handleEdit = (facultyMember) => {
        setSelectedFaculty(facultyMember);
        setFormData({
            firstName: facultyMember.firstName,
            lastName: facultyMember.lastName,
            gender: facultyMember.gender,
            role: facultyMember.role,
            employmentStatus: facultyMember.status,
            email: facultyMember.email,
            password: '', // Don't populate password
            assignedPrograms: facultyMember.assignedPrograms || [],
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        // Validate program selection if Program Chair
        if (formData.role === 'Program Chair' && (!formData.assignedPrograms || formData.assignedPrograms.length === 0)) {
            addToast('Please select at least one program', 'error');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/qce/faculty/${selectedFaculty.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    gender: formData.gender,
                    employmentStatus: formData.employmentStatus,
                    facultyRole: formData.role,
                    assignedPrograms: formData.role === 'Program Chair' ? formData.assignedPrograms : [],
                }),
            });

            const result = await response.json();

            if (result.success) {
                setIsEditModalOpen(false);
                setSelectedFaculty(null);
                setFormData({
                    firstName: '',
                    lastName: '',
                    gender: '',
                    role: '',
                    employmentStatus: '',
                    email: '',
                    password: '',
                    assignedPrograms: [],
                });
                fetchFaculty();
                addToast('Faculty member updated successfully!', 'success');
            } else {
                addToast(result.message || 'Failed to update faculty member', 'error');
            }
        } catch (error) {
            console.error('Error updating faculty:', error);
            addToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleEditCancel = () => {
        setIsEditModalOpen(false);
        setSelectedFaculty(null);
        setFormData({
            firstName: '',
            lastName: '',
            gender: '',
            role: '',
            employmentStatus: '',
            email: '',
            password: '',
            assignedPrograms: [],
        });
    };

    const handleDeleteClick = (facultyMember) => {
        setSelectedFaculty(facultyMember);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/faculty/${selectedFaculty.id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                setIsDeleteModalOpen(false);
                setSelectedFaculty(null);
                fetchFaculty();
                addToast('Faculty member deleted successfully!', 'success');
            } else {
                addToast(result.message || 'Failed to delete faculty member', 'error');
            }
        } catch (error) {
            console.error('Error deleting faculty:', error);
            addToast('An error occurred. Please try again.', 'error');
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setSelectedFaculty(null);
    };

    const columns = [
        {
            header: 'Name',
            accessor: 'name',
            width: '25%',
        },
        {
            header: 'Email',
            accessor: 'email',
            width: '25%',
        },
        {
            header: 'Role',
            accessor: 'role',
            width: '20%',
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
            render: (value, row) => (
                <div className={styles.actionButtons}>
                    <button
                        className={styles.actionButton}
                        onClick={() => handleEdit(row)}
                        aria-label="Edit faculty"
                    >
                        <PenSquare size={16} />
                    </button>
                    <button
                        className={styles.actionButton}
                        onClick={() => handleDeleteClick(row)}
                        aria-label="Delete faculty"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    // Filter faculty based on search query
    const filteredFaculty = faculty.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    {isLoading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
                    ) : (
                        <Table columns={columns} data={filteredFaculty} />
                    )}
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

                        {formData.role === 'Program Chair' && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Assigned Programs<span className={styles.required}>*</span>
                                </label>
                                <div className={styles.programSelection}>
                                    {programs.length > 0 ? (
                                        programs.map(program => (
                                            <label key={program.id} className={styles.programCheckbox}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.assignedPrograms?.includes(program.code)}
                                                    onChange={() => handleProgramChange(program.code)}
                                                />
                                                {program.code} - {program.name}
                                            </label>
                                        ))
                                    ) : (
                                        <div style={{ padding: '0.5rem', color: '#666', fontSize: '0.875rem' }}>
                                            No programs available in this college.
                                        </div>
                                    )}
                                </div>
                                {(!formData.assignedPrograms || formData.assignedPrograms.length === 0) && (
                                    <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                        Please select at least one program
                                    </span>
                                )}
                            </div>
                        )}

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

                {/* Edit Faculty Member Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={handleEditCancel}
                    title="Edit Faculty Member"
                >
                    <form onSubmit={handleEditSubmit} className={styles.modalForm}>
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

                        {formData.role === 'Program Chair' && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Assigned Programs<span className={styles.required}>*</span>
                                </label>
                                <div className={styles.programSelection}>
                                    {programs.length > 0 ? (
                                        programs.map(program => (
                                            <label key={program.id} className={styles.programCheckbox}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.assignedPrograms?.includes(program.code)}
                                                    onChange={() => handleProgramChange(program.code)}
                                                />
                                                {program.code} - {program.name}
                                            </label>
                                        ))
                                    ) : (
                                        <div style={{ padding: '0.5rem', color: '#666', fontSize: '0.875rem' }}>
                                            No programs available in this college.
                                        </div>
                                    )}
                                </div>
                                {(!formData.assignedPrograms || formData.assignedPrograms.length === 0) && (
                                    <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                        Please select at least one program
                                    </span>
                                )}
                            </div>
                        )}

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
                                Update Faculty Member
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={handleDeleteCancel}
                    title="Delete Faculty Member"
                >
                    <div className={styles.deleteModalContent}>
                        <p>Are you sure you want to delete <strong>{selectedFaculty?.name}</strong>?</p>
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


                {/* Toast Notifications */}
                <ToastContainer toasts={toasts} removeToast={removeToast} />
            </div>
        </DashboardLayout>
    );
}
