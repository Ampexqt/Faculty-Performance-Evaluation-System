import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { DashboardLayout } from '../../../../../components/DashboardLayout/DashboardLayout';
import styles from './VPAAAnnexAPage.module.css';

const VPAAAnnexAPage = () => {
    const { vpaaId } = useParams();
    const navigate = useNavigate();
    const [vpaa, setVpaa] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

    useEffect(() => {
        fetchVPAADetails();
    }, [vpaaId]);

    const fetchVPAADetails = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/zonal/vpaa-results/${vpaaId}`);
            const data = await response.json();
            if (data.success) {
                setVpaa(data.data.faculty);
            }
        } catch (error) {
            console.error('Error fetching VPAA details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
            </div>
        );
    }

    if (!vpaa) return <div>VPAA not found</div>;

    return (
        <DashboardLayout role="Zonal Admin" userName={userInfo.fullName} notificationCount={0}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button className={styles.backButton} onClick={() => navigate('/zonal/vpaa-results')}>
                        <ArrowLeft size={20} />
                        Back to Results
                    </button>
                    <button className={styles.printButton} onClick={handlePrint}>
                        <Printer size={20} />
                        Print Report
                    </button>
                </div>

                <div className={styles.title}>
                    ANNEX A – Student Evaluation of Teachers (SET)
                </div>

                <div className={styles.infoSection}>
                    <div className={styles.subTitle}>The QCE of the NBC No. 461</div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Name of Faculty:</span>
                        <span className={styles.value}>{vpaa.name}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Academic Rank:</span>
                        <span className={styles.value}>VPAA</span>
                    </div>
                </div>

                <div className={styles.contentBox}>
                    <div className={styles.notApplicableTitle}>Not Applicable</div>
                    <div className={styles.notApplicableText}>
                        Annex A (Student Evaluation) is not applicable for VPAA. Please refer to Annex B (Supervisor Evaluation).
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default VPAAAnnexAPage;
