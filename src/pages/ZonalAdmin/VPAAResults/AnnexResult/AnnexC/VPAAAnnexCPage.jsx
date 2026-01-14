import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { DashboardLayout } from '../../../../../components/DashboardLayout/DashboardLayout';
import styles from './VPAAAnnexCPage.module.css';

const VPAAAnnexCPage = () => {
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

    // Calculate Cumulative Average
    let totalRating = 0;
    let count = 0;
    supervisorEvaluations.forEach(e => {
        totalRating += parseFloat(e.rating);
        count++;
    });

    const average = count > 0 ? totalRating / count : 0;
    const percentage = (average / 5) * 100;
    const points = percentage * 0.24;

    // Determine Category
    let category = 'NEEDS IMPROVEMENT';
    if (percentage >= 90) category = 'OUTSTANDING';
    else if (percentage >= 80) category = 'VERY SATISFACTORY';
    else if (percentage >= 70) category = 'SATISFACTORY';
    else if (percentage >= 60) category = 'FAIR';

    // Determine Rating Period Display
    // If multiple, show range? Or just "Accumulated"
    const uniquePeriods = Array.from(new Set(supervisorEvaluations.map(e => `${e.semester} / ${e.academic_year_label}`)));
    const ratingPeriod = uniquePeriods.length > 0
        ? (uniquePeriods.length > 1 ? `${uniquePeriods[0]} - ${uniquePeriods[uniquePeriods.length - 1]} (Accumulated)` : uniquePeriods[0])
        : 'N/A';

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
                    ANNEX C – INDIVIDUAL PERFORMANCE EVALUATION REPORT
                </div>

                <div className={styles.mainTitle}>
                    INDIVIDUAL PERFORMANCE EVALUATION REPORT
                </div>

                <div className={styles.sectionTitle}>Evaluation Information</div>

                <table className={styles.infoTable}>
                    <tbody>
                        <tr>
                            <td className={styles.labelCell}>Evaluatee</td>
                            <td className={styles.separator}>:</td>
                            <td className={styles.valueCell}>{faculty.name}</td>
                        </tr>
                        <tr>
                            <td className={styles.labelCell}>Evaluator</td>
                            <td className={styles.separator}>:</td>
                            <td className={styles.valueCell}>President</td>
                        </tr>
                        <tr>
                            <td className={styles.labelCell}>Rating Period</td>
                            <td className={styles.separator}>:</td>
                            <td className={styles.valueCell}>{ratingPeriod}</td>
                        </tr>
                    </tbody>
                </table>

                <div className={styles.sectionTitle}>Teaching Effectiveness (KRA I)</div>

                <table className={styles.infoTable}>
                    <tbody>
                        <tr>
                            <td className={styles.labelCell}>Raw Supervisor Score</td>
                            <td className={styles.separator}>:</td>
                            <td className={styles.valueCell}>{percentage.toFixed(2)} / 100</td>
                        </tr>
                        <tr>
                            <td className={styles.labelCell}>NBC 461 Points</td>
                            <td className={styles.separator}>:</td>
                            <td className={styles.valueCell}>{points.toFixed(2)} / 24</td>
                        </tr>
                    </tbody>
                </table>

                <div className={styles.sectionTitle}>Performance Summary</div>

                <table className={styles.infoTable}>
                    <tbody>
                        <tr>
                            <td className={styles.labelCell}>Equivalent Percentage</td>
                            <td className={styles.separator}>:</td>
                            <td className={styles.valueCell}>{percentage.toFixed(2)}%</td>
                        </tr>
                        <tr>
                            <td className={styles.labelCell}>Performance Rating</td>
                            <td className={styles.separator}>:</td>
                            <td className={styles.valueCell}>{category}</td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </DashboardLayout>
    );
};

export default VPAAAnnexCPage;
