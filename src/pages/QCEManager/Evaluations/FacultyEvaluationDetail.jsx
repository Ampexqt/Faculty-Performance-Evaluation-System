import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast/Toast';
import styles from './FacultyEvaluationDetail.module.css';

// Function to generate random code
const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 3; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 3; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

export function FacultyEvaluationDetail() {
    const { facultyId } = useParams();
    const navigate = useNavigate();
    const [facultyData, setFacultyData] = useState(null);
    const [evaluationDetails, setEvaluationDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        role: ''
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [generatedCode, setGeneratedCode] = useState('');
    const { toasts, removeToast, success, error: showError } = useToast();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserInfo({
                fullName: user.full_name || 'QCE Manager',
                role: user.role
            });
        }
    }, []);

    useEffect(() => {
        if (facultyId) {
            fetchFacultyDetails();
        }
    }, [facultyId]);

    const fetchFacultyDetails = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/qce/faculty-evaluations/${facultyId}`);
            const data = await response.json();

            if (data.success) {
                setFacultyData(data.faculty);
                setEvaluationDetails(data.evaluations);
            }
        } catch (error) {
            console.error('Error fetching faculty details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClick = (row) => {
        setSelectedAssignment(row);
        setGeneratedCode(generateCode());
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setSelectedAssignment(null);
        setGeneratedCode('');
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();

        if (!selectedAssignment) return;

        try {
            const response = await fetch('http://localhost:5000/api/qce/subjects/assignments/generate-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    assignmentId: selectedAssignment.assignment_id, // Ensure your query returns assignment_id as id
                    code: generatedCode
                }),
            });

            const data = await response.json();

            if (data.success) {
                success('Evaluation code generated and activated successfully!');
                setIsModalOpen(false);
                setSelectedAssignment(null);
                setGeneratedCode('');
                // Refresh data
                fetchFacultyDetails();
            } else {
                showError('Failed to save code: ' + data.message);
            }
        } catch (err) {
            console.error('Error saving code:', err);
            showError('An error occurred while saving the code.');
        }
    };

    const columns = [
        {
            header: 'Subject',
            accessor: 'subject_name',
            width: '25%',
            render: (value, row) => (
                <div>
                    <div className={styles.subjectName}>{value}</div>
                    <div className={styles.subjectCode}>{row.subject_code}</div>
                </div>
            )
        },
        {
            header: 'Section',
            accessor: 'section',
            width: '15%',
        },
        {
            header: 'Year Level',
            accessor: 'year_level',
            width: '12%',
            align: 'center',
        },
        {
            header: 'Total Students',
            accessor: 'total_students',
            width: '12%',
            align: 'center',
        },
        {
            header: 'Evaluated',
            accessor: 'evaluated_count',
            width: '12%',
            align: 'center',
            render: (value, row) => (
                <span className={styles.evaluatedCount}>
                    {value} / {row.total_students}
                </span>
            )
        },
        {
            header: 'Progress',
            accessor: 'progress',
            width: '12%',
            align: 'center',
            render: (value) => (
                <div className={styles.progressCell}>
                    <span className={styles.progressText}>{value}%</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '12%',
            align: 'center',
            render: (value, row) => {
                if (value === 'Not Created') {
                    return (
                        <button
                            className={styles.createNowButton}
                            onClick={() => handleCreateClick(row)}
                        >
                            Create Evaluation
                        </button>
                    );
                }

                return (
                    <Badge
                        variant={value === 'Completed' ? 'success' : 'warning'}
                    >
                        {value}
                    </Badge>
                );
            }
        }
    ];

    if (isLoading) {
        return (
            <DashboardLayout role={userInfo.role} userName={userInfo.fullName}>
                <div className={styles.loadingContainer}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!facultyData) {
        return (
            <DashboardLayout role={userInfo.role} userName={userInfo.fullName}>
                <div className={styles.errorContainer}>
                    <p>Faculty not found</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            role={userInfo.role}
            userName={userInfo.fullName}
            notificationCount={5}
        >
            <div className={styles.page}>
                <button className={styles.backButton} onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    Back to Evaluations
                </button>

                {/* Faculty Header */}
                <div className={styles.facultyHeader}>
                    <div className={styles.avatarLarge}>
                        {facultyData.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className={styles.facultyHeaderInfo}>
                        <h1 className={styles.facultyName}>{facultyData.name}</h1>
                        <p className={styles.facultyPosition}>{facultyData.position}</p>
                        <p className={styles.facultyDepartment}>{facultyData.department_name}</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statCardIcon} style={{ background: '#dbeafe' }}>
                            <BookOpen size={24} color="#1e40af" />
                        </div>
                        <div className={styles.statCardContent}>
                            <span className={styles.statCardValue}>{facultyData.subjects_count || 0}</span>
                            <span className={styles.statCardLabel}>Subjects Handled</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statCardIcon} style={{ background: '#fef3c7' }}>
                            <Users size={24} color="#92400e" />
                        </div>
                        <div className={styles.statCardContent}>
                            <span className={styles.statCardValue}>{facultyData.sections_count || 0}</span>
                            <span className={styles.statCardLabel}>Sections Handled</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statCardIcon} style={{ background: '#d1fae5' }}>
                            <CheckCircle size={24} color="#065f46" />
                        </div>
                        <div className={styles.statCardContent}>
                            <span className={styles.statCardValue}>{facultyData.evaluated_count || 0}</span>
                            <span className={styles.statCardLabel}>Students Evaluated</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statCardIcon} style={{ background: '#fee2e2' }}>
                            <Clock size={24} color="#991b1b" />
                        </div>
                        <div className={styles.statCardContent}>
                            <span className={styles.statCardValue}>{facultyData.pending_count || 0}</span>
                            <span className={styles.statCardLabel}>Pending Evaluations</span>
                        </div>
                    </div>
                </div>

                {/* Evaluation Details Table */}
                <div className={styles.tableSection}>
                    <h2 className={styles.sectionTitle}>Evaluation Details by Subject & Section</h2>
                    <div className={styles.tableContainer}>
                        {evaluationDetails.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No evaluation data available</p>
                            </div>
                        ) : (
                            <Table columns={columns} data={evaluationDetails} />
                        )}
                    </div>
                </div>

                {/* Generate Code Modal using re-used logic */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleModalCancel}
                    title="Generate Evaluation Code"
                >
                    <form onSubmit={handleModalSubmit} className={styles.modalForm}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Faculty Role</label>
                            <input
                                type="text"
                                value={facultyData?.position || ''}
                                disabled
                                className={styles.inputDisabled}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Faculty Name</label>
                            <input
                                type="text"
                                value={facultyData?.name || ''}
                                disabled
                                className={styles.inputDisabled}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Subject</label>
                            <input
                                type="text"
                                value={selectedAssignment ? `${selectedAssignment.subject_code} - ${selectedAssignment.subject_name}` : ''}
                                disabled
                                className={styles.inputDisabled}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Section</label>
                            <input
                                type="text"
                                value={selectedAssignment ? selectedAssignment.section : ''}
                                disabled
                                className={styles.inputDisabled}
                            />
                        </div>

                        {generatedCode && (
                            <div className={styles.codeDisplay}>
                                <div className={styles.codeLabel}>GENERATED CODE</div>
                                <div className={styles.codeValue}>{generatedCode}</div>
                            </div>
                        )}

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleModalCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                            >
                                Save & Activate
                            </Button>
                        </div>
                    </form>
                </Modal>
                <ToastContainer toasts={toasts} removeToast={removeToast} />
            </div>
        </DashboardLayout>
    );
}
