import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { useToast } from '@/hooks/useToast';
import styles from './AnnexDPage.module.css';

export function AnnexDPage() {
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
                // Fetch Annex D data
                const response = await fetch(`http://localhost:5000/api/qce/evaluation-results/faculty/${facultyId}/annex/annex-d`);
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
                    <h1 className={styles.mainTitle}>ANNEX D – Faculty Evaluation Acknowledgement Form</h1>
                </div>

                <div className={styles.reportTitle}>
                    <h2>FACULTY EVALUATION ACKNOLWEDGEMENT FORM</h2>
                </div>

                {/* Faculty Member Information */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>FACULTY MEMBER INFORMATION</h3>
                    <table className={styles.infoTable}>
                        <tbody>
                            <tr>
                                <td className={styles.labelCell}>Name of Faculty</td>
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

                {/* Faculty Evaluation Summary */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>FACULTY EVALUATION SUMMARY</h3>
                    <table className={styles.summaryTable}>
                        <thead>
                            <tr>
                                <th colSpan="2">Overall Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Student Evaluation of Teachers (SET)</td>
                                <td>Supervisor's Evaluation of Faculty (SAF)</td>
                            </tr>
                            <tr>
                                <td className={styles.scoreCell}>
                                    <strong>{data?.setScore ? data.setScore.toFixed(2) : '0.00'}</strong>
                                </td>
                                <td className={styles.scoreCell}>
                                    <strong>{data?.safScore ? data.safScore.toFixed(2) : '0.00'}</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Acknowledgement Text */}
                <div className={styles.acknowledgement}>
                    <p>
                        I acknowledge that I have received and reviewed the faculty evaluation conducted for
                        the period mentioned above. I understand that my signature below does not
                        necessarily indicate agreement with the evaluation but confirms that I have been
                        given the opportunity to discuss it with my supervisor.
                    </p>
                </div>

                {/* Signature Sections */}
                <div className={styles.signatureSection}>
                    <h4 className={styles.signatureHeader}>SUPERVISOR</h4>
                    <table className={styles.signatureTable}>
                        <tbody>
                            <tr>
                                <td className={styles.signatureLabel}>Signature</td>
                                <td className={styles.signatureColon}>:</td>
                                <td className={styles.signatureLine}></td>
                            </tr>
                            <tr>
                                <td className={styles.signatureLabel}>Name</td>
                                <td className={styles.signatureColon}>:</td>
                                <td className={styles.signatureLine}></td>
                            </tr>
                            <tr>
                                <td className={styles.signatureLabel}>Date Signed</td>
                                <td className={styles.signatureColon}>:</td>
                                <td className={styles.signatureLine}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className={styles.signatureSection}>
                    <h4 className={styles.signatureHeader}>FACULTY</h4>
                    <table className={styles.signatureTable}>
                        <tbody>
                            <tr>
                                <td className={styles.signatureLabel}>Signature</td>
                                <td className={styles.signatureColon}>:</td>
                                <td className={styles.signatureLine}></td>
                            </tr>
                            <tr>
                                <td className={styles.signatureLabel}>Name</td>
                                <td className={styles.signatureColon}>:</td>
                                <td className={styles.signatureLine}></td>
                            </tr>
                            <tr>
                                <td className={styles.signatureLabel}>Date Signed</td>
                                <td className={styles.signatureColon}>:</td>
                                <td className={styles.signatureLine}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
