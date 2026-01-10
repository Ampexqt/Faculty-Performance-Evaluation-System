import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import styles from './EvaluationResultsPage.module.css';

export function EvaluationResultsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        overallRating: 0,
        maxRating: 5.00,
        ratingLabel: 'N/A',
        scoreBreakdown: [],
        studentComments: []
    });

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const userId = sessionStorage.getItem('userId');
                if (!userId) {
                    throw new Error('User ID not found');
                }

                const response = await fetch(`http://localhost:5000/api/faculty/evaluation-results/my-results?faculty_id=${userId}`);
                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.message || 'Failed to fetch results');
                }

                setData(result.data);
            } catch (err) {
                console.error('Error fetching evaluation results:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);

        for (let i = 0; i < 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={24}
                    className={i < fullStars ? styles.starFilled : styles.starEmpty}
                    fill={i < fullStars ? 'currentColor' : 'none'}
                />
            );
        }
        return stars;
    };

    const getScorePercentage = (score) => {
        return (score / 5) * 100;
    };

    if (loading) {
        return (
            <DashboardLayout role="Faculty" userName="Faculty Member">
                <div className={styles.loading}>Loading results...</div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout role="Faculty" userName="Faculty Member">
                <div className={styles.error}>Error: {error}</div>
            </DashboardLayout>
        );
    }

    const { overallRating, maxRating, ratingLabel, scoreBreakdown, studentComments } = data;

    return (
        <DashboardLayout
            role="Faculty"
            userName={sessionStorage.getItem('fullName') || 'Faculty Member'}
            notificationCount={3}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>My Evaluation Results</h1>
                        <p className={styles.subtitle}>Performance summary for the current semester.</p>
                    </div>
                </div>

                <div className={styles.content}>
                    {/* Overall Rating Card */}
                    <div className={styles.overallCard}>
                        <h2 className={styles.cardTitle}>Overall Rating</h2>
                        <div className={styles.ratingDisplay}>
                            <div className={styles.ratingNumber}>
                                {typeof overallRating === 'number' ? overallRating.toFixed(2) : '0.00'}
                                <span className={styles.maxRating}>/ {typeof maxRating === 'number' ? maxRating.toFixed(2) : '5.00'}</span>
                            </div>
                            <div className={styles.stars}>
                                {renderStars(overallRating || 0)}
                            </div>
                            <div className={styles.ratingLabel}>{ratingLabel}</div>
                        </div>
                    </div>

                    {/* Score Breakdown Card */}
                    <div className={styles.scoreCard}>
                        <h2 className={styles.cardTitle}>Score Breakdown</h2>
                        <div className={styles.scoreList}>
                            {scoreBreakdown.map((item, index) => (
                                <div key={index} className={styles.scoreItem}>
                                    <div className={styles.scoreHeader}>
                                        <span className={styles.scoreCategory}>{item.category}</span>
                                        <span className={styles.scoreValue}>{typeof item.score === 'number' ? item.score.toFixed(1) : '0.0'}</span>
                                    </div>
                                    <div className={styles.scoreBar}>
                                        <div
                                            className={styles.scoreBarFill}
                                            style={{ width: `${getScorePercentage(item.score || 0)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Student & Supervisor Comments Section */}
                <div className={styles.commentsSection}>
                    <h2 className={styles.sectionTitle}>Comments & Feedback</h2>
                    <div className={styles.commentsList}>
                        {studentComments.length > 0 ? (
                            studentComments.map((comment, index) => (
                                <div key={index} className={styles.commentCard}>
                                    <p className={styles.commentText}>{comment}</p>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noComments}>No comments available yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
