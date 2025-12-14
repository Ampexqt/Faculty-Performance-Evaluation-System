import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Badge } from '@/components/Badge/Badge';
import styles from './EvaluationsPage.module.css';

export function EvaluationsPage() {
    const [evaluations, setEvaluations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Get user info from localStorage
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        collegeId: null,
    });

    useEffect(() => {
        const fullName = localStorage.getItem('fullName') || 'College Dean';
        const collegeId = localStorage.getItem('collegeId');
        setUserInfo({ fullName, collegeId });
    }, []);

    // Fetch faculty data
    useEffect(() => {
        if (userInfo.collegeId) {
            fetchFaculty();
        }
    }, [userInfo.collegeId]);

    const fetchFaculty = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/qce/faculty?college_id=${userInfo.collegeId}`);
            const data = await response.json();

            if (data.success) {
                // Filter out Dean and current user
                const filteredData = data.data.filter(faculty =>
                    faculty.role !== 'Dean' && faculty.name !== userInfo.fullName
                );

                const mappedData = filteredData.map(faculty => ({
                    id: faculty.id,
                    name: faculty.name,
                    role: faculty.role,
                    status: 'Pending' // Default for now
                }));
                setEvaluations(mappedData);
            }
        } catch (error) {
            console.error('Error fetching faculty for evaluation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusVariant = (status) => {
        if (status === 'Completed') return 'success';
        if (status === 'Pending') return 'warning';
        return 'default';
    };

    const filteredEvaluations = evaluations.filter(evaluation =>
        evaluation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: 'Faculty Name',
            accessor: 'name',
            width: '40%',
        },
        {
            header: 'Role',
            accessor: 'role',
            width: '30%',
        },
        {
            header: 'Status',
            accessor: 'status',
            width: '15%',
            align: 'center',
            render: (value) => (
                <Badge variant={getStatusVariant(value)}>
                    {value}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '15%',
            align: 'center',
            render: (_, row) => (
                <button className={styles.evaluateButton}>
                    {row.status === 'Completed' ? 'View' : 'Evaluate'}
                </button>
            ),
        },
    ];

    return (
        <DashboardLayout
            role="College Dean"
            userName={userInfo.fullName}
            notificationCount={3}
        >
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Faculty Evaluations</h1>
                        <p className={styles.subtitle}>Evaluate department chairs and faculty members.</p>
                    </div>
                </div>

                <div className={styles.searchContainer}>
                    <div className={styles.searchWrapper}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by name or role..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    {isLoading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
                    ) : (
                        <Table columns={columns} data={filteredEvaluations} />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
