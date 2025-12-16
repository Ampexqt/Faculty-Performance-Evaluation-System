import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Badge } from '@/components/Badge/Badge';
import styles from './FacultyEvaluationDetail.module.css';

export function FacultyEvaluationDetail() {
    const { facultyId } = useParams();
    const navigate = useNavigate();
    const [facultyData, setFacultyData] = useState(null);
    const [evaluationDetails, setEvaluationDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        role: ''
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserInfo({
                fullName: user.full_name || 'QCE Manager',
                role: user.role
            });
        }
    }, []);

    useEffect(() => {
        if (facultyId) {
            fetchFacultyDetails();
        }
    }, [facultyId]);

    const fetchFacultyDetails = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/qce/faculty-evaluations/${facultyId}`);
            const data = await response.json();

            if (data.success) {
                setFacultyData(data.faculty);
                setEvaluationDetails(data.evaluations);
            }
        } catch (error) {
            console.error('Error fetching faculty details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        {
            header: 'Subject',
            accessor: 'subject_name',
            width: '25%',
            render: (value, row) => (
                <div>
                    <div className={styles.subjectName}>{value}</div>
                    <div className={styles.subjectCode}>{row.subject_code}</div>
                </div>
            )
        },
        {
            header: 'Section',
            accessor: 'section',
            width: '15%',
        },
        {
            header: 'Year Level',
            accessor: 'year_level',
            width: '12%',
            align: 'center',
        },
        {
            header: 'Total Students',
            accessor: 'total_students',
            width: '12%',
            align: 'center',
        },
        {
            header: 'Evaluated',
            accessor: 'evaluated_count',
            width: '12%',
            align: 'center',
            render: (value, row) => (
                <span className={styles.evaluatedCount}>
                    {value} / {row.total_students}
                </span>
            )
        },
        {
            header: 'Progress',
            accessor: 'progress',
            width: '12%',
            align: 'center',
            render: (value) => (
                <div className={styles.progressCell}>
                    <span className={styles.progressText}>{value}%</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '12%',
            align: 'center',
            render: (value) => (
                <Badge variant={value === 'Completed' ? 'success' : 'warning'}>
                    {value}
                </Badge>
            )
        }
    ];

    if (isLoading) {
        return (
            <DashboardLayout role={userInfo.role} userName={userInfo.fullName}>
                <div className={styles.loadingContainer}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!facultyData) {
        return (
            <DashboardLayout role={userInfo.role} userName={userInfo.fullName}>
                <div className={styles.errorContainer}>
                    <p>Faculty not found</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            role={userInfo.role}
            userName={userInfo.fullName}
            notificationCount={5}
        >
            <div className={styles.page}>
                <button className={styles.backButton} onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    Back to Evaluations
                </button>

                {/* Faculty Header */}
                <div className={styles.facultyHeader}>
                    <div className={styles.avatarLarge}>
                        {facultyData.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className={styles.facultyHeaderInfo}>
                        <h1 className={styles.facultyName}>{facultyData.name}</h1>
                        <p className={styles.facultyPosition}>{facultyData.position}</p>
                        <p className={styles.facultyDepartment}>{facultyData.department_name}</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statCardIcon} style={{ background: '#dbeafe' }}>
                            <BookOpen size={24} color="#1e40af" />
                        </div>
                        <div className={styles.statCardContent}>
                            <span className={styles.statCardValue}>{facultyData.subjects_count || 0}</span>
                            <span className={styles.statCardLabel}>Subjects Handled</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statCardIcon} style={{ background: '#fef3c7' }}>
                            <Users size={24} color="#92400e" />
                        </div>
                        <div className={styles.statCardContent}>
                            <span className={styles.statCardValue}>{facultyData.sections_count || 0}</span>
                            <span className={styles.statCardLabel}>Sections Handled</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statCardIcon} style={{ background: '#d1fae5' }}>
                            <CheckCircle size={24} color="#065f46" />
                        </div>
                        <div className={styles.statCardContent}>
                            <span className={styles.statCardValue}>{facultyData.evaluated_count || 0}</span>
                            <span className={styles.statCardLabel}>Students Evaluated</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statCardIcon} style={{ background: '#fee2e2' }}>
                            <Clock size={24} color="#991b1b" />
                        </div>
                        <div className={styles.statCardContent}>
                            <span className={styles.statCardValue}>{facultyData.pending_count || 0}</span>
                            <span className={styles.statCardLabel}>Pending Evaluations</span>
                        </div>
                    </div>
                </div>

                {/* Evaluation Details Table */}
                <div className={styles.tableSection}>
                    <h2 className={styles.sectionTitle}>Evaluation Details by Subject & Section</h2>
                    <div className={styles.tableContainer}>
                        {evaluationDetails.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No evaluation data available</p>
                            </div>
                        ) : (
                            <Table columns={columns} data={evaluationDetails} />
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
