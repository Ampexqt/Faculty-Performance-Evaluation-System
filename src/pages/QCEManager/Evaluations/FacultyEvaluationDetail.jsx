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
    const [userInfo, setUserInfo] = useState(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return {
                fullName: user.full_name || 'QCE Manager',
                role: user.role === 'Dean' ? 'College Dean' : user.role
            };
        }
        return {
            fullName: '',
            role: ''
        };
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [generatedCode, setGeneratedCode] = useState('');
    const { toasts, removeToast, success, error: showError } = useToast();

    useEffect(() => {
        // State initialized above
    }, []);

    useEffect(() => {
        if (facultyId) {
            fetchFacultyDetails();
            fetchActiveSupervisorCode();
        }
    }, [facultyId]);

    const fetchActiveSupervisorCode = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/code/supervisor/active/${facultyId}`);
            const data = await response.json();
            if (data.success) {
                setGeneratedCode(data.data.code);
            }
        } catch (error) {
            console.error('Error fetching active code:', error);
        }
    };

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
            // Determine Endpoint based on evaluation type
            const isSupervisorEval = selectedAssignment.assignment_id === 'supervisor_eval';
            const endpoint = isSupervisorEval
                ? 'http://localhost:5000/api/qce/code/generate-supervisor'
                : 'http://localhost:5000/api/qce/subjects/assignments/generate-code';

            const payload = isSupervisorEval
                ? { evaluateeId: facultyId, creatorId: 1 } // TODO: Use real creator ID from context
                : { assignmentId: selectedAssignment.assignment_id, code: generatedCode };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                // If returning from supervisor generation, it enters here too
                success('Evaluation code generated and activated successfully!');
                setIsModalOpen(false);
                setSelectedAssignment(null);

                // If it was a supervisor code, keep it displayed or refresh?
                // Actually, for supervisor code, we want to set it in state to show persistently
                if (selectedAssignment.assignment_id === 'supervisor_eval') {
                    setGeneratedCode(data.data.code);
                    fetchActiveSupervisorCode(); // Refresh persistence
                } else {
                    setGeneratedCode('');
                    fetchFacultyDetails();
                }

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



                {/* Conditional Rendering for Administrative Heads vs Faculty */}
                {['Dean', 'Department Chair'].some(r => facultyData.position.includes(r)) ? (
                    <div className={styles.adminEvaluationSection}>
                        <div className={styles.adminCard}>
                            <h2 className={styles.sectionTitle}>Administrative Performance Evaluation</h2>
                            <p className={styles.sectionSubtitle}>
                                Evaluation for{' '}
                                <span className={styles.highlightRole}>{facultyData.position}</span>
                            </p>

                            <div className={styles.evaluationInfo}>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Evaluatee:</span>
                                    <span className={styles.value}>{facultyData.name}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Evaluator:</span>
                                    <span className={styles.value}>
                                        {facultyData.position.includes('Dean') ? 'Vice President for Academic Affairs (VPAA)' : 'College Dean'}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Status:</span>
                                    <Badge variant="warning">Pending Evaluator Code</Badge>
                                </div>
                            </div>

                            <div className={styles.actionArea}>
                                <p className={styles.instruction}>
                                    Generate an evaluation code for the evaluator to access the form.
                                </p>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        // Placeholder for generating admin code
                                        setGeneratedCode(generateCode());
                                        setIsModalOpen(true);
                                        // Mocking selected assignment to avoid null checks
                                        setSelectedAssignment({
                                            subject_name: 'Administrative Evaluation',
                                            subject_code: 'ADMIN-EVAL',
                                            section: 'N/A',
                                            assignment_id: 'admin_placeholder'
                                        });
                                    }}
                                >
                                    Generate Code
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
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
                                    <span className={styles.statCardLabel}>Evaluations Received</span>
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

                        {/* SUPERVISOR EVALUATION SECTION - Visible for everyone */}
                        <div className={styles.adminEvaluationSection} style={{ marginTop: '2rem' }}>
                            <div className={styles.adminCard}>
                                <div className={styles.cardHeaderWithIcon}>
                                    <div>
                                        <h2 className={styles.sectionTitle}>Supervisor Evaluation (Dean)</h2>
                                        <p className={styles.sectionSubtitle}>
                                            Generate a code for the <strong>Dean</strong> to evaluate this faculty member.
                                        </p>
                                    </div>
                                    <Badge variant={generatedCode && generatedCode.startsWith('SUP') ? 'success' : 'warning'}>
                                        {generatedCode && generatedCode.startsWith('SUP') ? 'Active Code Available' : 'No Active Code'}
                                    </Badge>
                                </div>

                                <div className={styles.codeGenerationArea}>
                                    {generatedCode && generatedCode.startsWith('SUP') ? (
                                        <div className={styles.activeCodeDisplay}>
                                            <div className={styles.activeCodeLabel}>ACTIVE SUPERVISOR CODE</div>
                                            <div className={styles.activeCodeValue}>{generatedCode}</div>
                                            <p className={styles.codeInstruction}>Share this code with the Dean to enable evaluation.</p>
                                        </div>
                                    ) : (
                                        <div className={styles.actionArea}>
                                            <Button
                                                variant="primary"
                                                onClick={() => {
                                                    // Trigger Supervisor Modal Flow
                                                    // We don't pre-generate code here, logic is in submit
                                                    setSelectedAssignment({
                                                        subject_name: 'Supervisor Evaluation',
                                                        subject_code: 'SUP-EVAL',
                                                        section: 'N/A',
                                                        assignment_id: 'supervisor_eval'
                                                    });
                                                    setGeneratedCode(''); // Clear any old temp
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                Generate Supervisor Code
                                            </Button>
                                        </div>
                                    )}
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
                    </>
                )}

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
        </DashboardLayout >
    );
}
