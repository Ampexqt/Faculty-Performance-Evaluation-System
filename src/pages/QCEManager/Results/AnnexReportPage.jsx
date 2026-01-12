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

                // Fetch Faculty Info for header
                const facResponse = await fetch(`http://localhost:5000/api/qce/evaluation-results/faculty/${facultyId}`);
                const facResult = await facResponse.json();
                if (facResult.success) {
                    setFacultyInfo(facResult.data.faculty);
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

    return (
        <DashboardLayout role="QCE Manager">
            <div className={styles.container}>
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Results
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                    >
                        <Printer className="w-5 h-5 mr-2" />
                        Print Report
                    </button>
                </div>

                {/* Report Content */}
                <div className="bg-white rounded-lg shadow-sm p-8 print:shadow-none print:p-0">
                    {/* Centered ANNEX Title */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">{annexLabel}</h2>
                    </div>

                    {/* Left-aligned Faculty Information */}
                    <div className="mb-8 pb-6 border-b">
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">The QCE of the NBC No. 461</p>
                        </div>
                        {facultyInfo && (
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <span className="font-semibold text-gray-700 min-w-[160px]">Name of Faculty:</span>
                                    <span className="text-gray-900">{facultyInfo.name}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="font-semibold text-gray-700 min-w-[160px]">Academic Rank:</span>
                                    <span className="text-gray-900">{facultyInfo.position}</span>
                                </div>
                            </div>
                        )}
                        <div className="mt-4 text-sm text-gray-500 italic">
                            Criteria Used: {data.criteriaType === 'new' ? 'New Criteria (Result-Based)' : 'Old Criteria (NBC 461)'}
                        </div>
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
                </div>
            </div>
        </DashboardLayout>
    );
}
