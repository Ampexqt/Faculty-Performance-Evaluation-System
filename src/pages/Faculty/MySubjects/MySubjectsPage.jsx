import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Badge } from '@/components/Badge/Badge';
import styles from './MySubjectsPage.module.css';

// Mock data - Subject evaluation status
const mockSubjects = [
    {
        id: 1,
        subjectCode: 'CS101',
        subjectName: 'Intro to Computing',
        section: 'BSCS 1-A',
        evalCode: 'X7K-9P2',
        progress: 71,
        totalStudents: 100
    },
    {
        id: 2,
        subjectCode: 'CS102',
        subjectName: 'Programming I',
        section: 'BSCS 1-B',
        evalCode: 'M4R-2L9',
        progress: 39,
        totalStudents: 100
    },
];

// Mock data - Recent evaluators
const mockEvaluators = [
    {
        id: 1,
        studentName: 'Student Name Hidden',
        section: 'BSCS 1-A',
        status: 'Submitted'
    },
    {
        id: 2,
        studentName: 'Student Name Hidden',
        section: 'BSCS 1-A',
        status: 'Submitted'
    },
    {
        id: 3,
        studentName: 'Student Name Hidden',
        section: 'BSCS 1-A',
        status: 'Submitted'
    },
];

export function MySubjectsPage() {
    const [subjects] = useState(mockSubjects);
    const [evaluators] = useState(mockEvaluators);

    const getProgressColor = (progress) => {
        if (progress >= 70) return styles.progressHigh;
        if (progress >= 40) return styles.progressMedium;
        return styles.progressLow;
    };

    return (
        <DashboardLayout
            role="Faculty"
            userName="Faculty Member"
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
                                        <th>Progress</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects.map((subject) => (
                                        <tr key={subject.id}>
                                            <td>
                                                <div className={styles.subjectInfo}>
                                                    <span className={styles.subjectCode}>{subject.subjectCode}</span>
                                                    <span className={styles.subjectName}>{subject.subjectName}</span>
                                                </div>
                                            </td>
                                            <td>{subject.section}</td>
                                            <td>
                                                <div className={styles.evalCode}>
                                                    {subject.evalCode}
                                                    <button className={styles.copyButton}>
                                                        <Copy size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.progressContainer}>
                                                    <div className={styles.progressBar}>
                                                        <div
                                                            className={`${styles.progressFill} ${getProgressColor(subject.progress)}`}
                                                            style={{ width: `${subject.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={styles.progressText}>
                                                        {subject.progress}/{subject.totalStudents}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Evaluators */}
                    <div className={styles.sidebar}>
                        <h2 className={styles.sectionTitle}>Recent Evaluators</h2>

                        <div className={styles.evaluatorsList}>
                            {evaluators.map((evaluator) => (
                                <div key={evaluator.id} className={styles.evaluatorCard}>
                                    <div className={styles.evaluatorInfo}>
                                        <span className={styles.evaluatorName}>{evaluator.studentName}</span>
                                        <span className={styles.evaluatorSection}>{evaluator.section}</span>
                                    </div>
                                    <Badge variant="success">{evaluator.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
