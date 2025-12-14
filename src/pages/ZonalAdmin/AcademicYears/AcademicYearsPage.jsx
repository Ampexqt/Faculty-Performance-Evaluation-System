import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './AcademicYearsPage.module.css';

export function AcademicYearsPage() {
    const [semesters, setSemesters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        academicYear: '',
        semester: '',
        startDate: '',
        endDate: '',
    });

    // Fetch academic years
    const fetchAcademicYears = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/zonal/academic-years');
            const data = await response.json();

            if (data.success) {
                setSemesters(data.data);
            }
        } catch (error) {
            console.error('Error fetching academic years:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAcademicYears();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Generate simple code
            const yearCode = formData.academicYear.replace(/\s+/g, '');

            const response = await fetch('http://localhost:5000/api/zonal/academic-years', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    year_code: yearCode,
                    year_label: formData.academicYear,
                    semester: formData.semester,
                    start_date: formData.startDate,
                    end_date: formData.endDate
                }),
            });

            const data = await response.json();

            if (data.success) {
                await fetchAcademicYears();
                setIsModalOpen(false);
                setFormData({ academicYear: '', semester: '', startDate: '', endDate: '' });
            } else {
                alert(data.message || 'Error creating academic year');
            }
        } catch (error) {
            console.error('Error creating academic year:', error);
            alert('Server error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({ academicYear: '', semester: '', startDate: '', endDate: '' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const columns = [
        {
            header: 'Academic Year',
            accessor: 'year_label',
            width: '20%',
        },
        {
            header: 'Semester',
            accessor: 'semester',
            width: '20%',
        },
        {
            header: 'Start Date',
            accessor: 'start_date',
            width: '15%',
            render: (value) => formatDate(value)
        },
        {
            header: 'End Date',
            accessor: 'end_date',
            width: '15%',
            render: (value) => formatDate(value)
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '15%',
            align: 'center',
            render: (value) => (
                <Badge variant={value === 'active' ? 'active' : 'warning'}>
                    {value === 'active' ? 'Active' : 'Closed'}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '15%',
            align: 'center',
            render: (_, row) => (
                row.status === 'active' ? (
                    <Button variant="danger" size="small">
                        Close Semester
                    </Button>
                ) : (
                    <span className={styles.archivedText}>Archived</span>
                )
            ),
        },
    ];

    if (isLoading) {
        return (
            <DashboardLayout role="Zonal Admin" userName="Zonal Admin">
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            role="Zonal Admin"
            userName="Zonal Admin"
            notificationCount={3}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Academic Years & Semesters</h1>
                        <p className={styles.subtitle}>Manage academic calendar and evaluation periods.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        Open New Semester
                    </Button>
                </div>

                <div className={styles.tableContainer}>
                    <Table columns={columns} data={semesters} />
                </div>

                {/* Open New Semester Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Open New Semester"
                >
                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        <Input
                            label="Academic Year"
                            name="academicYear"
                            type="text"
                            placeholder="e.g. 2024-2025"
                            value={formData.academicYear}
                            onChange={handleInputChange}
                            required
                        />

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Semester<span className={styles.required}>*</span>
                            </label>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Select an option</option>
                                <option value="1st Semester">1st Semester</option>
                                <option value="2nd Semester">2nd Semester</option>
                            </select>
                        </div>

                        <div className={styles.dateRow}>
                            <div className={styles.dateField}>
                                <Input
                                    label="Start Date"
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={styles.dateField}>
                                <Input
                                    label="End Date"
                                    name="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.modalActions}>
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
                                {isSubmitting ? 'Create & Activate' : 'Create & Activate'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
