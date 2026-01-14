import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Button } from '@/components/Button/Button';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast/Toast';
import styles from './PresidentEvaluationFormPage.module.css';

const RATING_SCALE = [
    { value: 5, label: 'Outstanding', description: 'The performance almost always exceeds the job requirements. The faculty is exceptional.' },
    { value: 4, label: 'Very Satisfactory', description: 'The performance meets and often exceeds the job requirements.' },
    { value: 3, label: 'Satisfactory', description: 'The performance meets job requirements.' },
    { value: 2, label: 'Fair', description: 'The performance needs some development to meet job requirements.' },
    { value: 1, label: 'Poor', description: 'The faculty fails to meet job requirements.' }
];


const NEW_RATING_SCALE = [
    { value: 5, label: 'Always manifested', description: 'Evident in nearly all relevant situations (81–100%)' },
    { value: 4, label: 'Often manifested', description: 'Evident most of the time, with occasional lapses (61–80%)' },
    { value: 3, label: 'Sometimes manifested', description: 'Evident about half the time (41–60%)' },
    { value: 2, label: 'Seldom manifested', description: 'Infrequently demonstrated; partly evident in limited situations (21–40%)' },
    { value: 1, label: 'Not manifested', description: 'Seldom demonstrated; almost never evident, with only isolated cases (0–20%)' }
];

const OLD_EVALUATION_CRITERIA = {
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

const NEW_EVALUATION_CRITERIA = {
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
    ],
};

const NEW_CRITERIA_DESCRIPTIONS = {
    'A. Management of Teaching and Learning': 'Management of Teaching and Learning refers to the standard and organized planning of instructional activities, clear communication of academic expectations, efficient use of time, and the successful use of student-centered activities that promote critical thinking, collaborative learning, individual decision making, and continuous academic improvement through constructive feedback.',
    'B. Content Knowledge, Pedagogy, and Technology': 'Content knowledge, pedagogy, and technology refer to teachers’ ability to demonstrate a strong grasp of subject matter, present concepts in a clear and accessible way, relate content to relevant and current developments, engage students through appropriate instructional strategies and digital tools, and apply assessment methods aligned with intended learning outcomes.',
    'C. Commitment and Transparency': 'Commitment and transparency refer to the teacher’s consistent dedication to supporting student learning by demonstrating professionalism, providing timely academic support and feedback, and upholding fairness and accountability through the use of clear and openly communicated performance criteria.',
};

