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

    const userData = JSON.parse(localStorage.getItem('user') || '{}');

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
                    rating: averageRating.toFixed(2),
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
                <div className={styles.header}>
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        className={styles.backButton}
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </Button>
                </div>

                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <h1 className={styles.title}>Dean Performance Evaluation</h1>
                        <div className={styles.evaluationInfo}>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Dean Name:</span>
                                <span className={styles.value}>{evaluation.dean_name}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>College:</span>
                                <span className={styles.value}>{evaluation.college_name}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Academic Year:</span>
                                <span className={styles.value}>{academicYear?.year_label || 'N/A'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Semester:</span>
                                <span className={styles.value}>{evaluation.semester || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.ratingScale}>
                        <h3>Rating Scale:</h3>
                        <div className={styles.scaleItems}>
                            {RATING_SCALE.map(scale => (
                                <div key={scale.value} className={styles.scaleItem}>
                                    <span className={styles.scaleValue}>{scale.value}</span>
                                    <span className={styles.scaleLabel}>{scale.label}</span>
                                    <span className={styles.scaleDescription}>{scale.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {Object.entries(EVALUATION_CRITERIA).map(([category, criteria]) => (
                            <div key={category} className={styles.category}>
                                <div className={styles.categoryHeader}>
                                    <h2 className={styles.categoryTitle}>{category}</h2>
                                    <div className={styles.categoryScore}>
                                        Total: {calculateTotalScore(category)} / {criteria.length * 5}
                                    </div>
                                </div>

                                <div className={styles.criteriaList}>
                                    {criteria.map((criterion, index) => (
                                        <div key={index} className={styles.criterionRow}>
                                            <div className={styles.criterionText}>
                                                {index + 1}. {criterion}
                                            </div>
                                            <div className={styles.ratingButtons}>
                                                {[1, 2, 3, 4, 5].map(value => (
                                                    <label
                                                        key={value}
                                                        className={`${styles.ratingButton} ${ratings[category]?.[index] === value ? styles.selected : ''
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`${category}-${index}`}
                                                            value={value}
                                                            checked={ratings[category]?.[index] === value}
                                                            onChange={() => handleRatingChange(category, index, value)}
                                                            required
                                                        />
                                                        <span>{value}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className={styles.summary}>
                            <h3>Evaluation Summary</h3>
                            <div className={styles.summaryContent}>
                                <div className={styles.summaryRow}>
                                    <span>Total Score:</span>
                                    <span className={styles.summaryValue}>
                                        {calculateOverallTotal()} / {calculateMaxScore()}
                                    </span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Average Rating:</span>
                                    <span className={styles.summaryValue}>
                                        {((calculateOverallTotal() / calculateMaxScore()) * 5).toFixed(2)} / 5.00
                                    </span>
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
