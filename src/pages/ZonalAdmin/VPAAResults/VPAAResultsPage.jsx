import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Input } from '@/components/Input/Input';
import { Modal } from '@/components/Modal/Modal';
import styles from './VPAAResultsPage.module.css';

export function VPAAResultsPage() {
    const navigate = useNavigate();
    const [userInfo] = useState(() => {
        return {
            fullName: sessionStorage.getItem('fullName') || 'Zonal Admin'
        };
    });

    const [vpaaResults, setVpaaResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVpaa, setSelectedVpaa] = useState(null);
    const [vpaaDetails, setVpaaDetails] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

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
            const response = await fetch(`http://localhost:5000/api/qce/evaluation-results/faculty/${vpaa.id}`);
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
            width: '30%',
            render: (value, row) => (
                <div className={styles.deanCell}>
                    <div className={styles.deanName}>{value}</div>
                    <div className={styles.deanCollege}>{row.position}</div>
                </div>
            )
        },
        {
            header: 'President Evaluation',
            accessor: 'presidentStatus',
            width: '20%',
            align: 'center',
            render: (value, row) => {
                const completed = row.president_completed || 0;

                if (completed >= 1) {
                    return (
                        <div className={styles.statusCell}>
                            <span className={styles.statusCompleted}>Completed</span>
                        </div>
                    );
                } else {
                    return (
                        <div className={styles.statusCell}>
                            <span className={styles.statusPending}>Pending</span>
                        </div>
                    );
                }
            }
        },
        {
            header: 'Overall Score',
            accessor: 'overallScore',
            width: '20%',
            align: 'center',
            render: (value) => {
                const score = parseFloat(value) || 0;
                return (
                    <div className={styles.scoreCell}>
                        {score > 0 ? (
                            <span className={styles.scoreValue}>{score.toFixed(2)}</span>
                        ) : (
                            <span className={styles.scoreNA}>---</span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'NBC 461 - POINTS',
            accessor: 'nbcScore',
            width: '20%',
            align: 'center',
            render: (value, row) => {
                const supervisorAvg = row.supervisorAverage || 0;

                if (!supervisorAvg) {
                    return <span className={styles.scoreNA}>---</span>;
                }

                const normalizeToPercentage = (val) => {
                    if (!val) return 0;
                    const num = parseFloat(val);
                    if (num > 5) return num;
                    return (num / 5) * 100;
                };

                const supervisorPercentage = normalizeToPercentage(supervisorAvg);
                const nbcScore = (supervisorPercentage / 100) * 24;

                return (
                    <div className={styles.nbcScore}>
                        <span className={styles.nbcScoreValue}>{nbcScore.toFixed(2)}</span>
                        <span className={styles.nbcScoreTotal}> / 24</span>
                    </div>
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

                {/* Search Bar */}
                <div className={styles.searchSection}>
                    <div className={styles.searchContainer}>
                        <Search size={20} className={styles.searchIcon} />
                        <Input
                            type="text"
                            placeholder="Search VPAA by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>

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

                                {/* Metrics Container */}
                                <div className={styles.metricsContainer}>
                                    <div className={styles.metricsRow}>
                                        <div className={styles.metricBox}>
                                            <span className={styles.metricLabel}>PRESIDENT EVALUATIONS</span>
                                            <span className={styles.metricValue}>{vpaaDetails.statistics.supervisorCount}</span>
                                        </div>
                                        <div className={styles.metricBox}>
                                            <span className={styles.metricLabel}>PRESIDENT AVERAGE</span>
                                            <span className={styles.metricValue}>
                                                {vpaaDetails.statistics.supervisorAverage ? vpaaDetails.statistics.supervisorAverage.toFixed(2) : '---'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.scoresRow}>
                                        <div className={styles.scoreBoxPrimary}>
                                            <span className={styles.scoreBoxLabel}>NBC 461 POINTS</span>
                                            <span className={styles.scoreBoxValue}>
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
                                                            {nbcScore.toFixed(2)} <span className={styles.scoreBoxTotal}>/ 24</span>
                                                        </>
                                                    );
                                                })()}
                                            </span>
                                        </div>
                                    </div>
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
                                                        onClick={() => navigate(`/qce/results/${vpaaDetails.faculty.id}/annex-${annex.toLowerCase()}`)}
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
}
