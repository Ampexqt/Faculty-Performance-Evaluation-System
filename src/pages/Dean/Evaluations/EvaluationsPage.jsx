import React, { useState, useEffect } from 'react';
import { Search, Users, BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import styles from './EvaluationsPage.module.css';

export function EvaluationsPage() {
    const navigate = useNavigate();
    const [facultyList, setFacultyList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        collegeId: null,
        role: ''
    });

    useEffect(() => {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserInfo({
                fullName: user.full_name || 'College Dean',
                collegeId: user.college_id,
                role: user.role
            });
        }
    }, []);

    useEffect(() => {
        if (userInfo.collegeId) {
            fetchFacultyEvaluations();
        }
    }, [userInfo.collegeId]);

    const fetchFacultyEvaluations = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/qce/faculty-evaluations?college_id=${userInfo.collegeId}`);
            const data = await response.json();

            if (data.success) {
                setFacultyList(data.data);
            }
        } catch (error) {
            console.error('Error fetching faculty evaluations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredFaculty = facultyList.filter(faculty =>
        faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCardClick = (facultyId) => {
        navigate(`/dean/evaluations/${facultyId}`);
    };

    return (
        <DashboardLayout
            role={userInfo.role}
            userName={userInfo.fullName}
            notificationCount={3}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Faculty Evaluation Monitoring</h1>
                        <p className={styles.subtitle}>Track evaluation progress of faculty members in your college.</p>
                    </div>
                </div>

                <div className={styles.searchContainer}>
                    <div className={styles.searchWrapper}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search faculty by name or position..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className={styles.loadingContainer}>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
                    </div>
                ) : (
                    <div className={styles.cardsGrid}>
                        {filteredFaculty.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No faculty members found</p>
                            </div>
                        ) : (
                            filteredFaculty.map((faculty) => (
                                <div
                                    key={faculty.id}
                                    className={styles.facultyCard}
                                    onClick={() => handleCardClick(faculty.id)}
                                >
                                    <div className={styles.cardHeader}>
                                        <div className={styles.avatarCircle}>
                                            {faculty.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                        </div>
                                        <div className={styles.facultyInfo}>
                                            <h3 className={styles.facultyName}>{faculty.name}</h3>
                                            <p className={styles.facultyPosition}>{faculty.position}</p>
                                        </div>
                                    </div>

                                    <div className={styles.cardStats}>
                                        <div className={styles.statItem}>
                                            <div className={styles.statIcon}>
                                                <Users size={18} />
                                            </div>
                                            <div className={styles.statContent}>
                                                <span className={styles.statValue}>{faculty.sections_count || 0}</span>
                                                <span className={styles.statLabel}>Sections</span>
                                            </div>
                                        </div>

                                        <div className={styles.statDivider}></div>

                                        <div className={styles.statItem}>
                                            <div className={styles.statIcon}>
                                                <BookOpen size={18} />
                                            </div>
                                            <div className={styles.statContent}>
                                                <span className={styles.statValue}>{faculty.subjects_count || 0}</span>
                                                <span className={styles.statLabel}>Subjects</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <div className={styles.progressInfo}>
                                            <span className={styles.progressLabel}>Evaluation Progress</span>
                                            <span className={styles.progressPercentage}>
                                                {faculty.evaluation_progress || 0}%
                                            </span>
                                        </div>
                                        <div className={styles.progressBar}>
                                            <div
                                                className={styles.progressFill}
                                                style={{ width: `${faculty.evaluation_progress || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className={styles.cardAction}>
                                        <span>View Details</span>
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
