import React, { useState, useEffect } from 'react';
import { Users, BookOpen, ClipboardList, Clock, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { StatCard } from '@/components/StatCard/StatCard';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import { Modal } from '@/components/Modal/Modal';
import styles from './QCEDashboardPage.module.css';

// Mock faculty data with roles - KEEPING FOR FORM
const mockFaculty = [
    { id: 1, name: 'Prof. Alan Turing', role: 'Professor' },
    { id: 2, name: 'Prof. Ada Lovelace', role: 'Professor' },
    { id: 3, name: 'Dr. Grace Hopper', role: 'Dean' },
    { id: 4, name: 'Inst. Linus Torvalds', role: 'Visiting Lecturer' },
];

const mockSubjects = [
    { id: 1, code: 'CS101', name: 'Introduction to Programming' },
    { id: 2, code: 'CS102', name: 'Data Structures' },
    { id: 3, code: 'IT201', name: 'Database Management' },
];

const mockSections = [
    { id: 1, name: 'BSCS 1-A' },
    { id: 2, name: 'BSCS 1-B' },
    { id: 3, name: 'BSIT 2-A' },
];

// Function to generate random code
const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 3; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 3; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

export function QCEDashboardPage() {
    const [evaluations, setEvaluations] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        facultyRole: '',
        faculty: '',
        subject: '',
        section: '',
    });
    const [generatedCode, setGeneratedCode] = useState('');
    const [filteredFaculty, setFilteredFaculty] = useState([]);

    // Get user info from localStorage
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        collegeName: '',
        departmentName: ''
    });

    useEffect(() => {
        const fullName = localStorage.getItem('fullName') || 'QCE Manager';
        const collegeName = localStorage.getItem('collegeName') || 'Not Assigned';
        const departmentName = localStorage.getItem('departmentName') || '';
        setUserInfo({ fullName, collegeName, departmentName });
    }, []);

    const [stats, setStats] = useState({
        totalFaculty: 0,
        totalPrograms: 0,
        activeEvaluations: 0,
        pendingDeanEvals: 0
    });

    // Fetch dashboard stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user.college_id) {
                        const response = await fetch(`http://localhost:5000/api/qce/stats?college_id=${user.college_id}`);
                        const data = await response.json();
                        if (data.success) {
                            setStats(data.data);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };

        fetchStats();
    }, []);

    // Filter faculty by role
    useEffect(() => {
        if (formData.facultyRole) {
            const filtered = mockFaculty.filter(f => f.role === formData.facultyRole);
            setFilteredFaculty(filtered);
        } else {
            setFilteredFaculty([]);
        }
    }, [formData.facultyRole]);

    // Generate code when all fields are filled
    useEffect(() => {
        if (formData.faculty && formData.subject && formData.section) {
            setGeneratedCode(generateCode());
        } else {
            setGeneratedCode('');
        }
    }, [formData.faculty, formData.subject, formData.section]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset faculty when role changes
            ...(name === 'facultyRole' ? { faculty: '' } : {})
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Generating evaluation code:', { ...formData, code: generatedCode });
        setIsModalOpen(false);
        setFormData({ facultyRole: '', faculty: '', subject: '', section: '' });
        setGeneratedCode('');
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({ facultyRole: '', faculty: '', subject: '', section: '' });
        setGeneratedCode('');
    };

    const columns = [
        {
            header: 'Faculty Name',
            accessor: 'facultyName',
            width: '25%',
            render: (value) => (
                <div className={styles.facultyCell}>
                    <ChevronRight size={16} className={styles.chevron} />
                    <span>{value}</span>
                </div>
            ),
        },
        {
            header: 'Subject & Section',
            accessor: 'subject',
            width: '20%',
            render: (value, row) => (
                <div>
                    <div className={styles.subject}>{value}</div>
                    <div className={styles.section}>{row.section}</div>
                </div>
            ),
        },
        {
            header: 'Progress',
            accessor: 'progress',
            width: '25%',
            render: (value, row) => (
                <div className={styles.progressCell}>
                    <ProgressBar
                        value={value}
                        max={row.total}
                        showLabel
                    />
                </div>
            ),
        },
        {
            header: 'Rating',
            accessor: 'rating',
            width: '15%',
            align: 'center',
            render: (value) => (
                value ? (
                    <span className={styles.rating}>{value}</span>
                ) : (
                    <span className={styles.noRating}>-</span>
                )
            ),
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '15%',
            align: 'center',
            render: (value) => (
                <Badge variant={value === 'Completed' ? 'completed' : 'inProgress'}>
                    {value}
                </Badge>
            ),
        },
    ];

    return (
        <DashboardLayout
            role="QCE Manager"
            userName={userInfo.fullName}
            notificationCount={2}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Evaluation Management</h1>
                        <p className={styles.subtitle}>
                            <span style={{ fontWeight: '700', color: '#800000', fontSize: '1.1em' }}>
                                {userInfo.collegeName}
                                {userInfo.departmentName && ` - ${userInfo.departmentName}`}
                            </span>
                            <span style={{ color: '#6b7280' }}> • Manage faculty evaluations and monitor progress.</span>
                        </p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        + Generate Evaluation Code
                    </Button>
                </div>

                <div className={styles.stats}>
                    <StatCard
                        title="Total Faculty"
                        value={stats.totalFaculty}
                        subtitle="Active this semester"
                        icon={Users}
                    />
                    <StatCard
                        title="Total Programs"
                        value={stats.totalPrograms}
                        subtitle="Managed programs"
                        icon={BookOpen}
                    />
                    <StatCard
                        title="Active Evaluations"
                        value={stats.activeEvaluations}
                        subtitle="Ongoing evaluations"
                        icon={ClipboardList}
                    />
                    <StatCard
                        title="Pending Dean Evals"
                        value={stats.pendingDeanEvals}
                        subtitle="Requires attention"
                        icon={Clock}
                    />
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <h2 className={styles.sectionTitle}>Evaluation Status</h2>
                            <p className={styles.sectionSubtitle}>Track faculty evaluation progress and ratings</p>
                        </div>
                        <div className={styles.headerActions}>
                            <input
                                type="search"
                                placeholder="Search faculty..."
                                className={styles.searchInput}
                            />
                            <Button variant="secondary" size="small">
                                Filter
                            </Button>
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        <Table columns={columns} data={evaluations} />
                    </div>
                </div>

                {/* Generate Evaluation Code Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Generate Evaluation Code"
                >
                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Faculty Role<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="facultyRole"
                                value={formData.facultyRole}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select faculty role</option>
                                <option value="Dean">Dean</option>
                                <option value="Professor">Professor</option>
                                <option value="Visiting Lecturer">Visiting Lecturer</option>
                                <option value="Program Chair">Program Chair</option>
                                <option value="Department Chair">Department Chair</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Select Faculty<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="faculty"
                                value={formData.faculty}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                                disabled={!formData.facultyRole}
                            >
                                <option value="">Select an option</option>
                                {filteredFaculty.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Select Subject<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select an option</option>
                                {mockSubjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Select Section<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="section"
                                value={formData.section}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select an option</option>
                                {mockSections.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        {generatedCode && (
                            <div className={styles.codeDisplay}>
                                <div className={styles.codeLabel}>Generated Code</div>
                                <div className={styles.codeValue}>{generatedCode}</div>
                            </div>
                        )}

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                            >
                                Save & Activate
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
