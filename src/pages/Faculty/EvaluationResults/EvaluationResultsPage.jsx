import React from 'react';
import { Star } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import styles from './EvaluationResultsPage.module.css';

// Mock data - Evaluation results
const evaluationData = {
    overallRating: 4.82,
    maxRating: 5.00,
    ratingLabel: 'Outstanding',
    scoreBreakdown: [
        { category: 'Commitment', score: 4.8 },
        { category: 'Knowledge of Subject', score: 4.9 },
        { category: 'Teaching for Independent Learning', score: 4.7 },
        { category: 'Management of Learning', score: 4.8 },
    ],
    studentComments: [
        '"Prof. Turing explains complex concepts very clearly. I learned a lot in this class."',
        '"Very approachable and always willing to help students."',
        '"Excellent teaching methods and engaging lectures."',
    ]
};

export function EvaluationResultsPage() {
    const { overallRating, maxRating, ratingLabel, scoreBreakdown, studentComments } = evaluationData;

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

    return (
        <DashboardLayout
            role="Faculty"
            userName="Faculty Member"
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
                                {overallRating.toFixed(2)}
                                <span className={styles.maxRating}>/ {maxRating.toFixed(2)}</span>
                            </div>
                            <div className={styles.stars}>
                                {renderStars(overallRating)}
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
                                        <span className={styles.scoreValue}>{item.score.toFixed(1)}</span>
                                    </div>
                                    <div className={styles.scoreBar}>
                                        <div
                                            className={styles.scoreBarFill}
                                            style={{ width: `${getScorePercentage(item.score)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Student Comments Section */}
                <div className={styles.commentsSection}>
                    <h2 className={styles.sectionTitle}>Student Comments</h2>
                    <div className={styles.commentsList}>
                        {studentComments.map((comment, index) => (
                            <div key={index} className={styles.commentCard}>
                                <p className={styles.commentText}>{comment}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
