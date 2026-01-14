import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { DashboardLayout } from '../../../../../components/DashboardLayout/DashboardLayout';
import styles from './VPAAAnnexBPage.module.css';

const VPAAAnnexBPage = () => {
    const { vpaaId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

    useEffect(() => {
        fetchData();
    }, [vpaaId]);

    const fetchData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/zonal/vpaa-results/${vpaaId}`);
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
            </div>
        );
    }

    if (!data) return <div>VPAA not found</div>;

    const { faculty, supervisorEvaluations } = data;

    // Calculate display years (Always show 3 years)
    let startYear = 2025; // Default start year

    if (supervisorEvaluations.length > 0) {
        // Find the earliest year from evaluations to use as base
        // Assuming label format is "YYYY-YYYY"
        const years = supervisorEvaluations
            .map(e => parseInt(e.academic_year_label.split('-')[0]))
            .filter(y => !isNaN(y));

        if (years.length > 0) {
            startYear = Math.min(...years);
        }
    }

    // Generate 3 consecutive years starting from startYear
    const displayYears = [
        `${startYear}-${startYear + 1}`,
        `${startYear + 1}-${startYear + 2}`,
        `${startYear + 2}-${startYear + 3}`
    ];

    const getRating = (year, sem) => {
        const found = supervisorEvaluations.find(e => e.academic_year_label === year && e.semester.includes(sem));
        return found ? parseFloat(found.rating) : null;
    };

    let totalRating = 0;
    let count = 0;

    // Calculate totals
    displayYears.forEach(year => {
        ['1st', '2nd'].forEach(sem => {
            const r = getRating(year, sem);
            if (r !== null) {
                totalRating += r;
                count++;
            }
        });
    });

    const average = count > 0 ? totalRating / count : 0;
    const percentage = (average / 5) * 100;
    const points = percentage * 0.24;

    return (
        <DashboardLayout role="Zonal Admin" userName={userInfo.fullName} notificationCount={0}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button className={styles.backButton} onClick={() => navigate('/zonal/vpaa-results')}>
                        <ArrowLeft size={20} />
                        Back to Results
                    </button>
                    <button className={styles.printButton} onClick={handlePrint}>
                        <Printer size={20} />
                        Print Report
                    </button>
                </div>

                <div className={styles.title}>
                    ANNEX B - Supervisor's Evaluation of Teachers (SEF)
                </div>

                <div className={styles.infoSection}>
                    <div className={styles.subTitle}>The QCE of the NBC No. 461</div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Name of Faculty:</span>
                        <span className={styles.value}>{faculty.name}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Academic Rank:</span>
                        <span className={styles.value}>VPAA (Vice President for Academic Affairs)</span>
                    </div>
                </div>

                <div className={styles.computationTitle}>Sample Computation</div>

                <div className={styles.sectionTitle}>1. Points for Supervisor's Evaluation</div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th rowSpan="2" style={{ minWidth: '150px' }}>Semester</th>
                                {displayYears.map(year => (
                                    <th key={year} colSpan="2">{year}</th>
                                ))}
                            </tr>
                            <tr>
                                {displayYears.map(year => (
                                    <React.Fragment key={`${year}-subs`}>
                                        <th>1st Sem</th>
                                        <th>2nd Sem</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ textAlign: 'left', fontWeight: 600 }}>Supervisor's Rating</td>
                                {displayYears.map(year => (
                                    <React.Fragment key={year}>
                                        <td>{getRating(year, '1st')?.toFixed(2) || 'N/A'}</td>
                                        <td>{getRating(year, '2nd')?.toFixed(2) || 'N/A'}</td>
                                    </React.Fragment>
                                ))}
                            </tr>
                            <tr>
                                <td style={{ textAlign: 'left', fontWeight: 600 }}>Average</td>
                                <td colSpan={displayYears.length * 2}>
                                    {count > 0 ? `(${totalRating.toFixed(2)}) / ${count} = ${average.toFixed(2)}` : '0.00'}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: 'left', fontWeight: 600 }}>Percentage Rating</td>
                                <td colSpan={displayYears.length * 2}>
                                    {average > 0 ? `${average.toFixed(2)} / 5.00 = ${percentage.toFixed(2)}%` : '0.00%'}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: 'left', fontWeight: 600 }}>Points (Percentage x 0.24)</td>
                                <td colSpan={displayYears.length * 2} style={{ fontWeight: 700 }}>
                                    {points.toFixed(2)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className={styles.sectionTitle}>2. Faculty Performance Evaluation</div>

                <table className={styles.summaryTable}>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th style={{ textAlign: 'right' }}>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Supervisor's Evaluation</td>
                            <td>{points.toFixed(2)}</td>
                        </tr>
                        <tr className={styles.totalRow}>
                            <td>Total Points</td>
                            <td>{points.toFixed(2)} <span style={{ fontSize: '0.8em', fontWeight: 400 }}>(Max 24)</span></td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </DashboardLayout>
    );
};

export default VPAAAnnexBPage;
