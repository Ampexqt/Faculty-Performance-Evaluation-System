import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Card } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { Table } from '@/components/Table/Table';
import { Modal } from '@/components/Modal/Modal';
import { ClipboardList, Clock, CheckCircle } from 'lucide-react';
import styles from './VPAADashboardPage.module.css';

export function VPAADashboardPage() {
    const [evaluations, setEvaluations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [evaluationCode, setEvaluationCode] = useState('');
    const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
    const [selectedEvaluation, setSelectedEvaluation] = useState(null);
    const [evaluationData, setEvaluationData] = useState({
        rating: '',
        comments: ''
    });

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const vpaaId = userData.id;

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
                alert('Successfully joined evaluation!');
                setEvaluationCode('');
                fetchData();
            } else {
                alert(data.message || 'Error joining evaluation');
            }
        } catch (error) {
            console.error('Error joining evaluation:', error);
            alert('Server error');
        }
    };

    const handleEvaluate = (evaluation) => {
        setSelectedEvaluation(evaluation);
        setIsEvaluateModalOpen(true);
    };

    const handleSubmitEvaluation = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/vpaa/submit-evaluation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    evaluation_id: selectedEvaluation.id,
                    rating: evaluationData.rating,
                    comments: evaluationData.comments
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert('Evaluation submitted successfully!');
                setIsEvaluateModalOpen(false);
                setEvaluationData({ rating: '', comments: '' });
                fetchData();
            } else {
                alert(data.message || 'Error submitting evaluation');
            }
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            alert('Server error');
        }
    };

    const pendingEvaluations = evaluations.filter(e => e.status === 'pending');
    const completedEvaluations = evaluations.filter(e => e.status === 'completed');

    const evaluationColumns = [
        {
            header: 'Dean Name',
            accessor: 'dean_name',
            width: '30%',
        },
        {
            header: 'College',
            accessor: 'college_name',
            width: '25%',
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '15%',
        },
        {
            header: 'Semester',
            accessor: 'semester',
            width: '15%',
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '15%',
            align: 'center',
            render: (_, row) => (
                row.status === 'pending' ? (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEvaluate(row)}
                    >
                        Evaluate
                    </Button>
                ) : (
                    <span className={styles.completed}>Completed</span>
                )
            ),
        },
    ];

    if (isLoading) {
        return (
            <DashboardLayout role="VPAA" userName={userData.full_name}>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="VPAA" userName={userData.full_name}>
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
                            placeholder="Enter 6-character code"
                            value={evaluationCode}
                            onChange={(e) => setEvaluationCode(e.target.value.toUpperCase())}
                            maxLength={6}
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

                {/* Evaluate Modal */}
                <Modal
                    isOpen={isEvaluateModalOpen}
                    onClose={() => setIsEvaluateModalOpen(false)}
                    title={`Evaluate ${selectedEvaluation?.dean_name}`}
                >
                    <form onSubmit={handleSubmitEvaluation} className={styles.modalForm}>
                        <Input
                            label="Rating (0-5)"
                            name="rating"
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            placeholder="e.g. 4.5"
                            value={evaluationData.rating}
                            onChange={(e) => setEvaluationData({ ...evaluationData, rating: e.target.value })}
                            required
                        />

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Comments</label>
                            <textarea
                                className={styles.textarea}
                                rows="4"
                                placeholder="Enter your evaluation comments..."
                                value={evaluationData.comments}
                                onChange={(e) => setEvaluationData({ ...evaluationData, comments: e.target.value })}
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsEvaluateModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                Submit Evaluation
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
