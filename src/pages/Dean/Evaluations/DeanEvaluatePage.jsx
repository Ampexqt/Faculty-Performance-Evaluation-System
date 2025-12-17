import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { Badge } from '@/components/Badge/Badge';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast/Toast';
import styles from './DeanEvaluatePage.module.css';

export function DeanEvaluatePage() {
    const navigate = useNavigate();
    // Get user info with same logic as other Dean pages to ensure Sidebar consistency
    const [userInfo, setUserInfo] = useState(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return {
                fullName: user.full_name || 'College Dean',
                collegeId: user.college_id,
                role: user.role === 'Dean' ? 'College Dean' : user.role,
                userId: user.id
            };
        }
        return {
            fullName: 'College Dean',
            collegeId: null,
            role: 'College Dean',
            userId: null
        };
    });

    const [evalCode, setEvalCode] = useState('');
    const [stats, setStats] = useState({
        pending: 0,
        completed: 0
    });

    // Initialize pending evaluations from localStorage (scoped to user)
    const [pendingEvaluations, setPendingEvaluations] = useState(() => {
        const saved = localStorage.getItem(`deanPendingEvaluations_${userInfo.userId}`);
        return saved ? JSON.parse(saved) : [];
    });

    const [completedEvaluations, setCompletedEvaluations] = useState([]);
    const { toasts, removeToast, success, error: showError } = useToast();

    // Save to localStorage whenever pendingEvaluations changes
    useEffect(() => {
        if (userInfo.userId) {
            localStorage.setItem(`deanPendingEvaluations_${userInfo.userId}`, JSON.stringify(pendingEvaluations));
            setStats(prev => ({ ...prev, pending: pendingEvaluations.length }));
        }
    }, [pendingEvaluations, userInfo.userId]);

    // Fetch completed evaluations
    useEffect(() => {
        const fetchCompletedEvaluations = async () => {
            if (!userInfo.userId) return;

            try {
                // We'll need a new endpoint for this, or reuse student one with a flag?
                // For now, let's point to a new specific dean route structure
                const response = await fetch(`http://localhost:5000/api/dean/evaluations/completed/${userInfo.userId}`);
                const result = await response.json();

                if (result.success) {
                    setCompletedEvaluations(result.data);
                    setStats(prev => ({ ...prev, completed: result.data.length }));
                }
            } catch (error) {
                console.error('Error fetching completed evaluations:', error);
            }
        };

        fetchCompletedEvaluations();
    }, [userInfo.userId]);

    const handleValidate = async () => {
        if (!evalCode) {
            showError('Please enter an evaluation code');
            return;
        }

        try {
            console.log('Validating code:', evalCode);
            const response = await fetch('http://localhost:5000/api/dean/evaluations/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: evalCode,
                    evaluatorId: userInfo.userId,
                    collegeId: userInfo.collegeId
                }),
            });

            const data = await response.json();

            if (data.success) {
                success('Evaluation code validated! Ready to evaluate.');

                // Add to pending evaluations if not already there
                setPendingEvaluations(prev => {
                    const exists = prev.some(item => item.id === data.data.id);
                    if (exists) return prev;
                    return [...prev, data.data];
                });

                setEvalCode(''); // Clear input
            } else {
                showError(data.message || 'Invalid evaluation code');
            }
        } catch (error) {
            console.error('Validation error:', error);
            showError('An error occurred while validating the code');
        }
    };

    const handleEvaluateNow = (evaluation) => {
        // Redirect to a form page. We reuse the EvaluationFormPage BUT use the dean route
        navigate('/dean/evaluation-form', {
            state: {
                evaluation: {
                    ...evaluation,
                    evaluatorType: 'Dean' // Flag to indicate this is a Dean evaluation
                }
            }
        });
    };

    const pendingColumns = [
        {
            header: 'Evaluatee',
            accessor: 'evaluatee', // Evaluatee Name
            width: '35%',
        },
        {
            header: 'Position',
            accessor: 'evaluateeRole', // Dept Chair, Faculty
            width: '25%',
        },
        {
            header: 'Subject/Context',
            accessor: 'subject',
            width: '25%'
        },
        {
            header: 'Action',
            accessor: 'action',
            width: '15%',
            align: 'center',
            render: (value, row) => (
                <Button variant="primary" size="small" onClick={() => handleEvaluateNow(row)}>
                    Evaluate Now
                </Button>
            ),
        },
    ];

    const completedColumns = [
        {
            header: 'Evaluatee',
            accessor: 'evaluatee',
            width: '40%',
        },
        {
            header: 'Subject/Context',
            accessor: 'subject',
            width: '30%'
        },
        {
            header: 'Date Completed',
            accessor: 'completedDate',
            width: '20%',
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '15%',
            align: 'center',
            render: () => (
                <Badge variant="success">Completed</Badge>
            ),
        }
    ];

    return (
        <DashboardLayout
            role={userInfo.role}
            userName={userInfo.fullName}
            notificationCount={3}
        >
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Perform Evaluation</h1>
                        <p className={styles.subtitle}>Evaluate Department Chairs and Faculty members in your college.</p>
                    </div>
                </div>

                {/* Evaluation Code Input */}
                <div className={styles.codeSection}>
                    <div className={styles.codeCard}>
                        <div className={styles.codeHeader}>
                            <ClipboardList size={24} className={styles.codeIcon} />
                            <div>
                                <h3 className={styles.codeTitle}>Enter Evaluation Code</h3>
                                <p className={styles.codeSubtitle}>Enter the code provided to you for the specific evaluation.</p>
                            </div>
                        </div>

                        <div className={styles.codeInput}>
                            <Input
                                type="text"
                                placeholder="Enter evaluation code"
                                value={evalCode}
                                onChange={(e) => setEvalCode(e.target.value)}
                                className={styles.input}
                            />
                            <Button
                                variant="primary"
                                onClick={handleValidate}
                                className={styles.validateButton}
                            >
                                Validate
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Pending Evaluations */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionHeaderContent}>
                            <ClipboardList size={20} className={styles.sectionIcon} />
                            <h2 className={styles.sectionTitle}>Pending Evaluations ({stats.pending})</h2>
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        <Table columns={pendingColumns} data={pendingEvaluations} />
                    </div>
                </div>

                {/* Completed Evaluations */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionHeaderContent}>
                            <CheckCircle size={20} className={styles.sectionIcon} />
                            <h2 className={styles.sectionTitle}>Completed ({stats.completed})</h2>
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        <Table columns={completedColumns} data={completedEvaluations} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
