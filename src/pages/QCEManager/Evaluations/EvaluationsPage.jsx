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
    const [activeCategory, setActiveCategory] = useState('Heads'); // 'Heads' or 'Faculty'
    const [userInfo, setUserInfo] = useState(() => {
        return {
            fullName: sessionStorage.getItem('fullName') || 'QCE Manager',
            collegeId: sessionStorage.getItem('collegeId'),
        };
    });

    useEffect(() => {
        // Keep this for any subsequent updates if needed, logic moved to initial state
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

    const filteredFaculty = facultyList.filter(faculty => {
        const matchesSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faculty.position.toLowerCase().includes(searchTerm.toLowerCase());

        const isHead = ['Dean', 'Department Chair'].some(role =>
            faculty.position.includes(role)
        );

        const matchesCategory = activeCategory === 'Heads' ? isHead : !isHead;

        return matchesSearch && matchesCategory;
    });

    const handleCardClick = (facultyId) => {
        navigate(`/qce/evaluations/${facultyId}`);
    };

    return (
        <DashboardLayout
            role="QCE Manager"
            userName={userInfo.fullName}
            notificationCount={5}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Evaluation Monitoring</h1>
                        <p className={styles.subtitle}>Track real-time progress of faculty evaluations.</p>
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


                <div className={styles.tabsContainer}>
                    <button
                        className={`${styles.tab} ${activeCategory === 'Heads' ? styles.activeTab : ''}`}
                        onClick={() => setActiveCategory('Heads')}
                    >
                        Academic Heads
                    </button>
                    <button
                        className={`${styles.tab} ${activeCategory === 'Faculty' ? styles.activeTab : ''}`}
                        onClick={() => setActiveCategory('Faculty')}
                    >
                        Faculty Members
                    </button>
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
                                        <div className={styles.headerLeft}>
                                            <div className={styles.avatarCircle}>
                                                {faculty.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                            </div>
                                            <div className={styles.facultyInfo}>
                                                <h3 className={styles.facultyName}>{faculty.name}</h3>
                                                <p className={styles.facultyPosition}>{faculty.position}</p>
                                            </div>
                                        </div>
                                        <div className={styles.statusBadge}>
                                            {(() => {
                                                const started = faculty.started_count || 0;
                                                const total = faculty.total_evaluations || 0;
                                                const pending = total - started;

                                                if (total === 0) return <span className={styles.statusNone}>No Assignments</span>;
                                                if (pending === 0) return <span className={styles.statusComplete}>Completed</span>;
                                                if (started === 0) return <span className={styles.statusNotStarted}>{total} Not Started</span>;
                                                return <span className={styles.statusProgress}>{pending} Pending</span>;
                                            })()}
                                        </div>
                                    </div>

                                    <div className={styles.cardStats}>
                                        {['Dean', 'Department Chair'].some(r => faculty.position.includes(r)) ? (
                                            <div className={styles.adminStatItem}>
                                                <span className={styles.adminStatLabel}>Evaluator</span>
                                                <span className={styles.adminStatValue}>
                                                    {faculty.position.includes('Dean') ? 'VPAA' : 'College Dean'}
                                                </span>
                                            </div>
                                        ) : (
                                            <>
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
                                            </>
                                        )}
                                    </div>

                                    <div className={styles.cardFooter}>

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
        </DashboardLayout >
    );
}
