import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Card } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import { Table } from '@/components/Table/Table';
import { ClipboardList, UserCheck, CheckCircle } from 'lucide-react';
import styles from './PresidentDashboardPage.module.css';

export function PresidentDashboardPage() {
    const [vpaaList, setVpaaList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
    const [selectedVPAA, setSelectedVPAA] = useState(null);
    const [evaluationData, setEvaluationData] = useState({
        rating: '',
        comments: ''
    });

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const presidentId = userData.id;

    useEffect(() => {
        fetchVPAAList();
    }, []);

    const fetchVPAAList = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/president/vpaa-list');
            const data = await response.json();

            if (data.success) {
                setVpaaList(data.data);
            }
        } catch (error) {
            console.error('Error fetching VPAA list:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEvaluate = (vpaa) => {
        setSelectedVPAA(vpaa);
        setIsEvaluateModalOpen(true);
    };

    const handleSubmitEvaluation = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/president/evaluate-vpaa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    president_id: presidentId,
                    vpaa_id: selectedVPAA.id,
                    academic_year_id: 1, // You should get this from active academic year
                    semester: '1st',
                    rating: evaluationData.rating,
                    comments: evaluationData.comments
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert('Evaluation submitted successfully!');
                setIsEvaluateModalOpen(false);
                setEvaluationData({ rating: '', comments: '' });
            } else {
                alert(data.message || 'Error submitting evaluation');
            }
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            alert('Server error');
        }
    };

    const columns = [
        {
            header: 'Name',
            accessor: 'full_name',
            width: '30%',
        },
        {
            header: 'Email',
            accessor: 'email',
            width: '30%',
        },
        {
            header: 'Sex',
            accessor: 'sex',
            width: '15%',
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '15%',
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '10%',
            align: 'center',
            render: (_, row) => (
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleEvaluate(row)}
                >
                    Evaluate
                </Button>
            ),
        },
    ];

    if (isLoading) {
        return (
            <DashboardLayout role="President" userName={userData.full_name}>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="President" userName={userData.full_name}>
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>President Dashboard</h1>
                        <p className={styles.subtitle}>Evaluate VPAA Performance</p>
                    </div>
                </div>

                <div className={styles.statsGrid}>
                    <Card className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <ClipboardList size={24} />
                        </div>
                        <div className={styles.statContent}>
                            <p className={styles.statLabel}>Total VPAA</p>
                            <p className={styles.statValue}>{vpaaList.length}</p>
                        </div>
                    </Card>

                    <Card className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <UserCheck size={24} />
                        </div>
                        <div className={styles.statContent}>
                            <p className={styles.statLabel}>Active VPAA</p>
                            <p className={styles.statValue}>{vpaaList.filter(v => v.status === 'active').length}</p>
                        </div>
                    </Card>

                    <Card className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <CheckCircle size={24} />
                        </div>
                        <div className={styles.statContent}>
                            <p className={styles.statLabel}>Evaluations</p>
                            <p className={styles.statValue}>0</p>
                        </div>
                    </Card>
                </div>

                <div className={styles.tableContainer}>
                    <h2 className={styles.sectionTitle}>VPAA List</h2>
                    <Table columns={columns} data={vpaaList} />
                </div>

                {/* Evaluate Modal */}
                <Modal
                    isOpen={isEvaluateModalOpen}
                    onClose={() => setIsEvaluateModalOpen(false)}
                    title={`Evaluate ${selectedVPAA?.full_name}`}
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
