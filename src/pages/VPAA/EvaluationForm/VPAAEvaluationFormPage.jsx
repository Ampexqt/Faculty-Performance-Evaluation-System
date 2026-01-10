import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Button } from '@/components/Button/Button';
import { ArrowLeft } from 'lucide-react';
import styles from './VPAAEvaluationFormPage.module.css';

const RATING_SCALE = [
    { value: 5, label: 'Outstanding', description: 'Performance consistently exceeds expectations.' },
    { value: 4, label: 'Very Satisfactory', description: 'Performance exceeds normal job requirements.' },
    { value: 3, label: 'Satisfactory', description: 'Performance meets job requirements.' },
    { value: 2, label: 'Fair', description: 'Performance needs some development to meet job requirements.' },
    { value: 1, label: 'Poor', description: 'Performance fails to meet job requirements.' }
];

const EVALUATION_CRITERIA = {
    'A. Leadership and Management': [
        'Demonstrates effective leadership in college affairs management.',
        'Provides clear direction and strategic planning for college programs.',
        'Effectively manages and supervises college personnel.',
        'Makes sound decisions based on data and institutional goals.',
        'Promotes a culture of excellence and continuous improvement.'
    ],
    'B. Academic Program Development': [
        'Ensures quality and relevance of college academic programs.',
        'Promotes curriculum development and innovation.',
        'Supports faculty development and professional growth.',
        'Implements effective assessment and accreditation processes.',
        'Facilitates collaboration across departments.'
    ],
    'C. Communication and Collaboration': [
        'Communicates effectively with stakeholders.',
        'Builds positive relationships with faculty, staff, and students.',
        'Collaborates with other college administrators and departments.',
        'Represents the college professionally in external engagements.',
        'Responds promptly and appropriately to concerns and issues.'
    ],
    'D. Innovation and Problem-Solving': [
        'Demonstrates creativity in addressing college challenges.',
        'Implements innovative solutions to improve academic quality.',
        'Adapts effectively to changing educational landscapes.',
        'Encourages and supports innovative teaching and learning practices.',
        'Resolves conflicts and issues in a fair and timely manner.'
    ]
};

export function VPAAEvaluationFormPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { evaluation, vpaaId } = location.state || {};

    const [ratings, setRatings] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [academicYear, setAcademicYear] = useState(null);

    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!evaluation || !vpaaId) {
            navigate('/vpaa/dashboard');
            return;
        }
        fetchAcademicYear();
        initializeRatings();
    }, []);

    const fetchAcademicYear = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/zonal/academic-years/active');
            const data = await response.json();
            if (data.success && data.data) {
                setAcademicYear(data.data);
            }
        } catch (error) {
            console.error('Error fetching academic year:', error);
        }
    };

    const initializeRatings = () => {
        const initialRatings = {};
        Object.keys(EVALUATION_CRITERIA).forEach(category => {
            initialRatings[category] = Array(EVALUATION_CRITERIA[category].length).fill(0);
        });
        setRatings(initialRatings);
    };

    const handleRatingChange = (category, index, value) => {
        setRatings(prev => ({
            ...prev,
            [category]: prev[category].map((r, i) => i === index ? parseInt(value) : r)
        }));
    };

    const calculateTotalScore = (category) => {
        if (!ratings[category]) return 0;
        return ratings[category].reduce((sum, rating) => sum + rating, 0);
    };

    const calculateOverallTotal = () => {
        return Object.keys(EVALUATION_CRITERIA).reduce((total, category) => {
            return total + calculateTotalScore(category);
        }, 0);
    };

    const calculateMaxScore = () => {
        return Object.keys(EVALUATION_CRITERIA).reduce((total, category) => {
            return total + (EVALUATION_CRITERIA[category].length * 5);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all criteria are rated
        const allRated = Object.keys(EVALUATION_CRITERIA).every(category =>
            ratings[category] && ratings[category].every(rating => rating > 0)
        );

        if (!allRated) {
            alert('Please rate all criteria before submitting.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Helper to get average for a category
            const getCategoryAverage = (categoryName) => {
                const total = calculateTotalScore(categoryName);
                const max = EVALUATION_CRITERIA[categoryName].length * 5;
                return (total / max) * 5; // Normalize to 5
            };

            const managementScore = getCategoryAverage('A. Leadership and Management');
            const teachingScore = getCategoryAverage('B. Academic Program Development');
            const commitmentScore = getCategoryAverage('C. Communication and Collaboration');
            const knowledgeScore = getCategoryAverage('D. Innovation and Problem-Solving');

            const totalScore = calculateOverallTotal();
            const maxScore = calculateMaxScore();
            const averageRating = (totalScore / maxScore) * 5;

            const response = await fetch('http://localhost:5000/api/vpaa/submit-evaluation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    evaluation_id: evaluation.id,
                    scores: {
                        management: managementScore.toFixed(2),
                        teaching: teachingScore.toFixed(2),
                        commitment: commitmentScore.toFixed(2),
                        knowledge: knowledgeScore.toFixed(2),
                        total: averageRating.toFixed(2)
                    },
                    comments: JSON.stringify(ratings)
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert('Evaluation submitted successfully!');
                navigate('/vpaa/dashboard');
            } else {
                alert(data.message || 'Error submitting evaluation');
            }
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            alert('Server error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel? All ratings will be lost.')) {
            navigate('/vpaa/dashboard');
        }
    };

    if (!evaluation) {
        return null;
    }

    return (
        <DashboardLayout role="VPAA" userName={userData.full_name}>
            <div className={styles.page}>
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <h1 className={styles.formTitle}>Dean Performance Evaluation</h1>
                        <div className={styles.headerInfo}>
                            <p className={styles.qceInfo}>The QCE of the NBC No. 461</p>
                            <p className={styles.ratingPeriod}>
                                <strong>Academic Year:</strong> {academicYear?.year_label || 'N/A'} - {evaluation.semester || 'N/A'}
                            </p>
                        </div>

                        <div className={styles.facultyInfo}>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Dean Name:</span>
                                <span className={styles.infoValue}>{evaluation.dean_name}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>College:</span>
                                <span className={styles.infoValue}>{evaluation.college_name}</span>
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
                                    <span>Supervisor (VPAA)</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className={styles.subjectBar}>
                        <strong>Position:</strong> College Dean
                    </div>

                    <div className={styles.instructions}>
                        <h3>Instructions</h3>
                        <p>Please evaluate the Dean using the scale below. Encircle your rating.</p>

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
                                                                checked={ratings[category]?.[index] === value}
                                                                onChange={() => handleRatingChange(category, index, value)}
                                                                className={styles.radioInput}
                                                                required
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
                                    <strong>Total Score ({category.split('.')[0]}):</strong> {calculateTotalScore(category)} / {criteria.length * 5}
                                </div>
                            </div>
                        ))}

                        <div className={styles.summary}>
                            <h3>Evaluation Summary</h3>
                            <div className={styles.summaryContent} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px', marginBottom: '2rem' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>Total Score: </strong>
                                    {calculateOverallTotal()} / {calculateMaxScore()}
                                </div>
                                <div>
                                    <strong>Average Rating: </strong>
                                    {((calculateOverallTotal() / calculateMaxScore()) * 5).toFixed(2)} / 5.00
                                </div>
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
