import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import { ToastContainer } from '@/components/Toast/Toast';
import styles from './FacultyAccountsPage.module.css';

export function FacultyAccountsPage() {
    const [faculty, setFaculty] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userInfo, setUserInfo] = useState({
        collegeId: null,
        fullName: '',
        userId: null
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
        const collegeId = sessionStorage.getItem('collegeId');
        const fullName = sessionStorage.getItem('fullName') || 'College Dean';
        const userId = sessionStorage.getItem('userId');
        setUserInfo({ collegeId, fullName, userId });
    }, []);

    useEffect(() => {
        if (userInfo.collegeId) {
            fetchFaculty();
            fetchPrograms();
        }
    }, [userInfo.collegeId, userInfo.userId]);

    const fetchPrograms = async () => {
        try {
            // Fetch programs based on the college
            const response = await fetch(`http://localhost:5000/api/qce/programs?college_id=${userInfo.collegeId}`);
            const data = await response.json();
            if (data.success) {
                setPrograms(data.data);
            }
        } catch (error) {
            console.error('Error fetching programs:', error);
        }
    };



    const fetchFaculty = async () => {
        try {
            // Fetch faculty based on the college
            const response = await fetch(`http://localhost:5000/api/qce/faculty?college_id=${userInfo.collegeId}`);
            const data = await response.json();
            if (data.success) {
                // Map API data to table format
                const mappedFaculty = data.data.map(f => ({
                    id: f.id,
                    facultyName: f.name,
                    firstName: f.firstName,
                    middleInitial: f.middleInitial || '',
                    lastName: f.lastName,
                    email: f.email,
                    gender: f.gender,
                    role: f.role,
                    status: f.status,
                    assignedSubjects: f.teachingLoad || 0, // Using teaching load for Dean view or similar
                    assignedPrograms: f.assignedPrograms || [],
                    departmentId: f.department_id
                }));
                setFaculty(mappedFaculty);
            }
        } catch (error) {
            console.error('Error fetching faculty:', error);
        }
    };

    const [formData, setFormData] = useState({
        firstName: '',
        middleInitial: '',
        lastName: '',
        email: '',
        gender: '',
        employmentStatus: '',
        facultyRole: '',
        assignedPrograms: [],
        departmentId: '',
        password: '',
    });

    // Search and Pagination Logic
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter faculty based on search query
    const filteredFaculty = faculty.filter(f =>
        f.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate pagination logic
    const totalPages = Math.ceil(filteredFaculty.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentFaculty = filteredFaculty.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProgramCheckbox = (programCode) => {
        setFormData(prev => ({
            ...prev,
            assignedPrograms: prev.assignedPrograms.includes(programCode)
                ? prev.assignedPrograms.filter(p => p !== programCode)
                : [...prev.assignedPrograms, programCode]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userId = sessionStorage.getItem('userId'); // Dean's ID

            const response = await fetch('http://localhost:5000/api/qce/faculty', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    role: formData.facultyRole,
                    // No departmentId by default for Dean, unless we want to let them select one, 
                    // but usually they assign to college. The API handles college assignment via creatorType.
                    qceId: userId,
                    creatorType: 'faculty' // Use faculty lookup for college_id etc
                }),
            });

            const result = await response.json();

            if (result.success) {
                addToast('Faculty created successfully', 'success');
                setIsModalOpen(false);
                setFormData({
                    firstName: '',
                    middleInitial: '',
                    lastName: '',
                    email: '',
                    gender: '',
                    employmentStatus: '',
                    facultyRole: '',
                    assignedPrograms: [],
                    password: '',
                });
                fetchFaculty(); // Refresh list
            } else {
                addToast(result.message || 'Failed to create faculty', 'error');
            }
        } catch (error) {
            console.error('Error creating faculty:', error);
            addToast('An error occurred', 'error');
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({
            firstName: '',
            middleInitial: '',
            lastName: '',
            email: '',
            gender: '',
            employmentStatus: '',
            facultyRole: '',
            assignedPrograms: [],
            departmentId: '',
            password: '',
        });
    };

    const getStatusVariant = (status) => {
        if (status === 'Regular') return 'success';
        if (status === 'Part-time') return 'active';
        return 'default';
    };

    // Modals state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState(null);

    const [editFormData, setEditFormData] = useState({
        firstName: '',
        middleInitial: '',
        lastName: '',
        email: '',
        gender: '',
        employmentStatus: '',
        facultyRole: '',
        assignedPrograms: [],
        departmentId: ''
    });

    const handleEditClick = (faculty) => {
        setSelectedFaculty(faculty);
        setEditFormData({
            firstName: faculty.firstName || '',
            middleInitial: faculty.middleInitial || '',
            lastName: faculty.lastName || '',
            email: faculty.email || '',
            gender: faculty.gender || '',
            employmentStatus: faculty.status,
            facultyRole: faculty.role,
            assignedPrograms: faculty.assignedPrograms || [],
            departmentId: faculty.departmentId || ''
        });
        setEditModalOpen(true);
    };

    const handleEditProgramCheckbox = (programCode) => {
        setEditFormData(prev => ({
            ...prev,
            assignedPrograms: prev.assignedPrograms.includes(programCode)
                ? prev.assignedPrograms.filter(p => p !== programCode)
                : [...prev.assignedPrograms, programCode]
        }));
    };

    const handleDeleteClick = (faculty) => {
        setSelectedFaculty(faculty);
        setDeleteModalOpen(true);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateFaculty = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/qce/faculty/${selectedFaculty.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData)
            });
            const result = await response.json();
            if (result.success) {
                addToast('Faculty updated successfully', 'success');
                setEditModalOpen(false);
                fetchFaculty();
            } else {
                addToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Error updating faculty:', error);
            addToast('Error updating faculty', 'error');
        }
    };

    const handleDeleteFaculty = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/faculty/${selectedFaculty.id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (result.success) {
                addToast('Faculty deleted successfully', 'success');
                setDeleteModalOpen(false);
                fetchFaculty();
            } else {
                addToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Error deleting faculty:', error);
            addToast('Error deleting faculty', 'error');
        }
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
            header: 'Teaching Load',
            accessor: 'assignedSubjects', // Mapping to teachingLoad in API response logic
            width: '15%',
            align: 'center',
            render: (value) => value
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '15%',
            align: 'center',
            render: (_, faculty) => (
                <div className={styles.actions}>
                    <button
                        className={styles.iconButton}
                        title="Edit"
                        onClick={() => handleEditClick(faculty)}
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        className={styles.iconButton}
                        title="Delete"
                        onClick={() => handleDeleteClick(faculty)}
                        disabled={faculty.role === 'Department Chair' && faculty.id === userInfo.userId} // Prevent self-delete if applicable
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout
            role="College Dean"
            userName={userInfo.fullName}
            notificationCount={3}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Faculty Accounts</h1>
                        <p className={styles.subtitle}>Manage faculty accounts within the college.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <UserPlus size={18} />
                        Create Faculty Account
                    </Button>
                </div>

                <div className={styles.controls}>
                    <div className={styles.searchContainer}>
                        <Input
                            placeholder="Search faculty..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={Search}
                        />
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={currentFaculty} />

                    {filteredFaculty.length > 0 && (
                        <div className={styles.pagination}>
                            <div className={styles.pageInfo}>
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredFaculty.length)} of {filteredFaculty.length} entries
                            </div>
                            <div className={styles.paginationControls}>
                                <button
                                    className={styles.pageButton}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                        return page === 1 ||
                                            page === totalPages ||
                                            Math.abs(page - currentPage) <= 1;
                                    })
                                    .map((page, index, array) => {
                                        const prevPage = array[index - 1];
                                        const showEllipsis = prevPage && page - prevPage > 1;

                                        return (
                                            <React.Fragment key={page}>
                                                {showEllipsis && <span className={styles.ellipsis}>...</span>}
                                                <button
                                                    className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </button>
                                            </React.Fragment>
                                        );
                                    })
                                }

                                <button
                                    className={styles.pageButton}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
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
                                label="M.I."
                                name="middleInitial"
                                type="text"
                                placeholder="M"
                                maxLength={1}
                                value={formData.middleInitial}
                                onChange={handleInputChange}
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
                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                placeholder="john.doe@university.edu"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className={styles.formRow}>
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
                                    Employment Status <span className={styles.required}>*</span>
                                </label>
                                <select
                                    name="employmentStatus"
                                    className={styles.select}
                                    value={formData.employmentStatus}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Status</option>
                                    <option value="Regular">Regular</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contractual">Contractual</option>
                                    <option value="Temporary">Temporary</option>
                                </select>
                            </div>
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
                                <option value="Department Chair">Department Chair</option>
                                <option value="Program Chair">Program Chair</option>
                                <option value="Professor">Professor</option>
                                <option value="Associate Professor">Associate Professor</option>
                                <option value="Assistant Professor">Assistant Professor</option>
                                <option value="Instructor">Instructor</option>
                                <option value="Visiting Lecturer">Visiting Lecturer</option>
                            </select>
                        </div>

                        {/* Conditional Program Assignment Field */}
                        {formData.facultyRole === 'Program Chair' && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Assigned Programs <span className={styles.required}>*</span>
                                </label>
                                <div className={styles.checkboxGroup}>
                                    {programs.length === 0 ? (
                                        <p className={styles.helperText}>No programs available.</p>
                                    ) : (
                                        programs.map(program => (
                                            <label key={program.id} className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    className={styles.checkbox}
                                                    checked={formData.assignedPrograms.includes(program.code)}
                                                    onChange={() => handleProgramCheckbox(program.code)}
                                                />
                                                <span>{program.code} - {program.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {formData.assignedPrograms.length === 0 && (
                                    <span className={styles.helperText}>Please select at least one program</span>
                                )}
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

                {/* Edit Faculty Modal */}
                <Modal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    title="Edit Faculty Account"
                >
                    <form onSubmit={handleUpdateFaculty} className={styles.modalForm}>
                        <div className={styles.formRow}>
                            <Input
                                label="First Name"
                                name="firstName"
                                type="text"
                                value={editFormData.firstName}
                                onChange={handleEditInputChange}
                                required
                            />
                            <Input
                                label="M.I."
                                name="middleInitial"
                                type="text"
                                maxLength={1}
                                value={editFormData.middleInitial}
                                onChange={handleEditInputChange}
                            />
                            <Input
                                label="Last Name"
                                name="lastName"
                                type="text"
                                value={editFormData.lastName}
                                onChange={handleEditInputChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                value={editFormData.email}
                                onChange={handleEditInputChange}
                                required
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Gender <span className={styles.required}>*</span>
                                </label>
                                <select
                                    name="gender"
                                    className={styles.select}
                                    value={editFormData.gender}
                                    onChange={handleEditInputChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Employment Status <span className={styles.required}>*</span>
                                </label>
                                <select
                                    name="employmentStatus"
                                    className={styles.select}
                                    value={editFormData.employmentStatus}
                                    onChange={handleEditInputChange}
                                    required
                                >
                                    <option value="">Select Status</option>
                                    <option value="Regular">Regular</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contractual">Contractual</option>
                                    <option value="Temporary">Temporary</option>
                                </select>
                            </div>
                        </div>



                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Faculty Role <span className={styles.required}>*</span>
                            </label>
                            <select
                                name="facultyRole"
                                className={styles.select}
                                value={editFormData.facultyRole}
                                onChange={handleEditInputChange}
                                required
                            >
                                <option value="">Select Role</option>
                                <option value="Department Chair">Department Chair</option>
                                <option value="Program Chair">Program Chair</option>
                                <option value="Professor">Professor</option>
                                <option value="Associate Professor">Associate Professor</option>
                                <option value="Assistant Professor">Assistant Professor</option>
                                <option value="Instructor">Instructor</option>
                                <option value="Visiting Lecturer">Visiting Lecturer</option>
                            </select>
                        </div>

                        {/* Conditional Program Assignment Field for Edit */}
                        {editFormData.facultyRole === 'Program Chair' && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Assigned Programs <span className={styles.required}>*</span>
                                </label>
                                <div className={styles.checkboxGroup}>
                                    {programs.length === 0 ? (
                                        <p className={styles.helperText}>No programs available.</p>
                                    ) : (
                                        programs.map(program => (
                                            <label key={program.id} className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    className={styles.checkbox}
                                                    checked={editFormData.assignedPrograms.includes(program.code)}
                                                    onChange={() => handleEditProgramCheckbox(program.code)}
                                                />
                                                <span>{program.code} - {program.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {editFormData.assignedPrograms.length === 0 && (
                                    <span className={styles.helperText}>Please select at least one program</span>
                                )}
                            </div>
                        )}

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
                    title="Delete Faculty Account"
                >
                    <div className={styles.deleteConfirmation}>
                        <p>Are you sure you want to delete <strong>{selectedFaculty?.facultyName}</strong>?</p>
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
                                onClick={handleDeleteFaculty}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </Modal>

                <ToastContainer toasts={toasts} removeToast={removeToast} />
            </div >
        </DashboardLayout >
    );
}
