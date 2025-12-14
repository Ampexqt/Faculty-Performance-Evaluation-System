import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './SchedulesPage.module.css';

export function SchedulesPage() {
    const [schedules, setSchedules] = useState([]);
    const [subjectsList, setSubjectsList] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userInfo, setUserInfo] = useState({
        departmentId: null,
        fullName: ''
    });

    const [formData, setFormData] = useState({
        subjectId: '',
        yearLevel: '',
        section: '',
        facultyId: '',
    });

    useEffect(() => {
        const departmentId = localStorage.getItem('departmentId');
        const fullName = localStorage.getItem('fullName') || 'Department Chair';
        setUserInfo({ departmentId, fullName });
    }, []);

    useEffect(() => {
        if (userInfo.departmentId) {
            fetchAssignments();
            fetchSubjects();
            fetchFaculty();
        }
    }, [userInfo.departmentId]);

    const fetchAssignments = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/subjects/assignments?department_id=${userInfo.departmentId}`);
            const data = await response.json();
            if (data.success) {
                setSchedules(data.data.map(item => ({
                    id: item.id,
                    subject: item.subjectCode,
                    descriptiveTitle: item.subjectName,
                    section: item.section,
                    faculty: item.facultyName
                })));
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/subjects?department_id=${userInfo.departmentId}`);
            const data = await response.json();
            if (data.success) {
                setSubjectsList(data.data);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchFaculty = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/qce/faculty?department_id=${userInfo.departmentId}`);
            const data = await response.json();
            if (data.success) {
                setFacultyList(data.data);
            }
        } catch (error) {
            console.error('Error fetching faculty:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Construct section name (e.g., "1-A")
        const sectionName = `${formData.yearLevel}-${formData.section}`;

        try {
            const response = await fetch('http://localhost:5000/api/qce/subjects/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subjectId: formData.subjectId,
                    facultyId: formData.facultyId,
                    section: sectionName
                })
            });
            const result = await response.json();
            if (result.success) {
                alert('Subject assigned successfully');
                setIsModalOpen(false);
                setFormData({ subjectId: '', yearLevel: '', section: '', facultyId: '' });
                fetchAssignments();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error assigning subject:', error);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({
            subjectId: '',
            yearLevel: '',
            section: '',
            facultyId: '',
        });
    };

    const columns = [
        {
            header: 'Subject',
            accessor: 'subject',
            width: '15%',
        },
        {
            header: 'Descriptive Title',
            accessor: 'descriptiveTitle',
            width: '35%',
        },
        {
            header: 'Section',
            accessor: 'section',
            width: '20%',
        },
        {
            header: 'Faculty',
            accessor: 'faculty',
            width: '30%',
        },
    ];

    return (
        <DashboardLayout
            role="Dept. Chair"
            userName={userInfo.fullName}
            notificationCount={2}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Assigned Subjects</h1>
                        <p className={styles.subtitle}>View assigned subjects to faculty members.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Assign Subject
                    </Button>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={schedules} />
                </div>

                {/* Assign Subject Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Assign Subject"
                >
                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        {/* Subject Dropdown */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Subject <span className={styles.required}>*</span>
                            </label>
                            <select
                                name="subjectId"
                                className={styles.select}
                                value={formData.subjectId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Subject</option>
                                {subjectsList.map(subject => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.code} - {subject.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Year Level and Section Row */}
                        <div className={styles.formRow}>
                            {/* Year Level Dropdown */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Year Level <span className={styles.required}>*</span>
                                </label>
                                <select
                                    name="yearLevel"
                                    className={styles.select}
                                    value={formData.yearLevel}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Year</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>

                            {/* Section Dropdown */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Section <span className={styles.required}>*</span>
                                </label>
                                <select
                                    name="section"
                                    className={styles.select}
                                    value={formData.section}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Section</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                    <option value="E">E</option>
                                    <option value="F">F</option>
                                    <option value="G">G</option>
                                    <option value="H">H</option>
                                </select>
                            </div>
                        </div>

                        {/* Faculty Dropdown */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Faculty <span className={styles.required}>*</span>
                            </label>
                            <select
                                name="facultyId"
                                className={styles.select}
                                value={formData.facultyId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Faculty</option>
                                {facultyList.map(faculty => (
                                    <option key={faculty.id} value={faculty.id}>
                                        {faculty.first_name} {faculty.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>

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
                                Assign Subject
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
