import React, { useState } from 'react';
import { Users, ClipboardList, BookOpen } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { StatCard } from '@/components/StatCard/StatCard';
import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Input } from '@/components/Input/Input';
import styles from './DeanOverviewPage.module.css';

export function DeanOverviewPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Assigning Department Chair:', formData);
        setIsModalOpen(false);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
        });
    };

    return (
        <DashboardLayout
            role="College Dean"
            userName="College Dean"
            notificationCount={3}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Department Overview</h1>
                        <p className={styles.subtitle}>Overview of faculty performance within your department.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        + Assign Dept. Chair
                    </Button>
                </div>

                <div className={styles.stats}>
                    <StatCard
                        title="Total Faculty"
                        value={24}
                        subtitle="Within department"
                        icon={Users}
                    />
                    <StatCard
                        title="Evaluations"
                        value={156}
                        subtitle="+12% Completed this semester"
                        trendValue="+12%"
                        icon={ClipboardList}
                    />
                    <StatCard
                        title="Programs"
                        value={3}
                        subtitle="Active programs"
                        icon={BookOpen}
                    />
                </div>

                {/* Assign Department Chair Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCancel}
                    title="Assign Department Chair"
                >
                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        <div className={styles.formRow}>
                            <Input
                                label="First Name"
                                name="firstName"
                                type="text"
                                placeholder="e.g. John"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                label="Last Name"
                                name="lastName"
                                type="text"
                                placeholder="e.g. Doe"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="john.doe@university.edu"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />

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
                                Assign Chair
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
