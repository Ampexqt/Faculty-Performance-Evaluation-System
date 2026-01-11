import React, { useState, useEffect } from 'react';
import { Users, BookOpen, ClipboardList, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { StatCard } from '@/components/StatCard/StatCard';

import { Button } from '@/components/Button/Button';

import { Modal } from '@/components/Modal/Modal';
import { ToastContainer } from '@/components/Toast/Toast';
import { useToast } from '@/hooks/useToast';
import styles from './QCEDashboardPage.module.css';

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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        facultyRole: '',
        faculty: '',
        subject: '',
        section: '',
    });
    const [generatedCode, setGeneratedCode] = useState('');
    const [isExistingCode, setIsExistingCode] = useState(false);

    // Toast hook
    const { toasts, removeToast, success, error: showError } = useToast();

    // Real data states
    const [facultyList, setFacultyList] = useState([]);
    const [facultyAssignments, setFacultyAssignments] = useState([]); // All assignments for selected faculty
    const [subjectList, setSubjectList] = useState([]); // Unique subjects derived from assignments
    const [sectionList, setSectionList] = useState([]); // Sections for selected subject
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);

    // Get user info from sessionStorage
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        collegeName: '',
        departmentName: '',
        collegeId: null
    });

    useEffect(() => {
        const fullName = sessionStorage.getItem('fullName') || 'QCE Manager';
        const collegeName = sessionStorage.getItem('collegeName') || 'Not Assigned';
        const departmentName = sessionStorage.getItem('departmentName') || '';
        const collegeId = sessionStorage.getItem('collegeId');
        setUserInfo({ fullName, collegeName, departmentName, collegeId });
    }, []);

    const [stats, setStats] = useState({
        totalFaculty: 0,
        totalPrograms: 0,
        evaluationsCreated: 0,
        evaluationsNotCreated: 0
    });

    // Fetch dashboard stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                if (userInfo.collegeId) {
                    const response = await fetch(`http://localhost:5000/api/qce/stats?college_id=${userInfo.collegeId}`);
                    const data = await response.json();
                    if (data.success) {
                        setStats(data.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };

        if (userInfo.collegeId) {
            fetchStats();
        }
    }, [userInfo.collegeId]);

    // Fetch faculty when Role changes
    useEffect(() => {
        const fetchFaculty = async () => {
            if (!formData.facultyRole || !userInfo.collegeId) {
                setFacultyList([]);
                return;
            }

            try {
                setIsLoadingOptions(true);
                const response = await fetch(`http://localhost:5000/api/qce/faculty?college_id=${userInfo.collegeId}&role=${formData.facultyRole}`);
                const data = await response.json();

                if (data.success) {
                    setFacultyList(data.data);
                }
            } catch (error) {
                console.error('Error fetching faculty:', error);
            } finally {
                setIsLoadingOptions(false);
            }
        };

        fetchFaculty();
    }, [formData.facultyRole, userInfo.collegeId]);

    // Fetch faculty assignments when Faculty selected
    useEffect(() => {
        const fetchAssignments = async () => {
            if (!formData.faculty) {
                setFacultyAssignments([]);
                setSubjectList([]);
                return;
            }

            try {
                setIsLoadingOptions(true);
                const response = await fetch(`http://localhost:5000/api/qce/subjects/assignments?faculty_id=${formData.faculty}`);
                const data = await response.json();

                if (data.success) {
                    setFacultyAssignments(data.data);

                    // Extract unique subjects
                    const uniqueSubjects = [];
                    const map = new Map();
                    for (const item of data.data) {
                        if (!map.has(item.subjectId)) {
                            map.set(item.subjectId, true);
                            uniqueSubjects.push({
                                id: item.subjectId,
                                code: item.subjectCode,
                                name: item.subjectName
                            });
                        }
                    }
                    setSubjectList(uniqueSubjects);
                }
            } catch (error) {
                console.error('Error fetching assignments:', error);
            } finally {
                setIsLoadingOptions(false);
            }
        };

        fetchAssignments();
    }, [formData.faculty]);

    // Update Section list when Subject selected
    useEffect(() => {
        if (!formData.subject || facultyAssignments.length === 0) {
            setSectionList([]);
            return;
        }

        const sections = facultyAssignments
            .filter(a => a.subjectId.toString() === formData.subject.toString())
            .map(a => ({
                id: a.id, // Use Assignment ID as the value
                name: a.section
            }));

        setSectionList(sections);
    }, [formData.subject, facultyAssignments]);

    // Generate code when all fields are filled
    useEffect(() => {
        if (formData.faculty && formData.subject && formData.section) {
            // Check if code already exists for this assignment
            const assignment = facultyAssignments.find(a => a.id.toString() === formData.section.toString());

            if (assignment && assignment.evalCode) {
                setGeneratedCode(assignment.evalCode);
                setIsExistingCode(true);
            } else {
                setGeneratedCode(generateCode());
                setIsExistingCode(false);
            }
        } else {
            setGeneratedCode('');
            setIsExistingCode(false);
        }
    }, [formData.faculty, formData.subject, formData.section, facultyAssignments]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };

            // Reset dependent fields
            if (name === 'facultyRole') {
                newState.faculty = '';
                newState.subject = '';
                newState.section = '';
            } else if (name === 'faculty') {
                newState.subject = '';
                newState.section = '';
            } else if (name === 'subject') {
                newState.section = '';
            }

            return newState;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/qce/subjects/assignments/generate-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    assignmentId: formData.section, // This now holds the assignment ID
                    code: generatedCode
                }),
            });

            const data = await response.json();

            if (data.success) {
                success('Evaluation code generated and activated successfully!');
                setIsModalOpen(false);
                setFormData({ facultyRole: '', faculty: '', subject: '', section: '' });
                setFormData({ facultyRole: '', faculty: '', subject: '', section: '' });
                setGeneratedCode('');
                setIsExistingCode(false);
                // Optionally refresh evaluations list here
            } else {
                showError('Failed to save code: ' + data.message);
            }
        } catch (err) {
            console.error('Error saving code:', err);
            showError('An error occurred while saving the code.');
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({ facultyRole: '', faculty: '', subject: '', section: '' });
        setFormData({ facultyRole: '', faculty: '', subject: '', section: '' });
        setGeneratedCode('');
        setIsExistingCode(false);
    };



    return (
        <DashboardLayout
            role="QCE Manager"
            userName={userInfo.fullName}
            notificationCount={2}
        >
            <ToastContainer toasts={toasts} removeToast={removeToast} />
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
                        title="Evaluations Created"
                        value={stats.evaluationsCreated}
                        subtitle="Ready for students"
                        icon={ClipboardList}
                    />
                    <StatCard
                        title="Evaluations Not Created"
                        value={stats.evaluationsNotCreated}
                        subtitle="Pending activation"
                        icon={Clock}
                    />
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

                                <option value="Professor">Professor</option>
                                <option value="Visiting Lecturer">Visiting Lecturer</option>
                                <option value="Program Chair">Program Chair</option>
                                <option value="Department Chair">Department Chair</option>
                                <option value="Faculty">Faculty</option>
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
                                disabled={!formData.facultyRole || isLoadingOptions}
                            >
                                <option value="">Select an option</option>
                                {facultyList.map(f => (
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
                                disabled={!formData.faculty || isLoadingOptions}
                            >
                                <option value="">Select an option</option>
                                {subjectList.map(s => (
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
                                disabled={!formData.subject || isLoadingOptions}
                            >
                                <option value="">Select an option</option>
                                {sectionList.map(s => (
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
                                disabled={isExistingCode}
                            >
                                {isExistingCode ? 'Code Already Generated' : 'Save & Activate'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
