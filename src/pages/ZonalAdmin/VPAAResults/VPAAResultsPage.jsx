import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '../../../components/DashboardLayout/DashboardLayout';
import { Table } from '../../../components/Table/Table';
import { Input } from '../../../components/Input/Input';
import { Modal } from '../../../components/Modal/Modal';
import styles from './VPAAResultsPage.module.css';

export const VPAAResultsPage = () => {
    const navigate = useNavigate();
    const [vpaaResults, setVpaaResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVpaa, setSelectedVpaa] = useState(null);
    const [vpaaDetails, setVpaaDetails] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

    useEffect(() => {
        fetchVPAAResults();
    }, []);

    const fetchVPAAResults = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/zonal/vpaa-results');
            const data = await response.json();

            if (data.success) {
                setVpaaResults(data.data);
            }
        } catch (error) {
            console.error('Error fetching VPAA results:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredResults = vpaaResults.filter(vpaa =>
        vpaa.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewDetails = async (vpaa) => {
        setSelectedVpaa(vpaa);
        setIsModalOpen(true);
        setIsLoadingDetails(true);

        try {
            const response = await fetch(`http://localhost:5000/api/zonal/vpaa-results/${vpaa.id}`);
            const data = await response.json();

            if (data.success) {
                setVpaaDetails(data.data);
            }
        } catch (error) {
            console.error('Error fetching VPAA details:', error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVpaa(null);
        setVpaaDetails(null);
    };

    const columns = [
        {
            header: 'VPAA Name',
            accessor: 'name',
            width: '25%',
            render: (value, row) => (
                <div className={styles.deanCell}>
                    <div className={styles.deanName}>{value}</div>
                    <div className={styles.deanCollege}>{row.position}</div>
                </div>
            )
        },
        {
            header: 'President Evaluation',
            accessor: 'president_evaluation_status',
            width: '15%',
            align: 'center',
            render: (value) => (
                <div className={styles.statusCell}>
                    <span className={value === 'Completed' ? styles.statusCompleted : styles.statusPending}>
                        {value}
                    </span>
                </div>
            )
        },
        {
            header: 'Average Rating (5.0)',
            accessor: 'overall_score',
            width: '10%',
            align: 'center',
            render: (value) => {
                if (!value || value === 'N/A') {
                    return <span className={styles.scoreNA}>---</span>;
                }
                return (
                    <div className={styles.scoreCell}>
                        <span className={styles.scoreValue}>{parseFloat(value).toFixed(2)}</span>
                    </div>
                );
            }
        },
        {
            header: 'NBC 461 - POINTS',
            accessor: 'nbc_score',
            width: '15%',
            align: 'center',
            render: (value) => {
                if (!value || value === 'N/A') {
                    return <span className={styles.scoreNA}>---</span>;
                }
                const nbcScore = parseFloat(value);
                return (
                    <div className={styles.nbcScore}>
                        <span className={styles.nbcScoreValue}>{nbcScore.toFixed(2)}</span>
                        <span className={styles.nbcScoreTotal}> / 24</span>
                    </div>
                );
            }
        },
        {
            header: 'PERFORMANCE CATEGORY',
            accessor: 'performance_category',
            width: '25%',
            align: 'center',
            render: (value) => {
                if (!value) return <span className={styles.scoreNA}>---</span>;

                let color = '#6b7280'; // Default gray
                if (value === 'OUTSTANDING') color = '#eab308'; // Yellow
                else if (value === 'VERY SATISFACTORY') color = '#a855f7'; // Purple
                else if (value === 'SATISFACTORY') color = '#22c55e'; // Green
                else if (value === 'FAIR') color = '#3b82f6'; // Blue
                else if (value === 'NEEDS IMPROVEMENT') color = '#ef4444'; // Red

                return (
                    <span style={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        color: color,
                        textTransform: 'uppercase'
                    }}>
                        {value}
                    </span>
                );
            }
        },
        {
            header: 'Action',
            accessor: 'action',
            width: '10%',
            align: 'center',
            render: (value, row) => (
                <button
                    className={styles.viewButton}
                    onClick={() => handleViewDetails(row)}
                >
                    View Details
                </button>
            )
        }
    ];

    return (
        <DashboardLayout
            role="Zonal Admin"
            userName={userInfo.fullName}
            notificationCount={0}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>VPAA Result</h1>
                        <p className={styles.subtitle}>President evaluation results for VPAA</p>
                    </div>
                </div>

                {/* Performance Category Legend */}
                {!isLoading && filteredResults.length > 0 && (
                    <div className={styles.legendSection}>
                        <h3 className={styles.legendTitle}>NBC 461 Performance Category Guide</h3>
                        <div className={styles.legendGrid}>
                            <div className={styles.legendItem}>
                                <span className={styles.legendLabel}>OUTSTANDING:</span>
                                <span className={styles.legendValue}>4.50 - 5.00 (90% - 100%)</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={styles.legendLabel}>VERY SATISFACTORY:</span>
                                <span className={styles.legendValue}>4.00 - 4.49 (80% - 89%)</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={styles.legendLabel}>SATISFACTORY:</span>
                                <span className={styles.legendValue}>3.50 - 3.99 (70% - 79%)</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={styles.legendLabel}>FAIR:</span>
                                <span className={styles.legendValue}>3.00 - 3.49 (60% - 69%)</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={styles.legendLabel}>NEEDS IMPROVEMENT:</span>
                                <span className={styles.legendValue}>Below 3.00 (Below 60%)</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Table */}
                <div className={styles.tableSection}>
                    <div className={styles.tableContainer}>
                        {isLoading ? (
                            <div className={styles.loadingState}>
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
                            </div>
                        ) : filteredResults.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No VPAA results found</p>
                            </div>
                        ) : (
                            <Table columns={columns} data={filteredResults} />
                        )}
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="">
                    <div className={styles.modalContent}>
                        {isLoadingDetails ? (
                            <div className={styles.modalLoading}>
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
                                <p>Loading details...</p>
                            </div>
                        ) : vpaaDetails ? (
                            <>
                                {/* VPAA Header */}
                                <div className={styles.deanHeader}>
                                    <h2 className={styles.deanNameModal}>{vpaaDetails.faculty.name}</h2>
                                    <p className={styles.deanDetailsModal}>
                                        {vpaaDetails.faculty.position} • {vpaaDetails.faculty.email}
                                    </p>
                                </div>

                                {/* Stats Row: Count and Average */}
                                <div className={styles.statsGrid}>
                                    <div className={styles.statBox}>
                                        <span className={styles.statLabel}>PRESIDENT EVALUATIONS</span>
                                        <span className={styles.statValue}>{vpaaDetails.statistics.supervisorCount}</span>
                                    </div>
                                    <div className={styles.statBox}>
                                        <span className={styles.statLabel}>PRESIDENT AVERAGE</span>
                                        <span className={styles.statValue}>
                                            {vpaaDetails.statistics.supervisorAverage ? vpaaDetails.statistics.supervisorAverage.toFixed(2) : '---'}
                                        </span>
                                    </div>
                                </div>

                                {/* Scoring Row: NBC and Percentage */}
                                <div className={styles.scoringGrid}>
                                    <div className={styles.nbcBox}>
                                        <span className={styles.nbcLabel}>NBC 461 POINTS</span>
                                        <span className={styles.nbcValue}>
                                            {(() => {
                                                const pAvg = vpaaDetails.statistics.supervisorAverage || 0;
                                                if (!pAvg) return '---';

                                                const normalizeToPercentage = (val) => {
                                                    if (!val) return 0;
                                                    const num = parseFloat(val);
                                                    if (num > 5) return num;
                                                    return (num / 5) * 100;
                                                };

                                                const pScore100 = normalizeToPercentage(pAvg);
                                                const nbcScore = (pScore100 / 100) * 24;

                                                return (
                                                    <>
                                                        {nbcScore.toFixed(2)} <span className={styles.nbcTotal}>/ 24</span>
                                                    </>
                                                );
                                            })()}
                                        </span>
                                    </div>
                                    <div className={styles.percentBox}>
                                        <span className={styles.percentLabel}>PERCENTAGE RATING</span>
                                        <span className={styles.percentValue}>
                                            {(() => {
                                                const pAvg = vpaaDetails.statistics.supervisorAverage || 0;
                                                if (!pAvg) return '---';

                                                const normalizeToPercentage = (val) => {
                                                    if (!val) return 0;
                                                    const num = parseFloat(val);
                                                    if (num > 5) return num;
                                                    return (num / 5) * 100;
                                                };

                                                const percentage = normalizeToPercentage(pAvg);
                                                return `${percentage.toFixed(2)}%`;
                                            })()}
                                        </span>
                                        <span className={styles.percentSub}>(Informational Only)</span>
                                    </div>
                                </div>

                                {/* Performance Category */}
                                <div className={styles.categoryBox}>
                                    <span className={styles.categoryLabel}>PERFORMANCE CATEGORY</span>
                                    <span className={styles.categoryValue}>
                                        {(() => {
                                            const pAvg = vpaaDetails.statistics.supervisorAverage || 0;
                                            if (!pAvg) return 'N/A';

                                            const normalizeToPercentage = (val) => {
                                                if (!val) return 0;
                                                const num = parseFloat(val);
                                                if (num > 5) return num;
                                                return (num / 5) * 100;
                                            };

                                            const percentage = normalizeToPercentage(pAvg);

                                            if (percentage >= 90) return 'OUTSTANDING';
                                            if (percentage >= 80) return 'VERY SATISFACTORY';
                                            if (percentage >= 70) return 'SATISFACTORY';
                                            if (percentage >= 60) return 'FAIR';
                                            return 'NEEDS IMPROVEMENT';
                                        })()}
                                    </span>
                                </div>

                                {/* Annex Section */}
                                {vpaaDetails.supervisorEvaluations.length > 0 && (
                                    <div className={styles.annexSection}>
                                        <h3 className={styles.annexTitle}>Detailed Evaluation Reports</h3>
                                        <div className={styles.annexGrid}>
                                            {['A', 'B', 'C', 'D'].map((annex) => {
                                                let actionText = 'View Report';
                                                if (annex === 'A') actionText = 'Student Evaluation of Teachers (SET)';
                                                if (annex === 'B') actionText = 'Supervisor\'s Evaluation of Teachers (SEF)';
                                                if (annex === 'C') actionText = 'Individual Faculty Evaluation Report';
                                                if (annex === 'D') actionText = 'Faculty Evaluation Acknowledgement Form';

                                                return (
                                                    <button
                                                        key={annex}
                                                        className={styles.annexCard}
                                                        onClick={() => navigate(`/zonal/vpaa-results/${vpaaDetails.faculty.id}/annex-${annex.toLowerCase()}`)}
                                                    >
                                                        <div className={styles.annexIcon}>
                                                            <FileText size={24} color="#b91c1c" />
                                                        </div>
                                                        <div className={styles.annexInfo}>
                                                            <span className={styles.annexLabel}>Annex {annex}</span>
                                                            <span className={styles.annexAction}>{actionText}</span>
                                                        </div>
                                                        <ChevronRight size={20} className={styles.annexArrow} color="#9ca3af" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className={styles.noData}>
                                <p>Failed to load evaluation details.</p>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </DashboardLayout>
    );
};


