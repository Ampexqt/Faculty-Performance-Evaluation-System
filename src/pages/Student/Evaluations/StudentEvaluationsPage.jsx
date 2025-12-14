import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { Badge } from '@/components/Badge/Badge';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast/Toast';
import styles from './StudentEvaluationsPage.module.css';

export function StudentEvaluationsPage() {
    const navigate = useNavigate();
    const fullName = localStorage.getItem('fullName') || 'Student';
    const studentId = localStorage.getItem('userId');
    const [evalCode, setEvalCode] = useState('');

    // Initialize pending evaluations from localStorage
    const [pendingEvaluations, setPendingEvaluations] = useState(() => {
        const saved = localStorage.getItem(`pendingEvaluations_${studentId} `);
        return saved ? JSON.parse(saved) : [];
    });

    const [completedEvaluations, setCompletedEvaluations] = useState([]);
    const { toasts, removeToast, success, error: showError } = useToast();

    // Save to localStorage whenever pendingEvaluations changes
    React.useEffect(() => {
        if (studentId) {
            localStorage.setItem(`pendingEvaluations_${studentId}`, JSON.stringify(pendingEvaluations));
        }
    }, [pendingEvaluations, studentId]);

    // Migrate old data: Check if any pending evaluation is missing facultyRole
    React.useEffect(() => {
        const needsMigration = pendingEvaluations.some(item => !item.facultyRole);
        if (needsMigration && pendingEvaluations.length > 0) {
            console.log('Old data detected, please re-validate your codes to get faculty roles');
            // Optionally: Clear old data
            // setPendingEvaluations([]);
        }
    }, [pendingEvaluations]);

    const handleValidate = async () => {
        if (!evalCode) {
            showError('Please enter an evaluation code');
            return;
        }

        try {
            console.log('Validating code:', evalCode);
            const response = await fetch('http://localhost:5000/api/student/evaluations/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: evalCode,
                    studentId: studentId
                }),
            });

            const data = await response.json();

            if (data.success) {
                success('Evaluation code validated! Subject added to pending list.');

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
        navigate('/student/evaluation-form', { state: { evaluation } });
    };

    const pendingColumns = [
        {
            header: 'Subject',
            accessor: 'subject',
            width: '40%',
        },
        {
            header: 'Faculty Instructor',
            accessor: 'instructor',
            width: '35%',
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '15%',
            align: 'center',
            render: (value) => (
                <Badge variant="warning">
                    {value}
                </Badge>
            ),
        },
        {
            header: 'Action',
            accessor: 'action',
            width: '10%',
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
            header: 'Subject',
            accessor: 'subject',
            width: '45%',
        },
        {
            header: 'Faculty Instructor',
            accessor: 'instructor',
            width: '40%',
        },
        {
            header: 'Completed Date',
            accessor: 'completedDate',
            width: '15%',
            align: 'center',
        },
    ];

    return (
        <DashboardLayout
            role="Student"
            userName={fullName}
            notificationCount={2}
        >
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>My Evaluations</h1>
                        <p className={styles.subtitle}>Complete your faculty evaluations to view your grades.</p>
                    </div>
                </div>

                {/* Evaluation Code Input */}
                <div className={styles.codeSection}>
                    <div className={styles.codeCard}>
                        <div className={styles.codeHeader}>
                            <ClipboardList size={24} className={styles.codeIcon} />
                            <div>
                                <h3 className={styles.codeTitle}>Enter Evaluation Code</h3>
                                <p className={styles.codeSubtitle}>Get the evaluation code from your instructor during class.</p>
                            </div>
                        </div>

                        <div className={styles.codeInput}>
                            <Input
                                type="text"
                                placeholder="Enter 6-digit code (e.g. X7K-9P2)"
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
                            <h2 className={styles.sectionTitle}>Pending Evaluations</h2>
                        </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className={styles.tableContainer}>
                        <Table columns={pendingColumns} data={pendingEvaluations} />
                    </div>

                    {/* Mobile Card View */}
                    <div className={styles.mobileCards}>
                        {pendingEvaluations.length === 0 ? (
                            <div className={styles.emptyState}>No pending evaluations</div>
                        ) : (
                            pendingEvaluations.map((evaluation, index) => (
                                <div key={index} className={styles.evaluationCard}>
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.cardSubject}>{evaluation.subject}</h3>
                                        <Badge variant="warning">{evaluation.status}</Badge>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <p className={styles.cardInstructor}>
                                            <strong>Instructor:</strong> {evaluation.instructor}
                                        </p>
                                    </div>
                                    <div className={styles.cardFooter}>
                                        <Button
                                            variant="primary"
                                            size="small"
                                            onClick={() => handleEvaluateNow(evaluation)}
                                            className={styles.cardButton}
                                        >
                                            Evaluate Now
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Completed Evaluations */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionHeaderContent}>
                            <CheckCircle size={20} className={styles.sectionIcon} />
                            <h2 className={styles.sectionTitle}>Completed</h2>
                        </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className={styles.tableContainer}>
                        <Table columns={completedColumns} data={completedEvaluations} />
                    </div>

                    {/* Mobile Card View */}
                    <div className={styles.mobileCards}>
                        {completedEvaluations.length === 0 ? (
                            <div className={styles.emptyState}>No data available</div>
                        ) : (
                            completedEvaluations.map((evaluation, index) => (
                                <div key={index} className={styles.evaluationCard}>
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.cardSubject}>{evaluation.subject}</h3>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <p className={styles.cardInstructor}>
                                            <strong>Instructor:</strong> {evaluation.instructor}
                                        </p>
                                        <p className={styles.cardDate}>
                                            <strong>Completed:</strong> {evaluation.completedDate}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
