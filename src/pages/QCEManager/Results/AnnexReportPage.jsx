import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { useToast } from '@/hooks/useToast';
import styles from '../../Student/EvaluationForm/EvaluationFormPage.module.css';

const OLD_CRITERIA = {
    'A. Commitment': [
        'Demonstrates sensitivity to students\' ability to attend and absorb content information.',
        'Integrates sensitively his/her learning objectives with those of the students in a collaborative process.',
        'Makes self available to students beyond official time.',
        'Regularly comes to class on time, well-groomed and well-prepared to complete assigned responsibilities.',
        'Keeps accurate records of students\' performance and prompt submission of the same.'
    ],
    'B. Knowledge of Subject': [
        'Demonstrates mastery of the subject matter (explains the subject matter without relying solely on the prescribed textbook).',
        'Draws and shares information on the state of the art of theory and practice in his/her discipline.',
        'Integrates subject to practical circumstances and learning intents/purposes of students.',
        'Explains the relevance of the present topic to the previous lessons and relates the subject matter to relevant current issues or daily life activities.',
        'Demonstrates up-to-date knowledge and/or awareness on current trends and issues of the subject.'
    ],
    'C. Teaching for Independent Learning': [
        'Creates teaching strategies that allow students to practice using concepts they need to understand (interactive discussion).',
        'Enhances student self-esteem and/or gives due recognition to students\' performance/potentials.',
        'Allows students to create their own course with objectives and realistically defined student-professor rules and makes them accountable for them.',
        'Allows students to think independently and make their own decisions and holds them accountable for their performance based largely on their success in executing decisions.',
        'Encourages students to learn beyond what is required and helps/ guides the students how to apply the concepts learned.'
    ],
    'D. Management of Learning': [
        'Creates opportunities for intensive and/or extensive contribution of the students in class activities (e.g., breaks class into dyads, triads, or buzz/task groups).',
        'Assumes roles of facilitator, resource person, coach, inquisitor, integrator, referee in drawing students to contribute to knowledge and understanding of concepts at hand.',
        'Designs and implements learning conditions and experiences that promote healthy exchange and/or confrontations.',
        'Structures/re-structures learning and teaching-learning context to enhance attainment of collective learning objectives.',
        'Uses instructional materials (audio-visual materials, field trips, film showing, computer-aided instruction, etc.) to reinforce learning processes.'
    ]
};

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

const NEW_CRITERIA_DESCRIPTIONS = {
    'A. Management of Teaching and Learning': 'Management of Teaching and Learning refers to the standard and organized planning of instructional activities, clear communication of academic expectations, efficient use of time, and the successful use of student-centered activities that promote critical thinking, collaborative learning, individual decision making, and continuous academic improvement through constructive feedback.',
    'B. Content Knowledge, Pedagogy, and Technology': 'Content knowledge, pedagogy, and technology refer to teachers’ ability to demonstrate a strong grasp of subject matter, present concepts in a clear and accessible way, relate content to relevant and current developments, engage students through appropriate instructional strategies and digital tools, and apply assessment methods aligned with intended learning outcomes.',
    'C. Commitment and Transparency': 'Commitment and transparency refer to the teacher’s consistent dedication to supporting student learning by demonstrating professionalism, providing timely academic support and feedback, and upholding fairness and accountability through the use of clear and openly communicated performance criteria.'
};

