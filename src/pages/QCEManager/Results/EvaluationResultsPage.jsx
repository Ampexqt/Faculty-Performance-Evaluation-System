import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, Award, X, Printer } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Badge } from '@/components/Badge/Badge';
import { Input } from '@/components/Input/Input';
import { Modal } from '@/components/Modal/Modal';
import styles from './EvaluationResultsPage.module.css';

export function EvaluationResultsPage() {
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
            header: 'Student Evaluations',
            accessor: 'studentEvaluations',
            width: '15%',
            align: 'center',
            render: (value) => (
                <span className={styles.countBadge}>{value || 0}</span>
            )
        },
        {
            header: 'Supervisor Evaluations',
            accessor: 'supervisorEvaluations',
            width: '15%',
            align: 'center',
            render: (value) => (
                <span className={styles.countBadge}>{value || 0}</span>
            )
        },
        {
            header: 'Student Avg',
            accessor: 'studentAverage',
            width: '12%',
            align: 'center',
            render: (value) => (
                <span className={styles.scoreValue}>{value ? value.toFixed(2) : 'N/A'}</span>
            )
        },
        {
            header: 'Supervisor Avg',
            accessor: 'supervisorAverage',
            width: '12%',
            align: 'center',
            render: (value) => (
                <span className={styles.scoreValue}>{value ? value.toFixed(2) : 'N/A'}</span>
            )
        },
        {
            header: 'Overall Score',
            accessor: 'overallScore',
            width: '12%',
            align: 'center',
            render: (value) => (
                <div className={styles.overallScore}>
                    <span className={styles.scoreHighlight}>{value ? value.toFixed(2) : 'N/A'}</span>
                </div>
            )
        },
        {
            header: 'Action',
            accessor: 'action',
            width: '9%',
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
                                <button className={styles.printButton} onClick={() => window.print()}>
                                    <Printer size={16} />
                                    Print Results
                                </button>

                                {/* Faculty Header */}
                                <div className={styles.facultyHeader}>
                                    <h2 className={styles.facultyName}>{facultyDetails.faculty.name}</h2>
                                    <p className={styles.facultyPosition}>
                                        {facultyDetails.faculty.position}
                                        {facultyDetails.faculty.department_name && (
                                            <span> • {facultyDetails.faculty.department_name}</span>
                                        )}
                                    </p>
                                    <p className={styles.facultyEmail}>{facultyDetails.faculty.email}</p>
                                </div>

                                {/* Statistics Grid */}
                                <div className={styles.statsContainer}>
                                    <div className={styles.statColumn}>
                                        <span className={styles.statLabel}>STUDENT EVALUATIONS</span>
                                        <span className={styles.statNumber}>{facultyDetails.statistics.studentCount}</span>
                                    </div>
                                    <div className={styles.statColumn}>
                                        <span className={styles.statLabel}>SUPERVISOR EVALUATIONS</span>
                                        <span className={styles.statNumber}>{facultyDetails.statistics.supervisorCount}</span>
                                    </div>
                                </div>

                                <div className={styles.statsContainer}>
                                    <div className={styles.statColumn}>
                                        <span className={styles.statLabel}>STUDENT AVERAGE</span>
                                        <span className={styles.statNumberLarge}>
                                            {facultyDetails.statistics.studentAverage ? facultyDetails.statistics.studentAverage.toFixed(2) : 'N/A'}
                                        </span>
                                    </div>
                                    <div className={styles.statColumn}>
                                        <span className={styles.statLabel}>SUPERVISOR AVERAGE</span>
                                        <span className={styles.statNumberLarge}>
                                            {facultyDetails.statistics.supervisorAverage ? facultyDetails.statistics.supervisorAverage.toFixed(2) : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Overall Score */}
                                <div className={styles.overallScoreContainer}>
                                    <span className={styles.overallLabel}>OVERALL SCORE</span>
                                    <span className={styles.overallValue}>
                                        {facultyDetails.statistics.overallScore ? facultyDetails.statistics.overallScore.toFixed(2) : 'N/A'}
                                    </span>
                                </div>

                                {/* Computation Tables */}
                                {(facultyDetails.studentEvaluations.length > 0 || facultyDetails.supervisorEvaluations.length > 0) && (() => {
                                    // 1. Get Distinct Years from Data
                                    const distinctYears = Array.from(new Set([
                                        ...facultyDetails.studentEvaluations.map(e => e.year_label),
                                        ...facultyDetails.supervisorEvaluations.map(e => e.year_label)
                                    ].filter(Boolean))).sort();

                                    // 2. Determine Start Year (Earliest from data)
                                    let startYear = new Date().getFullYear();
                                    if (distinctYears.length > 0) {
                                        // Pick the earliest year found
                                        const match = distinctYears[0].match(/(\d{4})/);
                                        if (match) startYear = parseInt(match[1]);
                                    }

                                    // 3. Generate 3-Year Window (6 Semesters) starting from earliest
                                    const years = [
                                        `${startYear}-${startYear + 1}`,
                                        `${startYear + 1}-${startYear + 2}`,
                                        `${startYear + 2}-${startYear + 3}`
                                    ];

                                    // Helper: Get Average Score for a specific Year & Semester
                                    const getSemScore = (evals, yearLabel, semesterCheck) => {
                                        const matches = evals.filter(e =>
                                            e.year_label === yearLabel &&
                                            e.semester && e.semester.includes(semesterCheck)
                                        );

                                        if (matches.length === 0) return 0;
                                        const sum = matches.reduce((acc, curr) => acc + parseFloat(curr.total_score || 0), 0);
                                        return sum / matches.length;
                                    };

                                    // Fixed Divisor for 6 Semesters (3 Years)
                                    const divisor = 6;

                                    // Calculate Student Stats
                                    let studentSum = 0;
                                    years.forEach(yr => {
                                        studentSum += getSemScore(facultyDetails.studentEvaluations, yr, '1st');
                                        studentSum += getSemScore(facultyDetails.studentEvaluations, yr, '2nd');
                                    });
                                    const studentAverageCalc = studentSum / divisor;
                                    const studentPoints = (studentAverageCalc / 100) * 36;

                                    // Calculate Supervisor Stats
                                    let supervisorSum = 0;
                                    years.forEach(yr => {
                                        supervisorSum += getSemScore(facultyDetails.supervisorEvaluations, yr, '1st');
                                        supervisorSum += getSemScore(facultyDetails.supervisorEvaluations, yr, '2nd');
                                    });
                                    const supervisorAverageCalc = supervisorSum / divisor;
                                    const supervisorPoints = (supervisorAverageCalc / 100) * 24;

                                    const totalPoints = studentPoints + supervisorPoints;

                                    return (
                                        <div className={styles.computationSection}>
                                            <h3 className={styles.computationTitle}>Sample Computation</h3>

                                            {/* Student Table */}
                                            <div className={styles.tableWrapper}>
                                                <h4 className={styles.tableTitle}>1. Points for Student Evaluation</h4>
                                                <table className={styles.computationTable}>
                                                    <thead>
                                                        <tr>
                                                            <th rowSpan="2" style={{ width: '20%' }}>Semester</th>
                                                            {years.map(yr => <th key={yr} colSpan="2">{yr}</th>)}
                                                        </tr>
                                                        <tr>
                                                            {years.map(yr => (
                                                                <React.Fragment key={yr}>
                                                                    <th>1st Sem</th>
                                                                    <th>2nd Sem</th>
                                                                </React.Fragment>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>Ave. Student Eval. Ratings</td>
                                                            {years.map(yr => (
                                                                <React.Fragment key={yr}>
                                                                    <td>
                                                                        {(() => {
                                                                            const s = getSemScore(facultyDetails.studentEvaluations, yr, '1st');
                                                                            return s > 0 ? s.toFixed(2) : 'N/A';
                                                                        })()}
                                                                    </td>
                                                                    <td>
                                                                        {(() => {
                                                                            const s = getSemScore(facultyDetails.studentEvaluations, yr, '2nd');
                                                                            return s > 0 ? s.toFixed(2) : 'N/A';
                                                                        })()}
                                                                    </td>
                                                                </React.Fragment>
                                                            ))}
                                                        </tr>
                                                        <tr>
                                                            <td>Average</td>
                                                            <td colSpan="6" className={styles.computationCell}>
                                                                {`(${studentSum.toFixed(2)}) / 6 = ${studentAverageCalc.toFixed(2)}`}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Points (x 0.36)</td>
                                                            <td colSpan="6" className={styles.computationCell}>
                                                                <strong>{studentPoints.toFixed(2)}</strong>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Supervisor Table */}
                                            <div className={styles.tableWrapper}>
                                                <h4 className={styles.tableTitle}>2. Points for Supervisor's Evaluation</h4>
                                                <table className={styles.computationTable}>
                                                    <thead>
                                                        <tr>
                                                            <th rowSpan="2" style={{ width: '20%' }}>Semester</th>
                                                            {years.map(yr => <th key={yr} colSpan="2">{yr}</th>)}
                                                        </tr>
                                                        <tr>
                                                            {years.map(yr => (
                                                                <React.Fragment key={yr}>
                                                                    <th>1st Sem</th>
                                                                    <th>2nd Sem</th>
                                                                </React.Fragment>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>Supervisor's Rating</td>
                                                            {years.map(yr => (
                                                                <React.Fragment key={yr}>
                                                                    <td>
                                                                        {(() => {
                                                                            const s = getSemScore(facultyDetails.supervisorEvaluations, yr, '1st');
                                                                            return s > 0 ? s.toFixed(2) : 'N/A';
                                                                        })()}
                                                                    </td>
                                                                    <td>
                                                                        {(() => {
                                                                            const s = getSemScore(facultyDetails.supervisorEvaluations, yr, '2nd');
                                                                            return s > 0 ? s.toFixed(2) : 'N/A';
                                                                        })()}
                                                                    </td>
                                                                </React.Fragment>
                                                            ))}
                                                        </tr>
                                                        <tr>
                                                            <td>Average</td>
                                                            <td colSpan="6" className={styles.computationCell}>
                                                                {`(${supervisorSum.toFixed(2)}) / 6 = ${supervisorAverageCalc.toFixed(2)}`}
                                                            </td>
                                                        </tr>                                                        <tr>
                                                            <td>Points (x 0.24)</td>
                                                            <td colSpan="6" className={styles.computationCell}>
                                                                <strong>{supervisorPoints.toFixed(2)}</strong>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Summary Table */}
                                            <div className={styles.tableWrapper}>
                                                <h4 className={styles.tableTitle}>3. Faculty Performance Evaluation</h4>
                                                <table className={styles.computationTable}>
                                                    <thead>
                                                        <tr>
                                                            <th>Category</th>
                                                            <th>Points</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>Student Evaluation</td>
                                                            <td>{studentPoints.toFixed(2)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Supervisor's Evaluation</td>
                                                            <td>{supervisorPoints.toFixed(2)}</td>
                                                        </tr>
                                                        <tr className={styles.totalRow}>
                                                            <td><strong>Total Points</strong></td>
                                                            <td><strong>{totalPoints.toFixed(2)}</strong></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
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
