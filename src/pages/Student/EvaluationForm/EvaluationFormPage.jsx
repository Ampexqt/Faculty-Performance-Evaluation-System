import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Button } from '@/components/Button/Button';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast/Toast';
import styles from './EvaluationFormPage.module.css';

const RATING_SCALE = [
    { value: 5, label: 'Outstanding', description: 'The performance almost always exceeds the job requirements. The faculty is exceptional.' },
    { value: 4, label: 'Very Satisfactory', description: 'The performance meets and often exceeds the job requirements.' },
    { value: 3, label: 'Satisfactory', description: 'The performance meets job requirements.' },
    { value: 2, label: 'Fair', description: 'The performance needs some development to meet job requirements.' },
    { value: 1, label: 'Poor', description: 'The faculty fails to meet job requirements.' }
];

const EVALUATION_CRITERIA = {
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

export function EvaluationFormPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { toasts, removeToast, success, error: showError } = useToast();

    const fullName = localStorage.getItem('fullName') || 'Student';
    const studentId = localStorage.getItem('userId');

    // Get evaluation details from location state
    const evaluationData = location.state?.evaluation || {};
    const { id: assignmentId, subject, instructor, facultyRole } = evaluationData;

    const [ratings, setRatings] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [comments, setComments] = useState('');

    // Debug: Log the evaluation data
    useEffect(() => {
        console.log('Evaluation Data:', evaluationData);
        console.log('Faculty Role:', facultyRole);
    }, [evaluationData, facultyRole]);

    // Fetch faculty role if missing
    const [fetchedRole, setFetchedRole] = useState(null);
    useEffect(() => {
        const fetchFacultyRole = async () => {
            if (!facultyRole && assignmentId) {
                try {
                    const response = await fetch(`http://localhost:5000/api/student/evaluations/assignment/${assignmentId}`);
                    const data = await response.json();
                    if (data.success && data.facultyRole) {
                        setFetchedRole(data.facultyRole);
                    }
                } catch (error) {
                    console.error('Error fetching faculty role:', error);
                }
            }
        };
        fetchFacultyRole();
    }, [facultyRole, assignmentId]);

    const displayRole = facultyRole || fetchedRole || 'N/A';

    // Fetch active academic year
    const [academicPeriod, setAcademicPeriod] = useState(null);
    useEffect(() => {
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
        fetchAcademicYear();
    }, []);

    const formatRatingPeriod = () => {
        if (!academicPeriod) return 'August 1, 2023 to July 31, 2026';

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

    // Initialize ratings object
    useEffect(() => {
        const initialRatings = {};
        Object.keys(EVALUATION_CRITERIA).forEach(category => {
            EVALUATION_CRITERIA[category].forEach((_, index) => {
                initialRatings[`${category}-${index}`] = 0;
            });
        });
        setRatings(initialRatings);
    }, []);

    const handleRatingChange = (category, index, value) => {
        setRatings(prev => ({
            ...prev,
            [`${category}-${index}`]: value
        }));
    };

    const calculateTotalScore = (category) => {
        let total = 0;
        EVALUATION_CRITERIA[category].forEach((_, index) => {
            total += ratings[`${category}-${index}`] || 0;
        });
        return total;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all criteria are rated
        const allRated = Object.values(ratings).every(rating => rating > 0);
        if (!allRated) {
            showError('Please rate all criteria before submitting.');
            return;
        }

        setIsSubmitting(true);

        try {
            // TODO: Implement API call to submit evaluation
            const response = await fetch('http://localhost:5000/api/student/evaluations/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId,
                    assignmentId,
                    ratings,
                    comments
                }),
            });

            const data = await response.json();

            if (data.success) {
                success('Evaluation submitted successfully!');

                // Remove from pending evaluations in localStorage
                const saved = localStorage.getItem(`pendingEvaluations_${studentId}`);
                if (saved) {
                    const pending = JSON.parse(saved);
                    const updated = pending.filter(item => item.id !== assignmentId);
                    localStorage.setItem(`pendingEvaluations_${studentId}`, JSON.stringify(updated));
                }

                // Navigate back to evaluations page
                setTimeout(() => {
                    navigate('/student/evaluations');
                }, 1500);
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
        navigate('/student/evaluations');
    };

    if (!assignmentId) {
        return (
            <DashboardLayout role="Student" userName={fullName} notificationCount={2}>
                <div className={styles.error}>
                    <h2>No evaluation data found</h2>
                    <Button onClick={() => navigate('/student/evaluations')}>
                        Back to Evaluations
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="Student" userName={fullName} notificationCount={2}>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className={styles.page}>
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
                                <label className={styles.infoLabel}>Name of Faculty:</label>
                                <div className={styles.infoValue}>{instructor}</div>
                            </div>
                            <div className={styles.infoRow}>
                                <label className={styles.infoLabel}>Academic Rank:</label>
                                <div className={styles.infoValue}>{displayRole}</div>
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
                                    <input type="checkbox" checked disabled />
                                    <span>Student</span>
                                </label>
                                <label className={styles.checkbox}>
                                    <input type="checkbox" disabled />
                                    <span>Peer</span>
                                </label>
                                <label className={styles.checkbox}>
                                    <input type="checkbox" disabled />
                                    <span>Supervisor</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Subject Info Bar */}
                    <div className={styles.subjectBar}>
                        <strong>Subject:</strong> {subject}
                    </div>

                    <div className={styles.instructions}>
                        <h3>Instructions</h3>
                        <p>Please evaluate the faculty using the scale below. Encircle your rating.</p>

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
                    </div>

                    <form onSubmit={handleSubmit} className={styles.evaluationForm}>
                        {Object.entries(EVALUATION_CRITERIA).map(([category, criteria]) => (
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
                                Please share any additional feedback, suggestions, or comments about the faculty member's teaching performance.
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
                                    <div className={styles.evaluatorValue}>Student</div>
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
