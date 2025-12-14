import React, { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Badge } from '@/components/Badge/Badge';
import styles from './MySubjectsPage.module.css';

export function MySubjectsPage() {
    const [subjects, setSubjects] = useState([]);
    const [evaluators, setEvaluators] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSubjectsData = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            try {
                setIsLoading(true);
                // Fetch subjects
                const subjectsRes = await fetch(`http://localhost:5000/api/faculty/subjects/list?faculty_id=${userId}`);
                const subjectsData = await subjectsRes.json();

                if (subjectsData.success) {
                    setSubjects(subjectsData.data);
                }

                // Fetch evaluators
                const evaluatorsRes = await fetch(`http://localhost:5000/api/faculty/subjects/evaluators?faculty_id=${userId}`);
                const evaluatorsData = await evaluatorsRes.json();

                if (evaluatorsData.success) {
                    setEvaluators(evaluatorsData.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubjectsData();
    }, []);

    const getProgressColor = (evaluated, total) => {
        if (total === 0) return styles.progressLow;
        const percentage = (evaluated / total) * 100;
        if (percentage >= 70) return styles.progressHigh;
        if (percentage >= 40) return styles.progressMedium;
        return styles.progressLow;
    };

    return (
        <DashboardLayout
            role="Faculty"
            userName={localStorage.getItem('fullName') || "Faculty Member"}
            notificationCount={3}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>My Subjects</h1>
                        <p className={styles.subtitle}>Track evaluation progress for your subjects.</p>
                    </div>
                </div>

                <div className={styles.content}>
                    {/* Subject Evaluation Status */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Subject Evaluation Status</h2>

                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Section</th>
                                        <th>Eval Code</th>
                                        <th>Student Evaluate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                                No subjects assigned yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        subjects.map((subject) => (
                                            <tr key={subject.id}>
                                                <td>
                                                    <div className={styles.subjectInfo}>
                                                        <span className={styles.subjectCode}>{subject.subject_code}</span>
                                                        <span className={styles.subjectName}>{subject.subject_name}</span>
                                                    </div>
                                                </td>
                                                <td>{subject.section}</td>
                                                <td>
                                                    <div className={styles.evalCode}>
                                                        {subject.evalCode ? (
                                                            <>
                                                                {subject.evalCode}
                                                                <button className={styles.copyButton}>
                                                                    <Copy size={16} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>--</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.progressContainer}>
                                                        <div className={styles.progressBar}>
                                                            <div
                                                                className={`${styles.progressFill} ${getProgressColor(subject.students_evaluated, subject.total_students)}`}
                                                                style={{ width: `${subject.total_students > 0 ? (subject.students_evaluated / subject.total_students) * 100 : 0}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className={styles.progressText}>
                                                            {subject.students_evaluated}/{subject.total_students}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Evaluators */}
                    <div className={styles.sidebar}>
                        <h2 className={styles.sectionTitle}>Recent Evaluators</h2>

                        <div className={styles.evaluatorsList}>
                            {evaluators.length === 0 ? (
                                <p style={{ color: '#6b7280', textAlign: 'center' }}>No evaluations yet.</p>
                            ) : (
                                evaluators.map((evaluator) => (
                                    <div key={evaluator.id} className={styles.evaluatorCard}>
                                        <div className={styles.evaluatorInfo}>
                                            <span className={styles.evaluatorName}>{evaluator.studentName}</span>
                                            <span className={styles.evaluatorSection}>{evaluator.section}</span>
                                        </div>
                                        <Badge variant="success">{evaluator.status}</Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
