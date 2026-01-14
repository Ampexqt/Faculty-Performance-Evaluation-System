import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { useToast } from '@/hooks/useToast';
import styles from './AnnexCPage.module.css';

export function AnnexCPage() {
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
                // Fetch Annex C (Individual Faculty Evaluation Report) data
                const response = await fetch(`http://localhost:5000/api/qce/evaluation-results/faculty/${facultyId}/annex/annex-c`);
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

    const isSupervisorOnly = facultyInfo && ['dean', 'president', 'vpaa', 'department chair', 'department chairman'].some(role => facultyInfo.position && facultyInfo.position.toLowerCase().includes(role));

    // Calculations for Supervisor-Only View (Annex C)
    const sefRating = data?.sefRating ? parseFloat(data.sefRating) : 0;
    const rawScore100 = (sefRating / 5) * 100; // Convert 5-point to 100-point
    const nbcPoints = rawScore100 * 0.24; // NBC 461 Points (Max 24)

    const getPerformanceRating = (score) => {
        if (score >= 95) return 'Outstanding';
        if (score >= 90) return 'Very Satisfactory';
        if (score >= 85) return 'Satisfactory';
        if (score >= 80) return 'Moderately Satisfactory';
        if (score >= 75) return 'Fair';
        return 'Poor';
    };
    const performanceRating = getPerformanceRating(rawScore100);

    // Determine Evaluator Title
    const getEvaluatorTitle = () => {
        if (!facultyInfo?.position) return 'Supervisor';
        const pos = facultyInfo.position.toLowerCase();
        if (pos.includes('president')) return 'Board of Trustees';
        if (pos.includes('vpaa')) return 'President';
        if (pos.includes('dean')) return 'VPAA';
        if (pos.includes('department chair')) return 'Dean';
        return 'Supervisor';
    };

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

                {isSupervisorOnly ? (
                    <>
                        {/* Report Content */}
                        <div className={styles.header}>
                            <h1 className={styles.mainTitle}>ANNEX C – INDIVIDUAL PERFORMANCE EVALUATION REPORT</h1>
                        </div>

                        <div className={styles.reportTitle}>
                            <h2>INDIVIDUAL PERFORMANCE EVALUATION REPORT</h2>
                        </div>

                        {/* Basic Information Card */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Evaluation Information</h3>
                            <table className={styles.infoTable}>
                                <tbody>
                                    <tr>
                                        <td className={styles.labelCell}>Evaluatee</td>
                                        <td className={styles.colonCell}>:</td>
                                        <td className={styles.valueCell}>{facultyInfo?.name || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.labelCell}>Evaluator</td>
                                        <td className={styles.colonCell}>:</td>
                                        <td className={styles.valueCell}>{getEvaluatorTitle()}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.labelCell}>Rating Period</td>
                                        <td className={styles.colonCell}>:</td>
                                        <td className={styles.valueCell}>
                                            {data?.semester || '1st Semester'} / {data?.academicYear || '2025-2026'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Teaching Effectiveness Section */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Teaching Effectiveness (KRA I)</h3>
                            <table className={styles.infoTable}>
                                <tbody>
                                    <tr>
                                        <td className={styles.labelCell}>Raw Supervisor Score</td>
                                        <td className={styles.colonCell}>:</td>
                                        <td className={styles.valueCell}>
                                            <strong>{rawScore100.toFixed(2)} / 100</strong>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={styles.labelCell}>NBC 461 Points</td>
                                        <td className={styles.colonCell}>:</td>
                                        <td className={styles.valueCell}>
                                            <strong>{nbcPoints.toFixed(2)} / 24</strong>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Performance Summary Section */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Performance Summary</h3>
                            <table className={styles.infoTable}>
                                <tbody>
                                    <tr>
                                        <td className={styles.labelCell}>Equivalent Percentage</td>
                                        <td className={styles.colonCell}>:</td>
                                        <td className={styles.valueCell}>
                                            <strong>{rawScore100.toFixed(2)}%</strong>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={styles.labelCell}>Performance Rating</td>
                                        <td className={styles.colonCell}>:</td>
                                        <td className={styles.valueCell}>
                                            <strong>{performanceRating.toUpperCase()}</strong>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Report Content */}
                        <div className={styles.header}>
                            <h1 className={styles.mainTitle}>ANNEX C – Individual Faculty Evaluation Report</h1>
                        </div>

                        <div className={styles.reportTitle}>
                            <h2>INDIVIDUAL FACULTY EVALUATION REPORT</h2>
                        </div>

                        {/* A. Faculty Information */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>A. Faculty Information</h3>
                            <table className={styles.infoTable}>
                                <tbody>
                                    <tr>
                                        <td className={styles.labelCell}>Name of Faculty Evaluated</td>
                                        <td className={styles.colonCell}>:</td>
                                        <td className={styles.valueCell}>{facultyInfo?.name || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.labelCell}>Department/College</td>
                                        <td className={styles.colonCell}>:</td>
                                        <td className={styles.valueCell}>{facultyInfo?.college_name || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.labelCell}>Current Faculty Rank</td>
                                        <td className={styles.colonCell}>:</td>
                                        <td className={styles.valueCell}>{facultyInfo?.position || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.labelCell}>Semester/Term & Academic Year</td>
                                        <td className={styles.colonCell}>:</td>
                                        <td className={styles.valueCell}>
                                            {data?.semester || '1st Semester'} / {data?.academicYear || '2025-2026'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* B. Summary of Average SET Rating */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>B. Summary of Average SET Rating</h3>
                            <div className={styles.computation}>
                                <p><strong>Computation:</strong></p>
                                <p className={styles.step}>Step 1: Get the average SET rating for each class.</p>
                                <p className={styles.step}>Step 2: Multiply the number of students in each class with its average SET rating to get the Weighted Value per class.</p>
                                <p className={styles.step}>Step 3: Get the total number of students and the total weighted value.</p>
                            </div>

                            <table className={styles.dataTable}>
                                <thead>
                                    <tr>
                                        <th rowSpan="2"></th>
                                        <th>(1)</th>
                                        <th>(2)</th>
                                        <th className={styles.shadedCell}>(3)</th>
                                        <th className={styles.shadedCell}>(4)</th>
                                        <th className={styles.shadedCell}>(3 × 4)</th>
                                    </tr>
                                    <tr>
                                        <th>Course Code</th>
                                        <th>Section</th>
                                        <th className={styles.shadedCell}>No. of Students</th>
                                        <th className={styles.shadedCell}>Ave. SET Rating</th>
                                        <th className={styles.shadedCell}>Weighted Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.courses && data.courses.length > 0 ? (
                                        data.courses.map((course, index) => {
                                            const numStudents = course.num_students || 0;
                                            const avgRating = parseFloat(course.avg_rating) || 0;
                                            const weightedValue = numStudents * avgRating;

                                            return (
                                                <tr key={index}>
                                                    <td className={styles.centerText}>{index + 1}</td>
                                                    <td>{course.subject_code}</td>
                                                    <td>{course.section}</td>
                                                    <td className={`${styles.centerText} ${styles.shadedCell}`}>{numStudents}</td>
                                                    <td className={`${styles.centerText} ${styles.shadedCell}`}>{avgRating > 0 ? avgRating.toFixed(2) : 'N/A'}</td>
                                                    <td className={`${styles.centerText} ${styles.shadedCell}`}>{weightedValue > 0 ? weightedValue.toFixed(0) : 'N/A'}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className={styles.centerText}>No course data available</td>
                                        </tr>
                                    )}
                                    <tr className={styles.totalRow}>
                                        <td></td>
                                        <td></td>
                                        <td className={styles.centerText}><strong>TOTAL</strong></td>
                                        <td className={`${styles.centerText} ${styles.shadedCell}`}><strong>{data?.totalStudents || 0}</strong></td>
                                        <td className={`${styles.centerText} ${styles.shadedCell}`}><strong>TOTAL</strong></td>
                                        <td className={`${styles.centerText} ${styles.shadedCell}`}><strong>{data?.totalWeightedValue ? data.totalWeightedValue.toFixed(0) : 0}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* C. SET and SEF Ratings */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>C. SET and SEF Ratings</h3>
                            <div className={styles.computation}>
                                <p><strong>Computation:</strong> Calculate the Overall SET Rating by dividing the total weighted value by the total number of students. In the example above, the total weighted value is {data?.totalWeightedValue ? data.totalWeightedValue.toFixed(2) : '0.00'} while the total number of students is {data?.totalStudents || 0}. Therefore, {data?.totalWeightedValue ? data.totalWeightedValue.toFixed(2) : '0.00'} ÷ {data?.totalStudents || 0} = {data?.overallSETRating ? data.overallSETRating.toFixed(2) : '0.00'}.</p>
                            </div>

                            <table className={styles.ratingsTable}>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>SET Rating</th>
                                        <th>*SEF Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>OVERALL RATING</strong></td>
                                        <td className={styles.centerText}><strong>{data?.overallSETRating ? data.overallSETRating.toFixed(2) : '0.00'}</strong></td>
                                        <td className={styles.centerText}><strong>{data?.sefRating ? data.sefRating.toFixed(2) : '0.00'}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className={styles.note}><em>Note: rating given by the supervisor using the SEF instrument</em></p>
                        </div>

                        {/* D. Summary of Qualitative Comments and Suggestions */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>D. Summary of Qualitative Comments and Suggestions</h3>
                            <p className={styles.subsectionTitle}>Comments and Suggestions from the Students</p>

                            <table className={styles.commentsTable}>
                                <tbody>
                                    {data?.comments && data.comments.length > 0 ? (
                                        data.comments.slice(0, 5).map((comment, index) => (
                                            <tr key={index}>
                                                <td className={styles.numberCell}>{index + 1}</td>
                                                <td className={styles.commentCell}>{comment.text}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        Array.from({ length: 5 }).map((_, index) => (
                                            <tr key={index}>
                                                <td className={styles.numberCell}>{index + 1}</td>
                                                <td className={styles.commentCell}></td>
                                            </tr>
                                        ))
                                    )}
                                    <tr>
                                        <td colSpan="2" className={styles.additionalRow}>
                                            <em>(add additional rows if necessary)</em>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout >
    );
}