export function AnnexReportPage() {
    const { facultyId, annexType } = useParams();
    const navigate = useNavigate();
    const { error: showError } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState({ ratings: {}, criteriaType: 'new' });
    const [facultyInfo, setFacultyInfo] = useState(null);
    const [supervisorData, setSupervisorData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch Report Data
                const response = await fetch(`http://localhost:5000/api/qce/evaluation-results/faculty/${facultyId}/annex/${annexType}`);
                const result = await response.json();

                if (result.success) {
                    setData(result.data);
                } else {
                    showError(result.message || 'Failed to fetch report data');
                }

                // Fetch Faculty Info for header AND Supervisor Data
                const facResponse = await fetch(`http://localhost:5000/api/qce/evaluation-results/faculty/${facultyId}`);
                const facResult = await facResponse.json();
                if (facResult.success) {
                    setFacultyInfo(facResult.data.faculty);
                    setSupervisorData(facResult.data.supervisorEvaluations || []);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
                showError('An error occurred while fetching data');
            } finally {
                setIsLoading(false);
            }
        };

        if (facultyId && annexType) {
            fetchData();
        }
    }, [facultyId, annexType]);

    const activeCriteria = data.criteriaType === 'new' ? NEW_CRITERIA : OLD_CRITERIA;

    // Calculate offsets for continuous numbering if new criteria
    let currentOffset = 0;
    const categoryOffsets = {};
    if (data.criteriaType === 'new') {
        Object.entries(activeCriteria).forEach(([key, items]) => {
            categoryOffsets[key] = currentOffset;
            currentOffset += items.length;
        });
    }

    const annexLabel = annexType.replace('annex-', 'Annex ').toUpperCase();
    const reportTitle =
        annexType === 'annex-a' ? 'Student Evaluation of Faculty Performance' :
            annexType === 'annex-b' ? 'Peer Evaluation (Department Chair)' :
                annexType === 'annex-d' ? 'Supervisor Evaluation (Dean)' :
                    'Evaluation Report';

    const handlePrint = () => {
        window.print();
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

    return (
        <DashboardLayout role="QCE Manager" userName={userName}>
            <style>{`
                @media print {
                    @page {
                        margin: 0; /* Hides browser default headers/footers */
                        size: auto;
                    }
                    body {
                        visibility: hidden;
                        background: white;
                        margin: 0;
                    }
                    #report-content {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 2cm; /* Add padding to content instead of page margins */
                        background: white;
                        box-shadow: none !important;
                        font-size: 12pt !important;
                        line-height: 1.5;
                        box-sizing: border-box;
                    }
                    #report-content * {
                        visibility: visible;
                    }
                    
                    /* Typography */
                    h2 { font-size: 16pt !important; margin-bottom: 1rem !important; }
                    h3 { font-size: 14pt !important; margin-top: 1.5rem !important; margin-bottom: 0.5rem !important; page-break-after: avoid; }
                    h4 { font-size: 12pt !important; }
                    p, td, th, div, span { font-size: 12pt !important; }
                    
                    /* Page Breaks */
                    table { page-break-inside: auto; width: 100% !important; border-collapse: collapse; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                    
                    /* Table Layout Balance */
                    th, td { 
                        border: 1px solid #d1d5db !important; 
                        padding: 0.5rem !important; 
                        text-align: left;
                    }
                    /* Number Column */
                    th:nth-child(1), td:nth-child(1) {
                        width: 8% !important;
                        text-align: center;
                    }
                    /* Indicators Column */
                    th:nth-child(2), td:nth-child(2) {
                        width: 77% !important; /* Give most space to indicators */
                    }
                    /* Rating Column */
                    th:nth-child(3), td:nth-child(3) {
                        width: 15% !important;
                        text-align: center;
                        white-space: nowrap;
                    }
                    
                    /* Header styles for table */
                    th {
                        background-color: #991b1b !important;
                        color: white !important;
                        font-weight: bold !important;
                        -webkit-print-color-adjust: exact; 
                    }

                    /* Hide non-print elements explicitly if any remain */
                    button, .no-print { display: none !important; }

                    /* Ensure backgrounds print */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important; 
                    }
                }
            `}</style>
            <div className={styles.container}>
                {/* Header Actions */}
                <div className="print:hidden" style={{ marginBottom: '1.5rem' }}>
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.5rem 1rem',
                            backgroundColor: 'transparent',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                            e.currentTarget.style.borderColor = '#9ca3af';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = '#d1d5db';
                        }}
                    >
                        <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                        Back to Results
                    </button>

                    {/* Print Button - Top Right */}
                    <button
                        onClick={handlePrint}
                        style={{
                            position: 'absolute',
                            top: '80px',
                            right: '2rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.5rem 1.25rem',
                            backgroundColor: '#991b1b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#7f1d1d';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#991b1b';
                            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                        }}
                    >
                        <Printer style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                        Print Report
                    </button>
                </div>

                {/* Report Content */}
                <div id="report-content" className="bg-white rounded-lg shadow-sm p-8 print:shadow-none print:p-0">
                    {/* Centered ANNEX Title */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">{annexLabel}</h2>
                    </div>

                    {/* Faculty Information Table */}
                    <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
                        <div style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563' }}>
                            The QCE of the NBC No. 461
                        </div>
                        {facultyInfo && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', borderBottom: '1px solid #d1d5db', paddingBottom: '0.75rem' }}>
                                    <div style={{ fontWeight: '600', color: '#374151', width: '180px' }}>Name of Faculty:</div>
                                    <div style={{ color: '#111827', flex: '1' }}>{facultyInfo.name}</div>
                                </div>
                                <div style={{ display: 'flex', borderBottom: '1px solid #d1d5db', paddingBottom: '0.75rem', paddingTop: '0.5rem' }}>
                                    <div style={{ fontWeight: '600', color: '#374151', width: '180px' }}>Academic Rank:</div>
                                    <div style={{ color: '#111827', flex: '1' }}>{facultyInfo.position}</div>
                                </div>
                            </div>
                        )}
                    </div>


                    {Object.entries(activeCriteria).map(([category, criteria]) => (
                        <div key={category} className={styles.categorySection}>
                            <h3 className={styles.categoryTitle}>{category}</h3>
                            {data.criteriaType === 'new' && NEW_CRITERIA_DESCRIPTIONS[category] && (
                                <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: '#4b5563', lineHeight: '1.5' }}>
                                    ({NEW_CRITERIA_DESCRIPTIONS[category]})
                                </p>
                            )}

                            <table className={styles.criteriaTable}>
                                <thead>
                                    <tr>
                                        <th className={styles.numberCol}>#</th>
                                        <th className={styles.indicatorCol}>Indicators</th>
                                        <th className="w-32 text-center font-semibold text-gray-700 bg-gray-50 border-b">Average Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {criteria.map((criterion, index) => {
                                        const key = `${category.split('.')[0]}-${index}`; // A-0
                                        // But backend returns 'A-0'. Category keys in activeCriteria are 'A. ...'
                                        // My results.js returns `${row.category}-${row.criterion_index}` where category is 'A', 'B'.
                                        // activeCriteria keys are 'A. ...', 'B. ...'.
                                        // I need to parse the short code from activeCriteria key.
                                        const shortCode = category.charAt(0);
                                        const ratingKey = `${shortCode}-${index}`;
                                        const rating = data.ratings[ratingKey] || 0;

                                        return (
                                            <tr key={index}>
                                                <td className={styles.numberCell}>
                                                    {data.criteriaType === 'new'
                                                        ? categoryOffsets[category] + index + 1
                                                        : index + 1}
                                                </td>
                                                <td className={styles.indicatorCell}>{criterion}</td>
                                                <td className="text-center font-bold text-lg text-gray-800">
                                                    {rating > 0 ? rating.toFixed(2) : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Category Average */}
                            <div className={styles.totalScore}>
                                <strong>Average ({category.split('.')[0]}):</strong>
                                {(() => {
                                    // Calculate manual average from loaded ratings for this category
                                    const shortCode = category.charAt(0);
                                    const catRatings = criteria.map((_, i) => data.ratings[`${shortCode}-${i}`] || 0).filter(r => r > 0);
                                    const sum = catRatings.reduce((a, b) => a + b, 0);
                                    const avg = catRatings.length ? sum / catRatings.length : 0;
                                    return avg.toFixed(2);
                                })()}
                            </div>
                        </div>
                    ))}

                    {/* NBC 461 Scoring Calculation */}
                    <div style={{
                        marginTop: '3rem',
                        padding: '2rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb'
                    }}>
                        <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            color: '#991b1b',
                            marginBottom: '1.5rem',
                            borderBottom: '2px solid #991b1b',
                            paddingBottom: '0.5rem'
                        }}>
                            NBC 461 Scoring Computation
                        </h3>

                        {(() => {
                            // Calculate overall student average (all categories combined)
                            const allRatings = Object.values(data.ratings).filter(r => r > 0);
                            const studentAvg = allRatings.length > 0
                                ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
                                : 0;

                            // Convert to 0-100 scale (ratings are 1-5, so multiply by 20)
                            const studentPercentage = studentAvg * 20;

                            // Calculate Supervisor Average from fetched data
                            let supervisorPercentage = 0;
                            if (supervisorData.length > 0) {
                                // Calculate total score across all supervisor evaluations
                                // Note: total_score is already 0-100 based on backend logic
                                const total = supervisorData.reduce((sum, evalItem) => sum + parseFloat(evalItem.total_score || 0), 0);
                                supervisorPercentage = total / supervisorData.length;
                            }

                            // Calculate scores
                            const studentScore = (studentPercentage / 100) * 36;
                            const supervisorScore = (supervisorPercentage / 100) * 24;
                            const totalScore = studentScore + supervisorScore;

                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Formula Reference */}
                                    <div style={{
                                        padding: '1rem',
                                        backgroundColor: '#fef3c7',
                                        borderLeft: '4px solid #f59e0b',
                                        borderRadius: '0.25rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>
                                            Scoring Formula:
                                        </p>
                                        <p style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: '0.25rem' }}>
                                            • Student Evaluation Score = (Average Student Rating ÷ 100) × 36
                                        </p>
                                        <p style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: '0.25rem' }}>
                                            • Supervisor Evaluation Score = (Average Supervisor Rating ÷ 100) × 24
                                        </p>
                                        <p style={{ fontSize: '0.875rem', color: '#78350f' }}>
                                            • Total Score = Student Score + Supervisor Score
                                        </p>
                                    </div>

                                    {/* Calculations */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        {/* Student Calculation */}
                                        <div style={{
                                            padding: '1.5rem',
                                            backgroundColor: 'white',
                                            borderRadius: '0.5rem',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            <h4 style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: '#374151',
                                                marginBottom: '1rem'
                                            }}>
                                                Student Evaluation
                                            </h4>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                                Average Rating: <strong style={{ color: '#111827' }}>{studentAvg.toFixed(2)} / 5.00</strong>
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                                Percentage: <strong style={{ color: '#111827' }}>{studentPercentage.toFixed(2)}%</strong>
                                            </div>
                                            <div style={{
                                                fontSize: '0.875rem',
                                                color: '#6b7280',
                                                padding: '0.75rem',
                                                backgroundColor: '#f9fafb',
                                                borderRadius: '0.25rem',
                                                marginTop: '0.75rem'
                                            }}>
                                                Calculation: ({studentPercentage.toFixed(2)} ÷ 100) × 36
                                            </div>
                                            <div style={{
                                                fontSize: '1.25rem',
                                                fontWeight: '700',
                                                color: '#991b1b',
                                                marginTop: '1rem',
                                                paddingTop: '1rem',
                                                borderTop: '2px solid #e5e7eb'
                                            }}>
                                                = {studentScore.toFixed(2)} points
                                            </div>
                                        </div>

                                        {/* Supervisor Calculation */}
                                        <div style={{
                                            padding: '1.5rem',
                                            backgroundColor: 'white',
                                            borderRadius: '0.5rem',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            <h4 style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: '#374151',
                                                marginBottom: '1rem'
                                            }}>
                                                Supervisor Evaluation
                                            </h4>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                                {supervisorPercentage > 0 ? (
                                                    <>
                                                        Average Rating: <strong style={{ color: '#111827' }}>{(supervisorPercentage / 20).toFixed(2)} / 5.00</strong>
                                                    </>
                                                ) : (
                                                    <em style={{ color: '#9ca3af' }}>No supervisor evaluation data available</em>
                                                )}
                                            </div>
                                            {supervisorPercentage > 0 && (
                                                <>
                                                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                                        Percentage: <strong style={{ color: '#111827' }}>{supervisorPercentage.toFixed(2)}%</strong>
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.875rem',
                                                        color: '#6b7280',
                                                        padding: '0.75rem',
                                                        backgroundColor: '#f9fafb',
                                                        borderRadius: '0.25rem',
                                                        marginTop: '0.75rem'
                                                    }}>
                                                        Calculation: ({supervisorPercentage.toFixed(2)} ÷ 100) × 24
                                                    </div>
                                                    <div style={{
                                                        fontSize: '1.25rem',
                                                        fontWeight: '700',
                                                        color: '#991b1b',
                                                        marginTop: '1rem',
                                                        paddingTop: '1rem',
                                                        borderTop: '2px solid #e5e7eb'
                                                    }}>
                                                        = {supervisorScore.toFixed(2)} points
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Total Score */}
                                    <div style={{
                                        padding: '1.5rem',
                                        backgroundColor: '#991b1b',
                                        borderRadius: '0.5rem',
                                        marginTop: '1rem',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '0.875rem', color: '#fecaca', marginBottom: '0.5rem' }}>
                                            Total Criterion Score
                                        </div>
                                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                                            {totalScore.toFixed(2)} points
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#fecaca', marginTop: '0.5rem' }}>
                                            (Maximum: 60 points)
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
