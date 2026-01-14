import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { useToast } from '@/hooks/useToast';
import styles from './AnnexBPage.module.css';

export function AnnexBPage() {
    const { facultyId } = useParams();
    const navigate = useNavigate();
    const { error: showError } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(null);
    const [facultyInfo, setFacultyInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch Annex B (Computation Summary) data
                const response = await fetch(`http://localhost:5000/api/qce/evaluation-results/faculty/${facultyId}/annex/annex-b`);
                const result = await response.json();

                if (result.success) {
                    setData(result.data);
                }

                // Fetch Basic Faculty Info
                const facResponse = await fetch(`http://localhost:5000/api/qce/evaluation-results/faculty/${facultyId}`);
                const facResult = await facResponse.json();
                if (facResult.success) {
                    setFacultyInfo(facResult.data.faculty);
                }
            } catch (error) {
                console.error('Error:', error);
                showError('Failed to load data');
            } finally {
                setIsLoading(false);
            }
        };

        if (facultyId) fetchData();
    }, [facultyId]);

    const getProjectedYears = (baseYearLabel) => {
        if (!baseYearLabel) return [];
        try {
            const [start, end] = baseYearLabel.split('-').map(Number);
            return [
                baseYearLabel,
                `${start + 1}-${end + 1}`,
                `${start + 2}-${end + 2}`
            ];
        } catch (e) {
            return [baseYearLabel, 'N/A', 'N/A'];
        }
    };

    const getScore = (stats, year, semIndex) => {
        if (!stats) return null;
        // semIndex: 0 = 1st Sem, 1 = 2nd Sem
        const found = stats.find(s => {
            const sYear = s.year_label.trim();
            const sSem = s.semester.toLowerCase();
            const isTargetYear = sYear === year;
            const isTargetSem = semIndex === 0
                ? (sSem.includes('1st') || sSem.includes('first'))
                : (sSem.includes('2nd') || sSem.includes('second'));

            return isTargetYear && isTargetSem;
        });
        return found ? parseFloat(found.avg_score) : null;
    };

    if (isLoading) {
        return (
            <DashboardLayout role="QCE Manager">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
                </div>
            </DashboardLayout>
        );
    }

    const userName = sessionStorage.getItem('fullName') || 'Administrator';
    const years = data ? getProjectedYears(data.activeYear) : ['-', '-', '-'];

    const isSupervisorOnly = facultyInfo && ['dean', 'president', 'vpaa', 'department chair', 'department chairman'].some(role => facultyInfo.position && facultyInfo.position.toLowerCase().includes(role));

    // Calculation Helper - Dynamic Divisor for Deans
    const calculateSection = (stats, multiplier, useDynamicDivisor = false) => {
        let total = 0;
        let count = 0;
        const values = [];

        years.forEach(year => {
            [0, 1].forEach(semIndex => {
                const val = getScore(stats, year, semIndex);
                values.push(val);
                if (val !== null) {
                    total += val;
                    count++;
                }
            });
        });

        // For Deans (isSupervisorOnly), we use the actual count to get the true average of available evaluations
        // For Regular Faculty, we traditionally divide by 6 (NBC 461 standard for 3-year term)
        const divisor = useDynamicDivisor ? Math.max(count, 1) : 6;

        const average = total / divisor; // 5-point scale average
        const percentage = (average / 5) * 100; // Convert to 100-point scale
        const points = percentage * multiplier;

        return {
            values,
            average,
            percentage,
            points,
            divisor
        };
    };

    const studentCalc = calculateSection(data?.studentStats, 0.36, false);
    // Use dynamic divisor for Deans to match "Raw Score" expectation if only specific evals exist
    const supervisorCalc = calculateSection(data?.supervisorStats, 0.24, isSupervisorOnly);

    const totalPoints = (isSupervisorOnly ? 0 : studentCalc.points) + supervisorCalc.points;

    return (
        <DashboardLayout role="QCE Manager" userName={userName}>
            <div className={styles.reportContainer}>
                {/* Header Actions */}
                <div className={styles.actionButtons}>
                    <button onClick={() => navigate(-1)} className={styles.backButton}>
                        <ArrowLeft className={styles.buttonIcon} />
                        Back to Results
                    </button>
                    <button onClick={() => window.print()} className={styles.printButton}>
                        <Printer className={styles.buttonIcon} />
                        Print Report
                    </button>
                </div>

                {/* Report Content */}
                <div className={styles.header}>
                    <h1 className={styles.mainTitle}>ANNEX B - Supervisor's Evaluation of Teachers (SEF)</h1>
                </div>

                <div className={styles.facultyInfo}>
                    <div className={styles.subtitle}>The QCE of the NBC No. 461</div>
                    {facultyInfo && (
                        <>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Name of Faculty:</span>
                                <span className={styles.infoValue}>{facultyInfo.name}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Academic Rank:</span>
                                <span className={styles.infoValue}>{facultyInfo.position}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Sample Computation Section */}
                <div className={styles.computationSection}>
                    <h2 className={styles.computationTitle}>Sample Computation</h2>

                    {/* 1. Points for Student Evaluation - HIDE for Deans */}
                    {!isSupervisorOnly && (
                        <div className={styles.tableSection}>
                            <h3 className={styles.sectionTitle}>1. Points for Student Evaluation</h3>
                            <table className={styles.computationTable}>
                                <thead>
                                    <tr>
                                        <th rowSpan="2">Semester</th>
                                        {years.map(year => (
                                            <th key={year} colSpan="2">{year}</th>
                                        ))}
                                    </tr>
                                    <tr>
                                        <th>1st Sem</th>
                                        <th>2nd Sem</th>
                                        <th>1st Sem</th>
                                        <th>2nd Sem</th>
                                        <th>1st Sem</th>
                                        <th>2nd Sem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Ave. Student Eval. Ratings</td>
                                        {studentCalc.values.map((val, idx) => (
                                            <td key={idx}>{val !== null ? val.toFixed(2) : 'N/A'}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td>Average</td>
                                        <td colSpan="6" className={styles.centerText}>
                                            ({studentCalc.values.reduce((a, b) => a + (b || 0), 0).toFixed(2)}) / {studentCalc.divisor} = {studentCalc.average.toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Percentage Rating</td>
                                        <td colSpan="6" className={styles.centerText}>
                                            {studentCalc.average.toFixed(2)} / 5.00 = <strong>{studentCalc.percentage.toFixed(2)}%</strong>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Points (Percentage x 0.36)</td>
                                        <td colSpan="6" className={styles.centerText}>
                                            <strong>{studentCalc.points.toFixed(2)}</strong>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 2. Points for Supervisor's Evaluation */}
                    <div className={styles.tableSection}>
                        <h3 className={styles.sectionTitle}>{isSupervisorOnly ? '1.' : '2.'} Points for Supervisor's Evaluation</h3>
                        <table className={styles.computationTable}>
                            <thead>
                                <tr>
                                    <th rowSpan="2">Semester</th>
                                    {years.map(year => (
                                        <th key={year} colSpan="2">{year}</th>
                                    ))}
                                </tr>
                                <tr>
                                    <th>1st Sem</th>
                                    <th>2nd Sem</th>
                                    <th>1st Sem</th>
                                    <th>2nd Sem</th>
                                    <th>1st Sem</th>
                                    <th>2nd Sem</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Supervisor's Rating</td>
                                    {supervisorCalc.values.map((val, idx) => (
                                        <td key={idx}>{val !== null ? val.toFixed(2) : 'N/A'}</td>
                                    ))}
                                </tr>
                                <tr>
                                    <td>Average</td>
                                    <td colSpan="6" className={styles.centerText}>
                                        ({supervisorCalc.values.reduce((a, b) => a + (b || 0), 0).toFixed(2)}) / {supervisorCalc.divisor} = {supervisorCalc.average.toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Percentage Rating</td>
                                    <td colSpan="6" className={styles.centerText}>
                                        {supervisorCalc.average.toFixed(2)} / 5.00 = <strong>{supervisorCalc.percentage.toFixed(2)}%</strong>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Points (Percentage x 0.24)</td>
                                    <td colSpan="6" className={styles.centerText}>
                                        <strong>{supervisorCalc.points.toFixed(2)}</strong>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* 3. Faculty Performance Evaluation */}
                    <div className={styles.tableSection}>
                        <h3 className={styles.sectionTitle}>{isSupervisorOnly ? '2.' : '3.'} Faculty Performance Evaluation</h3>
                        <table className={styles.summaryTable}>
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!isSupervisorOnly && (
                                    <tr>
                                        <td>Student Evaluation</td>
                                        <td>{studentCalc.points.toFixed(2)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td>Supervisor's Evaluation</td>
                                    <td>{supervisorCalc.points.toFixed(2)}</td>
                                </tr>
                                <tr className={styles.totalRow}>
                                    <td><strong>Total Points</strong></td>
                                    <td>
                                        <strong>{totalPoints.toFixed(2)}</strong>
                                        {isSupervisorOnly && <span style={{ fontSize: '0.8em', fontWeight: 'normal', color: '#666', marginLeft: '5px' }}>(Max 24)</span>}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
