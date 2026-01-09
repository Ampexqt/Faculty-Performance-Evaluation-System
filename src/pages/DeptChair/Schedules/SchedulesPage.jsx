import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import { Select } from '@/components/Select/Select';
import { ToastContainer } from '@/components/Toast/Toast';
import styles from './SchedulesPage.module.css';

export function SchedulesPage() {
    const [schedules, setSchedules] = useState([]);
    const [subjectsList, setSubjectsList] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [programsList, setProgramsList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [userInfo, setUserInfo] = useState({
        departmentId: null,
        collegeId: null,
        fullName: ''
    });

    const [formData, setFormData] = useState({
        subjectId: '',
        programCode: '',
        yearLevel: '',
        section: '',
        facultyId: '',
    });

    const [editFormData, setEditFormData] = useState({
        subjectId: '',
        yearLevel: '',
        section: '',
        facultyId: '',
    });

    // Search and Pagination Logic
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Filter schedules based on search query
    const filteredSchedules = schedules.filter(s =>
        s.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.descriptiveTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.faculty.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate pagination logic
    const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentSchedules = filteredSchedules.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    useEffect(() => {
        const departmentId = localStorage.getItem('departmentId');
        const fullName = localStorage.getItem('fullName') || 'Department Chair';
        const userId = localStorage.getItem('userId');

        if (userId) {
            fetchUserCollege(userId, departmentId, fullName);
        } else {
            setUserInfo({ departmentId, collegeId: null, fullName });
            if (departmentId) fetchPrograms(departmentId);
        }
    }, []);

    const fetchUserCollege = async (userId, departmentId, fullName) => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/faculty`);
            const data = await response.json();
            if (data.success) {
                let currentUser = data.data.find(f => f.id === parseInt(userId));

                if (currentUser) {
                    setUserInfo({
                        departmentId: currentUser.department_id,
                        collegeId: currentUser.college_id,
                        fullName: currentUser.name || fullName
                    });
                    if (currentUser.department_id) {
                        fetchPrograms(currentUser.department_id);
                    }
                } else {
                    setUserInfo({ departmentId, collegeId: null, fullName });
                }
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            setUserInfo({ departmentId, collegeId: null, fullName });
        }
    };

    const fetchPrograms = async (deptId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/programs?department_id=${deptId}`);
            const data = await response.json();
            if (data.success) {
                setProgramsList(data.data);
            }
        } catch (error) {
            console.error('Error fetching programs:', error);
        }
    };

    useEffect(() => {
        if (userInfo.departmentId || userInfo.collegeId) {
            fetchAssignments();
            fetchSubjects();

            // Prioritize college-wide faculty, fallback to department-only
            if (userInfo.collegeId) {
                fetchFaculty(userInfo.collegeId, 'college_id');
            } else if (userInfo.departmentId) {
                fetchFaculty(userInfo.departmentId, 'department_id');
            }
        }
    }, [userInfo.departmentId, userInfo.collegeId]);

    const fetchAssignments = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/subjects/assignments?department_id=${userInfo.departmentId}`);
            const data = await response.json();
            if (data.success) {
                setSchedules(data.data.map(item => ({
                    id: item.id,
                    subjectId: item.subjectId,
                    facultyId: item.facultyId,
                    subject: item.subjectCode,
                    descriptiveTitle: item.subjectName,
                    section: item.section,
                    faculty: item.facultyName
                })));
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/subjects?department_id=${userInfo.departmentId}`);
            const data = await response.json();
            if (data.success) {
                setSubjectsList(data.data);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchFaculty = async (id, type = 'college_id') => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/faculty?${type}=${id}`);
            const data = await response.json();
            if (data.success) {
                // Filter out Dean and Department Chair
                const filteredFaculty = data.data.filter(f =>
                    f.role !== 'Dean' && f.role !== 'Department Chair'
                );
                setFacultyList(filteredFaculty);
            }
        } catch (error) {
            console.error('Error fetching faculty:', error);
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

        if (!formData.programCode || !formData.yearLevel || !formData.section) {
            addToast('Program, Year Level, and Section are required', 'error');
            return;
        }

        // Construct strict section name: Program Code + Year + Section
        // e.g. "BSIT 2-B"
        const sectionName = `${formData.programCode} ${formData.yearLevel}-${formData.section}`;

        try {
            // Check for duplicates first (frontend check only for UX, backend usually validates too)
            const exists = schedules.some(s =>
                s.subjectId === parseInt(formData.subjectId) &&
                s.section === sectionName
            );

            if (exists) {
                addToast('This subject is already assigned to this section', 'error');
                return;
            }

            const response = await fetch('http://localhost:5000/api/qce/subjects/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subjectId: formData.subjectId,
                    facultyId: formData.facultyId,
                    section: sectionName
                })
            });
            const result = await response.json();
            if (result.success) {
                addToast('Subject assigned successfully', 'success');
                setIsModalOpen(false);
                setFormData({ subjectId: '', programCode: '', yearLevel: '', section: '', facultyId: '' });
                fetchAssignments();
            } else {
                addToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Error assigning subject:', error);
            addToast('Error assigning subject', 'error');
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({
            subjectId: '',
            programCode: '',
            yearLevel: '',
            section: '',
            facultyId: '',
        });
    };

    const handleEditClick = (assignment) => {
        setSelectedAssignment(assignment);
        // Parse section (e.g., "4-B" -> yearLevel: "4", section: "B")
        const [yearLevel, section] = assignment.section.split('-');
        setEditFormData({
            subjectId: assignment.subjectId || '',
            yearLevel: yearLevel || '',
            section: section || '',
            facultyId: assignment.facultyId || ''
        });
        setEditModalOpen(true);
    };

    const handleDeleteClick = (assignment) => {
        setSelectedAssignment(assignment);
        setDeleteModalOpen(true);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateAssignment = async (e) => {
        e.preventDefault();
        const sectionName = `${editFormData.yearLevel}-${editFormData.section}`;

        try {
            const response = await fetch(`http://localhost:5000/api/qce/subjects/assignments/${selectedAssignment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subjectId: editFormData.subjectId,
                    facultyId: editFormData.facultyId,
                    section: sectionName
                })
            });
            const result = await response.json();
            if (result.success) {
                addToast('Assignment updated successfully', 'success');
                setEditModalOpen(false);
                fetchAssignments();
            } else {
                addToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Error updating assignment:', error);
            addToast('Error updating assignment', 'error');
        }
    };

    const handleDeleteAssignment = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/subjects/assignments/${selectedAssignment.id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (result.success) {
                addToast('Assignment deleted successfully', 'success');
                setDeleteModalOpen(false);
                fetchAssignments();
            } else {
                addToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Error deleting assignment:', error);
            addToast('Error deleting assignment', 'error');
        }
    };

    const columns = [
        {
            header: 'Subject',
            accessor: 'subject',
            width: '15%',
        },
        {
            header: 'Descriptive Title',
            accessor: 'descriptiveTitle',
            width: '35%',
        },
        {
            header: 'Section',
            accessor: 'section',
            width: '20%',
        },
        {
            header: 'Faculty',
            accessor: 'faculty',
            width: '25%',
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '10%',
            render: (value, assignment) => (
                <div className={styles.actionButtons}>
                    <button
                        className={styles.iconButton}
                        onClick={() => handleEditClick(assignment)}
                        title="Edit"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        className={styles.iconButton}
                        onClick={() => handleDeleteClick(assignment)}
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
                        <h1 className={styles.title}>Assigned Subjects</h1>
                        <p className={styles.subtitle}>View assigned subjects to faculty members.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Assign Subject
                    </Button>
                </div>


                <div className={styles.controls}>
                    <div className={styles.searchContainer}>
                        <Input
                            placeholder="Search subjects or faculty..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={Search}
                        />
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={currentSchedules} />

                    {filteredSchedules.length > 0 && (
                        <div className={styles.pagination}>
                            <div className={styles.pageInfo}>
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSchedules.length)} of {filteredSchedules.length} entries
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
                                        // Show first, last, current, and surrounding pages
                                        return page === 1 ||
                                            page === totalPages ||
                                            Math.abs(page - currentPage) <= 1;
                                    })
                                    .map((page, index, array) => {
                                        // Add ellipsis if there are gaps
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

                {/* Assign Subject Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Assign Subject"
                >
                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        {/* Subject Dropdown */}
                        <div className={styles.formGroup}>
                            <Select
                                label="Subject"
                                name="subjectId"
                                placeholder="Select Subject"
                                value={formData.subjectId}
                                onChange={handleInputChange}
                                options={subjectsList.map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
                                searchable
                                required
                            />
                        </div>

                        {/* Program Dropdown */}
                        <div className={styles.formGroup}>
                            <Select
                                label="Program"
                                name="programCode"
                                placeholder="Select Program"
                                value={formData.programCode}
                                onChange={handleInputChange}
                                options={programsList.map(p => ({ value: p.code, label: p.name ? `${p.code} - ${p.name}` : p.code }))}
                                searchable
                                required
                            />
                        </div>

                        {/* Year Level and Section Row */}
                        <div className={styles.formRow}>
                            {/* Year Level Dropdown */}
                            <div className={styles.formGroup}>
                                <Select
                                    label="Year Level"
                                    name="yearLevel"
                                    placeholder="Select Year"
                                    value={formData.yearLevel}
                                    onChange={handleInputChange}
                                    options={[
                                        { value: '1', label: '1st Year' },
                                        { value: '2', label: '2nd Year' },
                                        { value: '3', label: '3rd Year' },
                                        { value: '4', label: '4th Year' }
                                    ]}
                                    required
                                />
                            </div>

                            {/* Section Dropdown */}
                            <div className={styles.formGroup}>
                                <Select
                                    label="Section"
                                    name="section"
                                    placeholder="Select Section"
                                    value={formData.section}
                                    onChange={handleInputChange}
                                    options={['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(s => ({ value: s, label: s }))}
                                    required
                                />
                            </div>
                        </div>

                        {/* Faculty Dropdown */}
                        <div className={styles.formGroup}>
                            <Select
                                label="Faculty"
                                name="facultyId"
                                placeholder="Select Faculty"
                                value={formData.facultyId}
                                onChange={handleInputChange}
                                options={facultyList.map(f => ({ value: f.id, label: `${f.firstName} ${f.lastName} - ${f.role}` }))}
                                searchable
                                required
                            />
                        </div>

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
                                Assign Subject
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Edit Assignment Modal */}
                <Modal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    title="Edit Assignment"
                >
                    <form onSubmit={handleUpdateAssignment} className={styles.modalForm}>
                        {/* Subject Dropdown */}
                        <div className={styles.formGroup}>
                            <Select
                                label="Subject"
                                name="subjectId"
                                placeholder="Select Subject"
                                value={editFormData.subjectId}
                                onChange={handleEditInputChange}
                                options={subjectsList.map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
                                searchable
                                required
                            />
                        </div>

                        {/* Year Level and Section Row */}
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <Select
                                    label="Year Level"
                                    name="yearLevel"
                                    placeholder="Select Year"
                                    value={editFormData.yearLevel}
                                    onChange={handleEditInputChange}
                                    options={[
                                        { value: '1', label: '1st Year' },
                                        { value: '2', label: '2nd Year' },
                                        { value: '3', label: '3rd Year' },
                                        { value: '4', label: '4th Year' }
                                    ]}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <Select
                                    label="Section"
                                    name="section"
                                    placeholder="Select Section"
                                    value={editFormData.section}
                                    onChange={handleEditInputChange}
                                    options={['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(s => ({ value: s, label: s }))}
                                    required
                                />
                            </div>
                        </div>

                        {/* Faculty Dropdown */}
                        <div className={styles.formGroup}>
                            <Select
                                label="Faculty"
                                name="facultyId"
                                placeholder="Select Faculty"
                                value={editFormData.facultyId}
                                onChange={handleEditInputChange}
                                options={facultyList.map(f => ({ value: f.id, label: `${f.firstName} ${f.lastName} - ${f.role}` }))}
                                searchable
                                required
                            />
                        </div>

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
                    title="Delete Assignment"
                >
                    <div className={styles.deleteConfirmation}>
                        <p>Are you sure you want to delete this assignment?</p>
                        <p><strong>{selectedAssignment?.subject} - {selectedAssignment?.descriptiveTitle}</strong></p>
                        <p>Section: <strong>{selectedAssignment?.section}</strong></p>
                        <p>Faculty: <strong>{selectedAssignment?.faculty}</strong></p>
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
                                onClick={handleDeleteAssignment}
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
