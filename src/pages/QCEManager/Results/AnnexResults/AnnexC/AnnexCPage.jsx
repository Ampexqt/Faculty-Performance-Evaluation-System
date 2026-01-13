import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { useToast } from '@/hooks/useToast';
import styles from './AnnexCPage.module.css';

const NEW_CRITERIA = {
    'A. Management of Teaching and Learning': [
        'Comes to class on time.',
        'Explains learning outcomes, expectations, grading system, and various requirements of the subject/course.',
        'Maximizes the allocated teaching hours effectively.',
        'Facilitates students to think critically and creatively by providing appropriate learning activities.',
        'Guides students to learn on their own, reflect on their learning and monitor their own progress.',
        'Provides timely and constructive feedback on student performance to improve learning.'
    ],
    'B. Content Knowledge, Pedagogy, and Technology': [
        'Demonstrates extensive and broad knowledge of the subject/course.',
        'Simplifies complex ideas in the lesson for ease of understanding.',
        'Relates the subject matter to contemporary issues and developments in the discipline and daily life activities.',
        'Promotes active learning and student engagement by using appropriate teaching and learning resources, including ICT tools and platforms.',
        'Uses appropriate assessments (projects, exams, quizzes, assignments, etc.) aligned with the learning outcomes.'
    ],
    'C. Commitment and Transparency': [
        'Recognizes and values the unique diversity and individual differences among students.',
        'Assists students with their learning challenges during consultation hours.',
        'Provides immediate feedback on student outputs and performance.',
        'Provides transparent and clear criteria in rating student performance.'
    ]
};

const CRITERIA_DESCRIPTIONS = {
    'A. Management of Teaching and Learning': 'Management of Teaching and Learning refers to the standard and organized planning of instructional activities, clear communication of academic expectations, efficient use of time, and the successful use of student-centered activities that promote critical thinking, collaborative learning, individual decision making, and continuous academic improvement through constructive feedback.',
    'B. Content Knowledge, Pedagogy, and Technology': 'Content knowledge, pedagogy, and technology refer to teachers\' ability to demonstrate a strong grasp of subject matter, present concepts in a clear and accessible way, relate content to relevant and current developments, engage students through appropriate instructional strategies and digital tools, and apply assessment methods aligned with intended learning outcomes.',
    'C. Commitment and Transparency': 'Commitment and transparency refer to the teacher\'s consistent dedication to supporting student learning by demonstrating professionalism, providing timely academic support and feedback, and upholding fairness and accountability through the use of clear and openly communicated performance criteria.'
};

export function AnnexCPage() {
    const { facultyId } = useParams();
    const navigate = useNavigate();
    const { error: showError } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState({ ratings: {} });
    const [facultyInfo, setFacultyInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/api/qce/evaluation-results/faculty/${facultyId}/annex/annex-c`);
                const result = await response.json();

                if (result.success) {
                    setData(result.data);
                }

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
    let currentOffset = 0;
    const categoryOffsets = {};
    Object.entries(NEW_CRITERIA).forEach(([key, items]) => {
        categoryOffsets[key] = currentOffset;
        currentOffset += items.length;
    });

    return (
        <DashboardLayout role="QCE Manager" userName={userName}>
            <div className={styles.reportContainer}>
                {/* Header Actions */}
                <div className="print:hidden" style={{ marginBottom: '1.5rem' }}>
                    <button onClick={() => navigate(-1)} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Results
                    </button>
                    <button onClick={() => window.print()} className="float-right inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-800 hover:bg-red-900">
                        <Printer className="w-4 h-4 mr-2" />
                        Print Report
                    </button>
                </div>

                {/* Report Content */}
                <div className={styles.header}>
                    <h1 className={styles.title}>ANNEX C</h1>
                    <p className={styles.subtitle}>Peer Evaluation (Program Chair)</p>
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

                {/* Criteria Tables */}
                {Object.entries(NEW_CRITERIA).map(([category, criteria]) => (
                    <div key={category} className={styles.categorySection}>
                        <h3 className={styles.categoryTitle}>{category}</h3>
                        <p className={styles.categoryDescription}>({CRITERIA_DESCRIPTIONS[category]})</p>

                        <table className={styles.criteriaTable}>
                            <thead>
                                <tr>
                                    <th className={styles.numberCol}>#</th>
                                    <th className={styles.indicatorCol}>Indicators</th>
                                    <th className={styles.ratingCol}>Average Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {criteria.map((criterion, index) => {
                                    const shortCode = category.charAt(0);
                                    const ratingKey = `${shortCode}-${index}`;
                                    const rating = data.ratings[ratingKey] || 0;

                                    return (
                                        <tr key={index}>
                                            <td className={styles.numberCol}>
                                                {categoryOffsets[category] + index + 1}
                                            </td>
                                            <td className={styles.indicatorCol}>{criterion}</td>
                                            <td className={styles.ratingCol}>
                                                {rating > 0 ? rating.toFixed(2) : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className={styles.averageRow}>
                            <strong>Average ({category.split('.')[0]}):</strong>
                            {(() => {
                                const shortCode = category.charAt(0);
                                const catRatings = criteria.map((_, i) => data.ratings[`${shortCode}-${i}`] || 0).filter(r => r > 0);
                                const sum = catRatings.reduce((a, b) => a + b, 0);
                                const avg = catRatings.length ? sum / catRatings.length : 0;
                                return avg.toFixed(2);
                            })()}
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
