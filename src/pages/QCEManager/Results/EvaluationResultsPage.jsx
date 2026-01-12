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
            width: '30%',
            render: (value, row) => (
                <div className={styles.facultyCell}>
                    <div className={styles.tableFacultyName}>{value}</div>
                    <div className={styles.tableFacultyPosition}>{row.position}</div>
                </div>
            )
        },
        {
            header: 'Student Evaluations',
            accessor: 'studentEvaluations',
            width: '20%',
            align: 'center',
            render: (value) => (
                <span className={styles.countBadge}>{value || 0}</span>
            )
        },
        {
            header: 'Supervisor Evaluations',
            accessor: 'supervisorEvaluations',
            width: '20%',
            align: 'center',
            render: (value) => (
                <span className={styles.countBadge}>{value || 0}</span>
            )
        },
        {
            header: 'Overall Score',
            accessor: 'overallScore',
            width: '15%',
            align: 'center',
            render: (value) => (
                <div className={styles.overallScore}>
                    {value ? (
                        <span className={styles.scoreHighlight}>{value.toFixed(2)}</span>
                    ) : (
                        <span style={{ color: '#9ca3af', fontWeight: 500 }}>---</span>
                    )}
                </div>
            )
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

                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#d1fae5' }}>
                            <Award size={24} color="#065f46" />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.averageRating}</span>
                            <span className={styles.statLabel}>Average Rating</span>
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
                                {/* Faculty Header */}
                                <div className={styles.facultyHeader}>
                                    <h2 className={styles.facultyName}>{facultyDetails.faculty.name}</h2>
                                    <p className={styles.facultyPosition}>{facultyDetails.faculty.position}</p>
                                    <p className={styles.facultyEmail}>{facultyDetails.faculty.email}</p>
                                </div>

                                {/* Statistics Grid */}
                                <div className={styles.statsGrid2}>
                                    <div className={styles.statBox}>
                                        <span className={styles.statLabel2}>STUDENT EVALUATIONS</span>
                                        <span className={styles.statValue2}>{facultyDetails.statistics.studentCount}</span>
                                    </div>
                                    <div className={styles.statBox}>
                                        <span className={styles.statLabel2}>SUPERVISOR EVALUATIONS</span>
                                        <span className={styles.statValue2}>{facultyDetails.statistics.supervisorCount}</span>
                                    </div>
                                    <div className={styles.statBox}>
                                        <span className={styles.statLabel2}>STUDENT AVERAGE</span>
                                        <span className={styles.statValue2}>
                                            {facultyDetails.statistics.studentAverage ? facultyDetails.statistics.studentAverage.toFixed(2) : 'N/A'}
                                        </span>
                                    </div>
                                    <div className={styles.statBox}>
                                        <span className={styles.statLabel2}>SUPERVISOR AVERAGE</span>
                                        <span className={styles.statValue2}>
                                            {facultyDetails.statistics.supervisorAverage ? facultyDetails.statistics.supervisorAverage.toFixed(2) : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Overall Score */}
                                <div className={styles.overallScoreBox}>
                                    <span className={styles.overallScoreLabel}>OVERALL SCORE</span>
                                    <span className={styles.overallScoreValue}>
                                        {facultyDetails.statistics.overallScore ? facultyDetails.statistics.overallScore.toFixed(2) : '---'}
                                    </span>
                                </div>

                                {/* Computation Tables */}
                                {(facultyDetails.studentEvaluations.length > 0 || facultyDetails.supervisorEvaluations.length > 0) && (() => {
                                    return (
                                        <div className={styles.annexSection}>
                                            <h3 className={styles.annexTitle}>Detailed Evaluation Reports</h3>
                                            <div className={styles.annexGrid}>
                                                {['A', 'B', 'C', 'D'].map((annex) => (
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
                                                            <span className={styles.annexAction}>View Report</span>
                                                        </div>
                                                        <ChevronRight size={20} className={styles.annexArrow} color="#9ca3af" />
                                                    </button>
                                                ))}
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
