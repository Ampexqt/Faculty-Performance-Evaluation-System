import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, CheckCircle, Clock, Copy, Check } from 'lucide-react';
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
        return {
            fullName: localStorage.getItem('fullName') || 'QCE Manager',
        };
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [tempCode, setTempCode] = useState(''); // Only used for modal display or temporary storage

    // Active Codes State
    const [activeDeanCode, setActiveDeanCode] = useState('');
    const [activeChairCode, setActiveChairCode] = useState('');
    const [activeVPAACode, setActiveVPAACode] = useState('');

    const [copied, setCopied] = useState(false);
    const { toasts, removeToast, success, error: showError } = useToast();

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        success('Code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        if (facultyId) {
            fetchFacultyDetails();
            fetchActiveSupervisorCodes();
        }
    }, [facultyId]);

    const fetchActiveSupervisorCodes = async () => {
        try {
            // Fetch Dean Code
            const deanRes = await fetch(`http://localhost:5000/api/qce/code/supervisor/active/${facultyId}?type=Dean`);
            const deanData = await deanRes.json();
            if (deanData.success) {
                setActiveDeanCode(deanData.data.code);
            }

            // Fetch Chair Code
            const chairRes = await fetch(`http://localhost:5000/api/qce/code/supervisor/active/${facultyId}?type=Chair`);
            const chairData = await chairRes.json();
            if (chairData.success) {
                setActiveChairCode(chairData.data.code);
            }

            // Fetch VPAA Code
            const vpaaRes = await fetch(`http://localhost:5000/api/qce/code/supervisor/active/${facultyId}?type=VPAA`);
            const vpaaData = await vpaaRes.json();
            if (vpaaData.success) {
                setActiveVPAACode(vpaaData.data.code);
            }
        } catch (error) {
            console.error('Error fetching active codes:', error);
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
        setTempCode(generateCode());
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setSelectedAssignment(null);
        setTempCode('');
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();

        if (!selectedAssignment) return;

        try {
            // Determine behavior based on assignment type
            const isDeanEval = selectedAssignment.assignment_id === 'supervisor_eval_dean';
            const isChairEval = selectedAssignment.assignment_id === 'supervisor_eval_chair';
            const isVPAAEval = selectedAssignment.assignment_id === 'supervisor_eval_vpaa';

            let endpoint = 'http://localhost:5000/api/qce/subjects/assignments/generate-code';
            let payload = { assignmentId: selectedAssignment.assignment_id, code: tempCode };

            if (isDeanEval || isChairEval || isVPAAEval) {
                endpoint = 'http://localhost:5000/api/qce/code/generate-supervisor';
                let type = 'Dean';
                if (isChairEval) type = 'Chair';
                if (isVPAAEval) type = 'VPAA';

                payload = {
                    evaluateeId: facultyId,
                    creatorId: 1, // TODO: Use real creator ID from context
                    type: type
                };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                success('Evaluation code generated and activated successfully!');
                setIsModalOpen(false);
                setSelectedAssignment(null);
                setTempCode('');

                // Refresh respective data
                if (isDeanEval || isChairEval || isVPAAEval) {
                    fetchActiveSupervisorCodes();
                } else {
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
            <DashboardLayout role="QCE Manager" userName={userInfo.fullName}>
                <div className={styles.loadingContainer}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!facultyData) {
        return (
            <DashboardLayout role="QCE Manager" userName={userInfo.fullName}>
                <div className={styles.errorContainer}>
                    <p>Faculty not found</p>
                </div>
            </DashboardLayout>
        );
    }

    const isDean = facultyData.position.includes('Dean');
    const isChair = facultyData.position.includes('Chair');

    return (
        <DashboardLayout
            role="QCE Manager"
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

                {/* Stats Cards - Show for everyone, even Deans/Chairs if they have data. 
                    If they don't teach, counts might be 0, which is fine. */}
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

                {/* EVALUATION SECTIONS */}

                {/* For Deans: VPAA Evaluation */}
                {isDean && (
                    <div className={styles.adminEvaluationSection} style={{ marginTop: '2rem' }}>
                        <div className={styles.adminCard}>
                            <div className={styles.cardHeaderWithIcon}>
                                <div>
                                    <h2 className={styles.sectionTitle}>Supervisor Evaluation (VPAA)</h2>
                                    <p className={styles.sectionSubtitle}>
                                        Generate a code for the <strong>VPAA</strong> to evaluate this Dean.
                                    </p>
                                </div>
                                <Badge variant={activeVPAACode ? 'success' : 'warning'}>
                                    {activeVPAACode ? 'Active Code Available' : 'No Active Code'}
                                </Badge>
                            </div>

                            <div className={styles.codeGenerationArea}>
                                {activeVPAACode ? (
                                    <div className={styles.activeCodeDisplay}>
                                        <div className={styles.activeCodeLabel}>ACTIVE VPAA CODE</div>
                                        <div className={styles.activeCodeValue}>
                                            {activeVPAACode}
                                            <button
                                                onClick={() => handleCopy(activeVPAACode)}
                                                className={styles.copyButton}
                                                title="Copy Code"
                                            >
                                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                            </button>
                                        </div>
                                        <p className={styles.codeInstruction}>Share this code with the VPAA to enable evaluation.</p>
                                    </div>
                                ) : (
                                    <div className={styles.actionArea}>
                                        <Button
                                            variant="primary"
                                            onClick={() => {
                                                setSelectedAssignment({
                                                    subject_name: 'Supervisor Evaluation (VPAA)',
                                                    subject_code: 'SUP-EVAL-VPAA',
                                                    section: 'N/A',
                                                    assignment_id: 'supervisor_eval_vpaa'
                                                });
                                                setTempCode('');
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            Generate VPAA Code
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}


                {/* For Chairs or Regular Faculty: Dean Evaluation */}
                {(isChair || !isDean) && (
                    <div className={styles.adminEvaluationSection} style={{ marginTop: '2rem' }}>
                        <div className={styles.adminCard}>
                            <div className={styles.cardHeaderWithIcon}>
                                <div>
                                    <h2 className={styles.sectionTitle}>Supervisor Evaluation (Dean)</h2>
                                    <p className={styles.sectionSubtitle}>
                                        Generate a code for the <strong>Dean</strong> to evaluate this {isChair ? 'Chair' : 'Faculty Member'}.
                                    </p>
                                </div>
                                <Badge variant={activeDeanCode ? 'success' : 'warning'}>
                                    {activeDeanCode ? 'Active Code Available' : 'No Active Code'}
                                </Badge>
                            </div>

                            <div className={styles.codeGenerationArea}>
                                {activeDeanCode ? (
                                    <div className={styles.activeCodeDisplay}>
                                        <div className={styles.activeCodeLabel}>ACTIVE DEAN CODE</div>
                                        <div className={styles.activeCodeValue}>
                                            {activeDeanCode}
                                            <button
                                                onClick={() => handleCopy(activeDeanCode)}
                                                className={styles.copyButton}
                                                title="Copy Code"
                                            >
                                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                            </button>
                                        </div>
                                        <p className={styles.codeInstruction}>Share this code with the Dean to enable evaluation.</p>
                                    </div>
                                ) : (
                                    <div className={styles.actionArea}>
                                        <Button
                                            variant="primary"
                                            onClick={() => {
                                                setSelectedAssignment({
                                                    subject_name: 'Supervisor Evaluation (Dean)',
                                                    subject_code: 'SUP-EVAL',
                                                    section: 'N/A',
                                                    assignment_id: 'supervisor_eval_dean'
                                                });
                                                setTempCode('');
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            Generate Dean Code
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* For Regular Faculty: Chair Evaluation (Peer) */}
                {!isDean && !isChair && (
                    <div className={styles.adminEvaluationSection} style={{ marginTop: '2rem' }}>
                        <div className={styles.adminCard}>
                            <div className={styles.cardHeaderWithIcon}>
                                <div>
                                    <h2 className={styles.sectionTitle}>Peer Evaluation (Department Chair)</h2>
                                    <p className={styles.sectionSubtitle}>
                                        Generate a code for the <strong>Department Chair</strong> to evaluate this faculty member.
                                    </p>
                                </div>
                                <Badge variant={activeChairCode ? 'success' : 'warning'}>
                                    {activeChairCode ? 'Active Code Available' : 'No Active Code'}
                                </Badge>
                            </div>

                            <div className={styles.codeGenerationArea}>
                                {activeChairCode ? (
                                    <div className={styles.activeCodeDisplay}>
                                        <div className={styles.activeCodeLabel}>ACTIVE CHAIR CODE</div>
                                        <div className={styles.activeCodeValue}>
                                            {activeChairCode}
                                            <button
                                                onClick={() => handleCopy(activeChairCode)}
                                                className={styles.copyButton}
                                                title="Copy Code"
                                            >
                                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                            </button>
                                        </div>
                                        <p className={styles.codeInstruction}>Share this code with the Department Chair to enable evaluation.</p>
                                    </div>
                                ) : (
                                    <div className={styles.actionArea}>
                                        <Button
                                            variant="primary"
                                            onClick={() => {
                                                setSelectedAssignment({
                                                    subject_name: 'Peer Evaluation (Dept. Chair)',
                                                    subject_code: 'CHR-EVAL',
                                                    section: 'N/A',
                                                    assignment_id: 'supervisor_eval_chair'
                                                });
                                                setTempCode('');
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            Generate Chair Code
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Evaluation Details Table (For student evaluations) */}
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

                {/* Generate Code Modal */}
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

                        {tempCode && (
                            <div className={styles.codeDisplay}>
                                <div className={styles.codeLabel}>GENERATED CODE</div>
                                <div className={styles.codeValue}>{tempCode}</div>
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
