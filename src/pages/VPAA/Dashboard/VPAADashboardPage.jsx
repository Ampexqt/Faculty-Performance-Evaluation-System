import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Card } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { Table } from '@/components/Table/Table';
import { Badge } from '@/components/Badge/Badge';
import { ToastContainer } from '@/components/Toast/Toast';
import { useToast } from '@/hooks/useToast';
import { ClipboardList, Clock, CheckCircle, FileText } from 'lucide-react';
import styles from './VPAADashboardPage.module.css';

export function VPAADashboardPage() {
    const navigate = useNavigate();
    const [evaluations, setEvaluations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [evaluationCode, setEvaluationCode] = useState('');
    const toast = useToast();

    // Get user data from sessionStorage
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    const vpaaId = userData.id;

    // Helper function to format evaluator name with honorific and suffix
    const formatEvaluatorName = (user) => {
        if (!user || !user.full_name) return '';
        const parts = [];
        if (user.honorific) parts.push(user.honorific);
        parts.push(user.full_name);
        if (user.suffix) parts.push(user.suffix);
        return parts.join(' ');
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);

            // Fetch evaluations
            const evalsResponse = await fetch(`http://localhost:5000/api/vpaa/my-evaluations/${vpaaId}`);
            const evalsData = await evalsResponse.json();
            if (evalsData.success) {
                setEvaluations(evalsData.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinEvaluation = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/vpaa/join-evaluation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vpaa_id: vpaaId,
                    code: evaluationCode
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Successfully joined evaluation!');
                setEvaluationCode('');
                fetchData();
            } else {
                toast.error(data.message || 'Error joining evaluation');
            }
        } catch (error) {
            console.error('Error joining evaluation:', error);
            toast.error('Server error');
        }
    };

    const handleEvaluate = (evaluation) => {
        // Navigate to evaluation form with dean data
        navigate('/vpaa/evaluate', {
            state: {
                evaluation: evaluation,
                vpaaId: vpaaId
            }
        });
    };

    const pendingEvaluations = evaluations.filter(e => e.status === 'pending');
    const completedEvaluations = evaluations.filter(e => e.status === 'completed');

    const evaluationColumns = [
        {
            header: 'Dean Name',
            accessor: 'dean_name',
            width: '25%',
        },
        {
            header: 'College',
            accessor: 'college_name',
            width: '30%',
        },
        {
            header: 'Academic Period',
            accessor: 'semester',
            width: '20%',
            render: (value) => (
                <div className={styles.semesterInfo}>
                    <span className={styles.semesterText}>{value}</span>
                </div>
            ),
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '15%',
            align: 'center',
            render: (value) => (
                <Badge variant={value === 'pending' ? 'warning' : 'success'}>
                    {value === 'pending' ? 'Pending' : 'Completed'}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '10%',
            align: 'center',
            render: (_, row) => (
                row.status === 'pending' ? (
                    <button
                        className={styles.evaluateButton}
                        onClick={() => handleEvaluate(row)}
                        title="Start Evaluation"
                    >
                        <FileText size={16} />
                        <span>Evaluate</span>
                    </button>
                ) : (
                    <Badge variant="success">✓ Done</Badge>
                )
            ),
        },
    ];

    if (isLoading) {
        return (
            <DashboardLayout role="VPAA" userName={formatEvaluatorName(userData)}>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
                </div>
            </DashboardLayout>
        );
    }



    return (
        <DashboardLayout role="VPAA" userName={formatEvaluatorName(userData)}>
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>VPAA Dashboard</h1>
                        <p className={styles.subtitle}>Evaluate College Deans</p>
                    </div>
                </div>

                <div className={styles.statsGrid}>
                    <Card className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <ClipboardList size={24} />
                        </div>
                        <div className={styles.statContent}>
                            <p className={styles.statLabel}>Total Evaluations</p>
                            <p className={styles.statValue}>{evaluations.length}</p>
                        </div>
                    </Card>

                    <Card className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <Clock size={24} />
                        </div>
                        <div className={styles.statContent}>
                            <p className={styles.statLabel}>Pending</p>
                            <p className={styles.statValue}>{pendingEvaluations.length}</p>
                        </div>
                    </Card>

                    <Card className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <CheckCircle size={24} />
                        </div>
                        <div className={styles.statContent}>
                            <p className={styles.statLabel}>Completed</p>
                            <p className={styles.statValue}>{completedEvaluations.length}</p>
                        </div>
                    </Card>
                </div>

                {/* Join Evaluation Card */}
                <Card className={styles.joinCard}>
                    <h2 className={styles.cardTitle}>Join Evaluation</h2>
                    <p className={styles.cardSubtitle}>Enter the evaluation code to start evaluating a dean</p>
                    <form onSubmit={handleJoinEvaluation} className={styles.joinForm}>
                        <Input
                            label="Evaluation Code"
                            placeholder="Enter evaluation code"
                            value={evaluationCode}
                            onChange={(e) => setEvaluationCode(e.target.value.toUpperCase())}
                            required
                        />
                        <Button type="submit" variant="primary">
                            Join Evaluation
                        </Button>
                    </form>
                </Card>

                {/* My Evaluations */}
                <div className={styles.tableContainer}>
                    <h2 className={styles.sectionTitle}>My Evaluations</h2>
                    <Table columns={evaluationColumns} data={evaluations} />
                </div>
            </div>
            <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
        </DashboardLayout>
    );
}