export function PresidentEvaluationFormPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { toasts, removeToast, success, error: showError } = useToast();

    // Get user data from sessionStorage
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    const presidentId = userData.id;

    // Format evaluator name with honorific and suffix
    const formatEvaluatorName = () => {
        const nameParts = [];
        if (userData.honorific) nameParts.push(userData.honorific);
        if (userData.full_name) nameParts.push(userData.full_name);
        if (userData.suffix) nameParts.push(userData.suffix);
        return nameParts.length > 0 ? nameParts.join(' ') : 'President';
    };

    const fullName = formatEvaluatorName();

    // Get VPAA data and criteria type from location state
    const { vpaa, criteriaType } = location.state || {};

    const [ratings, setRatings] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [comments, setComments] = useState('');
    const [academicPeriod, setAcademicPeriod] = useState(null);

    // Determine which criteria to use
    const activeCriteria = criteriaType === 'new' ? NEW_EVALUATION_CRITERIA : OLD_EVALUATION_CRITERIA;

    useEffect(() => {
        if (!vpaa) {
            navigate('/president/dashboard');
            return;
        }
        fetchAcademicYear();
        initializeRatings();
    }, [vpaa, navigate, criteriaType]);

    const fetchAcademicYear = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/zonal/academic-years/active');
            const data = await response.json();
            if (data.success && data.data) {
                setAcademicPeriod(data.data);
            }
        } catch (error) {
            console.error('Error fetching academic year:', error);
        }
    };

    const initializeRatings = () => {
        const initialRatings = {};
        Object.keys(activeCriteria).forEach(category => {
            activeCriteria[category].forEach((_, index) => {
                initialRatings[`${category}-${index}`] = 0;
            });
        });
        setRatings(initialRatings);
    };

    const formatRatingPeriod = () => {
        if (!academicPeriod) return 'N/A';

        const startDate = new Date(academicPeriod.start_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const endDate = new Date(academicPeriod.end_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `${academicPeriod.year_label} - ${academicPeriod.semester} (${startDate} to ${endDate})`;
    };

    const handleRatingChange = (category, index, value) => {
        setRatings(prev => ({
            ...prev,
            [`${category}-${index}`]: parseInt(value)
        }));
    };

    const calculateTotalScore = (category) => {
        let total = 0;
        activeCriteria[category].forEach((_, index) => {
            total += ratings[`${category}-${index}`] || 0;
        });
        return total;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all criteria are rated
        const allRated = Object.keys(activeCriteria).every(category =>
            activeCriteria[category].every((_, index) => ratings[`${category}-${index}`] > 0)
        );

        if (!allRated) {
            showError('Please rate all criteria before submitting.');
            return;
        }

        setIsSubmitting(true);

        try {
            const totalScore = Object.values(ratings).reduce((sum, rating) => sum + rating, 0);
            const totalItems = Object.values(activeCriteria).flat().length;
            const maxScore = totalItems * 5;
            const averageRating = (totalScore / maxScore) * 5;

            const payload = {
                president_id: presidentId,
                vpaa_id: vpaa.id,
                academic_year_id: academicPeriod?.id || 1,
                semester: academicPeriod?.semester || '1st',
                rating: averageRating.toFixed(2),
                comments: JSON.stringify({
                    ratings,
                    text_comments: comments,
                    criteria_version: criteriaType // store which version was used
                })
            };

            const response = await fetch('http://localhost:5000/api/president/evaluate-vpaa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                success('Evaluation submitted successfully!');
                setTimeout(() => {
                    navigate('/president/dashboard');
                }, 2000);
            } else {
                showError(data.message || 'Failed to submit evaluation');
            }
        } catch (error) {
            console.error('Submission error:', error);
            showError('An error occurred while submitting the evaluation');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/president/dashboard');
    };

    if (!vpaa) {
        return null; // Will redirect in useEffect
    }

    return (
        <DashboardLayout role="President" userName={fullName} notificationCount={0}>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className={styles.page}>
                {/* Back Button - Outside the form */}
                <button className={styles.backButton} onClick={handleCancel}>
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </button>

                <div className={styles.formContainer}>
                    {/* Form Header */}
                    <div className={styles.formHeader}>
                        <h1 className={styles.formTitle}>
                            Instrument for the Instruction/Teaching Effectiveness
                        </h1>

                        <div className={styles.headerInfo}>
                            <p className={styles.qceInfo}>The QCE of the NBC No. 461</p>
                            <p className={styles.ratingPeriod}>
                                <strong>Rating Period:</strong> {formatRatingPeriod()}
                            </p>
                        </div>

                        <div className={styles.facultyInfo}>
                            <div className={styles.infoRow}>
                                <label className={styles.infoLabel}>Name:</label>
                                <div className={styles.infoValue}>
                                    {(() => {
                                        const nameParts = [];
                                        if (vpaa.honorific) nameParts.push(vpaa.honorific);
                                        nameParts.push(vpaa.full_name);
                                        if (vpaa.suffix) nameParts.push(vpaa.suffix);
                                        return nameParts.join(' ');
                                    })()}
                                </div>
                            </div>
                            <div className={styles.infoRow}>
                                <label className={styles.infoLabel}>Position:</label>
                                <div className={styles.infoValue}>Vice President for Academic Affairs (VPAA)</div>
                            </div>
                        </div>

                        <div className={styles.evaluatorType}>
                            <label className={styles.evaluatorLabel}>Evaluators:</label>
                            <div className={styles.checkboxGroup}>
                                <label className={styles.checkbox}>
                                    <input type="checkbox" disabled />
                                    <span>Self</span>
                                </label>
                                <label className={styles.checkbox}>
                                    <input type="checkbox" disabled />
                                    <span>Student</span>
                                </label>
                                <label className={styles.checkbox}>
                                    <input type="checkbox" disabled />
                                    <span>Peer</span>
                                </label>
                                <label className={styles.checkbox}>
                                    <input type="checkbox" checked={true} readOnly />
                                    <span>Supervisor (President)</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Subject Info Bar */}
                    <div className={styles.subjectBar}>
                        <strong>Position:</strong> Vice President for Academic Affairs
                    </div>

                    <div className={styles.instructions}>
                        {criteriaType === 'new' ? (
                            <>
                                <div className={styles.sectionHeader}>
                                    <h3>Rating Scale / Rubric</h3>
                                </div>
                                <div className={styles.ratingScale}>
                                    <table className={styles.scaleTable}>
                                        <thead>
                                            <tr>
                                                <th>Scale</th>
                                                <th>Qualitative Description</th>
                                                <th style={{ width: '50%' }}>Operational Definition</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {NEW_RATING_SCALE.map(scale => (
                                                <tr key={scale.value}>
                                                    <td style={{ fontWeight: 'bold' }}>{scale.value}</td>
                                                    <td>{scale.label}</td>
                                                    <td>{scale.description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
                                    Instructions: Please evaluate the VPAA based on the following indicators using the scale above.
                                </p>
                            </>
                        ) : (
                            <>
                                <h3>Instructions</h3>
                                <p>Please evaluate the VPAA using the scale below. Encircle your rating.</p>

                                <div className={styles.ratingScale}>
                                    <h4>Rating Scale</h4>
                                    <table className={styles.scaleTable}>
                                        <thead>
                                            <tr>
                                                <th>Scale</th>
                                                <th>Descriptive Rating</th>
                                                <th>Qualitative Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {RATING_SCALE.map(scale => (
                                                <tr key={scale.value}>
                                                    <td>{scale.value}</td>
                                                    <td>{scale.label}</td>
                                                    <td>{scale.description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className={styles.evaluationForm}>
                        {Object.entries(activeCriteria).map(([category, criteria]) => (
                            <div key={category} className={styles.categorySection}>
                                <h3 className={styles.categoryTitle}>{category}</h3>

                                <table className={styles.criteriaTable}>
                                    <thead>
                                        <tr>
                                            <th className={styles.numberCol}>#</th>
                                            <th className={styles.indicatorCol}>Indicators</th>
                                            <th className={styles.ratingCol}>5</th>
                                            <th className={styles.ratingCol}>4</th>
                                            <th className={styles.ratingCol}>3</th>
                                            <th className={styles.ratingCol}>2</th>
                                            <th className={styles.ratingCol}>1</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {criteria.map((criterion, index) => (
                                            <tr key={index}>
                                                <td className={styles.numberCell}>{index + 1}</td>
                                                <td className={styles.indicatorCell}>{criterion}</td>
                                                {[5, 4, 3, 2, 1].map(value => (
                                                    <td key={value} className={styles.ratingCell}>
                                                        <label className={styles.radioLabel}>
                                                            <input
                                                                type="radio"
                                                                name={`${category}-${index}`}
                                                                value={value}
                                                                checked={ratings[`${category}-${index}`] === value}
                                                                onChange={() => handleRatingChange(category, index, value)}
                                                                className={styles.radioInput}
                                                            />
                                                            <span className={styles.radioCustom}></span>
                                                        </label>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className={styles.totalScore}>
                                    <strong>Total Score ({category.split('.')[0]}):</strong> {calculateTotalScore(category)}
                                </div>
                            </div>
                        ))}

                        {/* Comments Section */}
                        <div className={styles.commentsSection}>
                            <h3 className={styles.commentsTitle}>Additional Comments/Feedback (Optional)</h3>
                            <p className={styles.commentsSubtitle}>
                                Please share any additional feedback, suggestions, or comments about the VPAA's performance.
                            </p>
                            <textarea
                                className={styles.commentsTextarea}
                                placeholder="Write your comments here..."
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                rows={6}
                                maxLength={1000}
                            />
                            <div className={styles.characterCount}>
                                {comments.length}/1000 characters
                            </div>
                        </div>

                        {/* Evaluator Information Section */}
                        <div className={styles.evaluatorSection}>
                            <h3 className={styles.evaluatorSectionTitle}>Evaluator Information</h3>
                            <div className={styles.evaluatorFields}>
                                <div className={styles.evaluatorField}>
                                    <label className={styles.evaluatorLabel}>Signature of Evaluator:</label>
                                    <div className={styles.signatureLine}></div>
                                </div>
                                <div className={styles.evaluatorField}>
                                    <label className={styles.evaluatorLabel}>Name of Evaluator:</label>
                                    <div className={styles.evaluatorValue}>{fullName}</div>
                                </div>
                                <div className={styles.evaluatorField}>
                                    <label className={styles.evaluatorLabel}>Position of Evaluator:</label>
                                    <div className={styles.evaluatorValue}>University President</div>
                                </div>
                                <div className={styles.evaluatorField}>
                                    <label className={styles.evaluatorLabel}>Date:</label>
                                    <div className={styles.evaluatorValue}>
                                        {new Date().toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <Button type="button" variant="ghost" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
