import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Users, Award, X, Printer, FileText, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Badge } from '@/components/Badge/Badge';
import { Input } from '@/components/Input/Input';
import { Modal } from '@/components/Modal/Modal';
import styles from './EvaluationResultsPage.module.css';

export function EvaluationResultsPage() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(() => {
        return {
            fullName: sessionStorage.getItem('fullName') || 'QCE Manager',
            collegeId: sessionStorage.getItem('collegeId')
        };
    });

    const [facultyResults, setFacultyResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [facultyDetails, setFacultyDetails] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [stats, setStats] = useState({
        totalFaculty: 0,
        totalEvaluations: 0,
        averageRating: 0
    });

    useEffect(() => {
        fetchEvaluationResults();
    }, [userInfo.collegeId]);

    const fetchEvaluationResults = async () => {
        if (!userInfo.collegeId) return;

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/qce/evaluation-results/${userInfo.collegeId}`);
            const data = await response.json();

            if (data.success) {
                setFacultyResults(data.data);
                calculateStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching evaluation results:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (data) => {
        const totalFaculty = data.length;
        const totalEvaluations = data.reduce((sum, faculty) =>
            sum + faculty.studentEvaluations + faculty.supervisorEvaluations, 0
        );
        const avgRating = data.reduce((sum, faculty) => sum + (faculty.overallScore || 0), 0) / (totalFaculty || 1);

        setStats({
            totalFaculty,
            totalEvaluations,
            averageRating: avgRating.toFixed(2)
        });
    };

    const filteredResults = facultyResults.filter(faculty =>
        faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faculty.position.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewDetails = async (faculty) => {
        setSelectedFaculty(faculty);
        setIsModalOpen(true);
        setIsLoadingDetails(true);

        try {
            const response = await fetch(`http://localhost:5000/api/qce/evaluation-results/faculty/${faculty.id}`);
            const data = await response.json();

            if (data.success) {
                setFacultyDetails(data.data);
            }
        } catch (error) {
            console.error('Error fetching faculty details:', error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFaculty(null);
        setFacultyDetails(null);
    };

    const columns = [
        {
            header: 'Faculty Name',
            accessor: 'name',
            width: '25%',
            render: (value, row) => (
                <div className={styles.facultyCell}>
                    <div className={styles.tableFacultyName}>{value}</div>
                    <div className={styles.tableFacultyPosition}>{row.position}</div>
                </div>
            )
        },
        {
            header: 'Supervisor',
            accessor: 'supervisorStatus',
            width: '15%',
            align: 'center',
            render: (value, row) => {
                const position = row.position ? row.position.toLowerCase() : '';
                const isDean = position.includes('dean');
                const isChair = position.includes('chair');

                let required = 2;
                let completed = 0;

                if (isDean) {
                    required = 1;
                    completed = row.vpaa_completed || 0;
                } else if (isChair) {
                    required = 1;
                    completed = row.dean_completed || 0;
                } else {
                    // Regular Faculty
                    required = 2;
                    completed = (row.dean_completed || 0) + (row.chair_completed || 0);
                }

                if (completed >= required) {
                    return (
                        <div className={styles.performanceRatingCell}>
                            <span className={styles.ratingOutstanding}>Completed</span>
                        </div>
                    );
                } else if (completed > 0) {
                    return (
                        <div className={styles.performanceRatingCell}>
                            <span className={styles.ratingSatisfactory}>{completed}/{required} Done</span>
                        </div>
                    );
                } else {
                    return (
                        <div className={styles.performanceRatingCell}>
                            <span style={{ color: '#9ca3af', fontWeight: 500 }}>Pending</span>
                        </div>
                    );
                }
            }
        },
        {
            header: 'Performance Rating',
            accessor: 'overallScore',
            width: '25%',
            align: 'center',
            render: (value, row) => {
                // Helper to normalize scores (handling both 5-point and 100-point scales)
                const normalizeToPercentage = (val) => {
                    if (!val) return 0;
                    const num = parseFloat(val);
                    if (num > 5) return num; // Already 0-100 scale
                    return (num / 5) * 100;  // Convert 0-5 to 0-100
                };

                // Calculate weighted overall score locally to ensure mixed scales are handled
                const studentAvg = row.studentAverage || 0;
                const supervisorAvg = row.supervisorAverage || 0;

                const sPerc = normalizeToPercentage(studentAvg);
                const pPerc = normalizeToPercentage(supervisorAvg);

                let percentage = 0;
                if (sPerc > 0 && pPerc > 0) {
                    percentage = (sPerc * 0.6) + (pPerc * 0.4);
                } else if (sPerc > 0) {
                    percentage = sPerc;
                } else if (pPerc > 0) {
                    percentage = pPerc;
                }

                let rating = '';
                let ratingClass = '';

                if (percentage >= 90) {
                    rating = 'Outstanding';
                    ratingClass = styles.ratingOutstanding;
                } else if (percentage >= 85) {
                    rating = 'Very Satisfactory';
                    ratingClass = styles.ratingVerySatisfactory;
                } else if (percentage >= 80) {
                    rating = 'Satisfactory';
                    ratingClass = styles.ratingSatisfactory;
                } else if (percentage >= 70) {
                    rating = 'Fair';
                    ratingClass = styles.ratingFair;
                } else if (percentage > 0) {
                    rating = 'Poor';
                    ratingClass = styles.ratingPoor;
                } else {
                    return <span style={{ color: '#9ca3af', fontWeight: 500 }}>---</span>;
                }

                return (
                    <div className={styles.performanceRatingCell}>
                        <span className={ratingClass}>{rating}</span>
                    </div>
                );
            }
        },
        {
            header: 'Overall Score',
            accessor: 'overallScore',
            width: '15%',
            align: 'center',
            render: (value, row) => {
                // Helper to normalize scores
                const normalizeToPercentage = (val) => {
                    if (!val) return 0;
                    const num = parseFloat(val);
                    if (num > 5) return num;
                    return (num / 5) * 100;
                };

                const sPerc = normalizeToPercentage(row.studentAverage);
                const pPerc = normalizeToPercentage(row.supervisorAverage);

                let percentage = 0;
                if (sPerc > 0 && pPerc > 0) {
                    percentage = (sPerc * 0.6) + (pPerc * 0.4);
                } else if (sPerc > 0) {
                    percentage = sPerc;
                } else if (pPerc > 0) {
                    percentage = pPerc;
                }

                return (
                    <div className={styles.overallScore}>
                        {percentage > 0 ? (
                            <span className={styles.scoreHighlight}>{percentage.toFixed(2)}</span>
                        ) : (
                            <span style={{ color: '#9ca3af', fontWeight: 500 }}>---</span>
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
                // Calculate NBC score from student and supervisor averages
                const position = row.position ? row.position.toLowerCase() : '';
                const isSupervisorOnly = position.includes('dean') || position.includes('president') || position.includes('vpaa') || position.includes('department chair');

                const studentAvg = row.studentAverage || 0;
                const supervisorAvg = row.supervisorAverage || 0;

                if (!studentAvg && !supervisorAvg) {
                    return <span style={{ color: '#9ca3af', fontWeight: 500 }}>---</span>;
                }

                let nbcScore = 0;
                let maxScore = 60;

                // Convert scores to 100-point percentage using smart normalization
                const normalizeToPercentage = (val) => {
                    if (!val) return 0;
                    const num = parseFloat(val);
                    if (num > 5) return num;
                    return (num / 5) * 100;
                };

                const studentPercentage = normalizeToPercentage(studentAvg);
                const supervisorPercentage = normalizeToPercentage(supervisorAvg);

                if (isSupervisorOnly) {
                    // Formula: (Supervisor Percentage ÷ 100) × 24
                    nbcScore = (supervisorPercentage / 100) * 24;
                    maxScore = 24;
                } else {
                    // Standard Formula: (Student % ÷ 100 × 36) + (Supervisor % ÷ 100 × 24)
                    nbcScore = ((studentPercentage / 100) * 36) + ((supervisorPercentage / 100) * 24);
                    maxScore = 60;
                }

                return (
                    <div className={styles.nbcScore}>
                        <span className={styles.nbcScoreValue}>{nbcScore.toFixed(2)}</span>
                        <span className={styles.nbcScoreTotal}>/ {maxScore}</span>
                    </div>
                );
            }
        },
        {
            header: 'Action',
            accessor: 'action',
            width: '15%',
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
            role="QCE Manager"
            userName={userInfo.fullName}
            notificationCount={5}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Evaluation Results</h1>
                        <p className={styles.subtitle}>Comprehensive evaluation data for all faculty members</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#dbeafe' }}>
                            <Users size={24} color="#1e40af" />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.totalFaculty}</span>
                            <span className={styles.statLabel}>Total Faculty</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#fef3c7' }}>
                            <TrendingUp size={24} color="#92400e" />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.totalEvaluations}</span>
                            <span className={styles.statLabel}>Total Evaluations</span>
                        </div>
                    </div>

                </div>

                {/* Performance Rating Scale Card */}
                <div className={styles.ratingScaleCard}>
                    <div className={styles.ratingScaleHeader}>
                        <Award size={20} color="#7f1d1d" />
                        <span className={styles.ratingScaleTitle}>Performance Rating Scale</span>
                    </div>
                    <div className={styles.ratingScaleItems}>
                        <div className={styles.ratingScaleItem}>
                            <span className={styles.ratingRange}>90-100%</span>
                            <span className={styles.ratingLabel}>Outstanding</span>
                        </div>
                        <div className={styles.ratingScaleItem}>
                            <span className={styles.ratingRange}>85-89%</span>
                            <span className={styles.ratingLabel}>Very Satisfactory</span>
                        </div>
                        <div className={styles.ratingScaleItem}>
                            <span className={styles.ratingRange}>80-84%</span>
                            <span className={styles.ratingLabel}>Satisfactory</span>
                        </div>
                        <div className={styles.ratingScaleItem}>
                            <span className={styles.ratingRange}>70-79%</span>
                            <span className={styles.ratingLabel}>Fair</span>
                        </div>
                        <div className={styles.ratingScaleItem}>
                            <span className={styles.ratingRange}>Below 70%</span>
                            <span className={styles.ratingLabel}>Poor</span>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className={styles.searchSection}>
                    <div className={styles.searchContainer}>
                        <Search size={20} className={styles.searchIcon} />
                        <Input
                            type="text"
                            placeholder="Search faculty by name or position..."
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
                                <p>No evaluation results found</p>
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
                        ) : facultyDetails ? (
                            <>
                                {/* Faculty Header - Inline */}
                                <div className={styles.facultyHeaderCompact}>
                                    <h2 className={styles.facultyNameCompact}>{facultyDetails.faculty.name}</h2>
                                    <p className={styles.facultyDetailsCompact}>
                                        {facultyDetails.faculty.position} • {facultyDetails.faculty.email}
                                    </p>
                                </div>

                                {/* Metrics Container */}
                                <div className={styles.metricsContainer}>
                                    <div className={styles.metricsRow}>
                                        {(() => {
                                            const position = facultyDetails.faculty.position ? facultyDetails.faculty.position.toLowerCase() : '';
                                            const isSupervisorOnly = position.includes('dean') || position.includes('president') || position.includes('vpaa') || position.includes('department chair');

                                            return isSupervisorOnly ? (
                                                <div className={styles.metricBox} style={{ opacity: 0.5 }}>
                                                    <span className={styles.metricLabel}>STUDENT EVALUATIONS</span>
                                                    <span className={styles.metricValue}>N/A</span>
                                                </div>
                                            ) : (
                                                <div className={styles.metricBox}>
                                                    <span className={styles.metricLabel}>STUDENT EVALUATIONS</span>
                                                    <span className={styles.metricValue}>{facultyDetails.statistics.studentCount}</span>
                                                </div>
                                            );
                                        })()}

                                        <div className={styles.metricBox}>
                                            <span className={styles.metricLabel}>SUPERVISOR EVALUATIONS</span>
                                            <span className={styles.metricValue}>{facultyDetails.statistics.supervisorCount}</span>
                                        </div>
                                    </div>
                                    <div className={styles.metricsRow}>
                                        {(() => {
                                            const position = facultyDetails.faculty.position ? facultyDetails.faculty.position.toLowerCase() : '';
                                            const isSupervisorOnly = position.includes('dean') || position.includes('president') || position.includes('vpaa') || position.includes('department chair');

                                            return isSupervisorOnly ? (
                                                <div className={styles.metricBox} style={{ opacity: 0.5 }}>
                                                    <span className={styles.metricLabel}>STUDENT AVERAGE</span>
                                                    <span className={styles.metricValue}>N/A</span>
                                                </div>
                                            ) : (
                                                <div className={styles.metricBox}>
                                                    <span className={styles.metricLabel}>STUDENT AVERAGE</span>
                                                    <span className={styles.metricValue}>
                                                        {facultyDetails.statistics.studentAverage ? facultyDetails.statistics.studentAverage.toFixed(2) : '---'}
                                                    </span>
                                                </div>
                                            );
                                        })()}

                                        <div className={styles.metricBox}>
                                            <span className={styles.metricLabel}>SUPERVISOR AVERAGE</span>
                                            <span className={styles.metricValue}>
                                                {facultyDetails.statistics.supervisorAverage ? facultyDetails.statistics.supervisorAverage.toFixed(2) : '---'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.scoresRow}>
                                        <div className={styles.scoreBoxPrimary}>
                                            <span className={styles.scoreBoxLabel}>NBC 461 POINTS</span>
                                            <span className={styles.scoreBoxValue}>
                                                {(() => {
                                                    const sAvg = facultyDetails.statistics.studentAverage || 0;
                                                    const pAvg = facultyDetails.statistics.supervisorAverage || 0;

                                                    const position = facultyDetails.faculty.position ? facultyDetails.faculty.position.toLowerCase() : '';
                                                    const isSupervisorOnly = position.includes('dean') || position.includes('president') || position.includes('vpaa') || position.includes('department chair');

                                                    if (!sAvg && !pAvg) return '---';

                                                    // Smart normalization
                                                    const normalizeToPercentage = (val) => {
                                                        if (!val) return 0;
                                                        const num = parseFloat(val);
                                                        if (num > 5) return num;
                                                        return (num / 5) * 100;
                                                    };

                                                    const sScore100 = normalizeToPercentage(sAvg);
                                                    const pScore100 = normalizeToPercentage(pAvg);

                                                    let nbcScore = 0;
                                                    let maxScore = 60;

                                                    if (isSupervisorOnly) {
                                                        // Formula for Dean/VPAA/President/Chair
                                                        // Locked to 24 points
                                                        nbcScore = (pScore100 / 100) * 24;
                                                        maxScore = 24;
                                                    } else {
                                                        // Standard Formula
                                                        nbcScore = ((sScore100 / 100) * 36) + ((pScore100 / 100) * 24);
                                                        maxScore = 60;
                                                    }

                                                    return (
                                                        <>
                                                            {nbcScore.toFixed(2)} <span className={styles.scoreBoxTotal}>/ {maxScore}</span>
                                                        </>
                                                    );
                                                })()}
                                            </span>
                                        </div>
                                        <div className={styles.scoreBoxSecondary}>
                                            <span className={styles.scoreBoxLabelSecondary}>PERCENTAGE RATING</span>
                                            <span className={styles.scoreBoxValueSecondary}>
                                                {(() => {
                                                    const sAvg = facultyDetails.statistics.studentAverage || 0;
                                                    const pAvg = facultyDetails.statistics.supervisorAverage || 0;

                                                    const position = facultyDetails.faculty.position ? facultyDetails.faculty.position.toLowerCase() : '';
                                                    const isSupervisorOnly = position.includes('dean') || position.includes('president') || position.includes('vpaa') || position.includes('department chair');

                                                    const normalizeToPercentage = (val) => {
                                                        if (!val) return 0;
                                                        const num = parseFloat(val);
                                                        if (num > 5) return num;
                                                        return (num / 5) * 100;
                                                    };

                                                    const sPerc = normalizeToPercentage(sAvg);
                                                    const pPerc = normalizeToPercentage(pAvg);

                                                    let percentage = 0;

                                                    if (isSupervisorOnly) {
                                                        // For Supervisor Only roles, Percentage is just the Supervisor Percentage
                                                        percentage = pPerc;
                                                    } else {
                                                        // Standard weighted percentage
                                                        if (sPerc > 0 && pPerc > 0) {
                                                            percentage = (sPerc * 0.6) + (pPerc * 0.4);
                                                        } else if (sPerc > 0) {
                                                            percentage = sPerc;
                                                        } else if (pPerc > 0) {
                                                            percentage = pPerc;
                                                        }
                                                    }

                                                    return percentage > 0 ? percentage.toFixed(2) + '%' : '---';
                                                })()}
                                            </span>
                                            <span style={{ fontSize: '0.6rem', color: '#9ca3af', marginTop: '2px' }}>(Informational Only)</span>
                                        </div>
                                    </div>
                                    <div className={styles.performanceCategory}>
                                        <span className={styles.performanceLabel}>PERFORMANCE CATEGORY</span>
                                        <span className={styles.performanceRating}>
                                            {(() => {
                                                const sAvg = facultyDetails.statistics.studentAverage || 0;
                                                const pAvg = facultyDetails.statistics.supervisorAverage || 0;

                                                const position = facultyDetails.faculty.position ? facultyDetails.faculty.position.toLowerCase() : '';
                                                const isSupervisorOnly = position.includes('dean') || position.includes('president') || position.includes('vpaa') || position.includes('department chair');

                                                const normalizeToPercentage = (val) => {
                                                    if (!val) return 0;
                                                    const num = parseFloat(val);
                                                    if (num > 5) return num;
                                                    return (num / 5) * 100;
                                                };

                                                const sPerc = normalizeToPercentage(sAvg);
                                                const pPerc = normalizeToPercentage(pAvg);

                                                let percentage = 0;

                                                if (isSupervisorOnly) {
                                                    percentage = pPerc;
                                                } else {
                                                    if (sPerc > 0 && pPerc > 0) {
                                                        percentage = (sPerc * 0.6) + (pPerc * 0.4);
                                                    } else if (sPerc > 0) {
                                                        percentage = sPerc;
                                                    } else if (pPerc > 0) {
                                                        percentage = pPerc;
                                                    }
                                                }

                                                if (percentage >= 90) return 'Outstanding';
                                                if (percentage >= 85) return 'Very Satisfactory';
                                                if (percentage >= 80) return 'Satisfactory';
                                                if (percentage >= 70) return 'Fair';
                                                if (percentage > 0) return 'Poor';
                                                return '---';
                                            })()}
                                        </span>
                                    </div>
                                </div>

                                {/* Computation Tables */}
                                {(facultyDetails.studentEvaluations.length > 0 || facultyDetails.supervisorEvaluations.length > 0) && (() => {
                                    const position = facultyDetails.faculty.position ? facultyDetails.faculty.position.toLowerCase() : '';
                                    const isSupervisorOnly = position.includes('dean') || position.includes('president') || position.includes('vpaa') || position.includes('department chair');

                                    return (
                                        <div className={styles.annexSection}>
                                            <h3 className={styles.annexTitle}>Detailed Evaluation Reports</h3>
                                            <div className={styles.annexGrid}>
                                                {['A', 'B', 'C', 'D'].map((annex) => {

                                                    let actionText = 'View Report';
                                                    if (annex === 'A') actionText = 'Student Evaluation of Teachers (SET)';
                                                    if (annex === 'B') actionText = 'Supervisor’s Evaluation of Teachers (SEF)';
                                                    if (annex === 'C') actionText = 'Individual Faculty Evaluation Report';
                                                    if (annex === 'D') actionText = 'Faculty Evaluation Acknowledgement Form';

                                                    return (
                                                        <button
                                                            key={annex}
                                                            className={styles.annexCard}
                                                            onClick={() => navigate(`/qce/results/${facultyDetails.faculty.id}/annex-${annex.toLowerCase()}`)}
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
                                    );
                                })()}
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
