import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout/DashboardLayout';
import { Table } from '@/components/Table/Table';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import styles from './FacultyResultsPage.module.css';

export function FacultyResultsPage() {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Get user info from sessionStorage
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        collegeId: null,
    });

    useEffect(() => {
        const fullName = sessionStorage.getItem('fullName') || 'College Dean';
        const collegeId = sessionStorage.getItem('collegeId');
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

                // Map API data to table format, setting N/A for scores currently
                const mappedData = filteredData.map(faculty => ({
                    id: faculty.id,
                    facultyName: faculty.name,
                    role: faculty.role,
                    averageRating: 'N/A',
                    interpretation: 'N/A'
                }));
                setResults(mappedData);
            }
        } catch (error) {
            console.error('Error fetching faculty results:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getInterpretationVariant = (interpretation) => {
        if (interpretation === 'Excellent') return 'success';
        if (interpretation === 'Very Good') return 'active';
        if (interpretation === 'N/A') return 'neutral';
        return 'warning';
    };

    const columns = [
        {
            header: 'Faculty Name',
            accessor: 'facultyName',
            width: '30%',
        },
        {
            header: 'Role',
            accessor: 'role',
            width: '25%',
        },
        {
            header: 'Average Score',
            accessor: 'averageRating',
            width: '20%',
            align: 'center',
            render: (value) => (
                <span className={styles.rating}>{value}</span>
            ),
        },
        {
            header: 'Rating',
            accessor: 'interpretation',
            width: '15%',
            align: 'center',
            render: (value) => (
                <Badge variant={getInterpretationVariant(value)}>
                    {value}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            width: '10%',
            align: 'center',
            render: () => (
                <button className={styles.viewButton}>View Details</button>
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
                        <h1 className={styles.title}>Faculty Evaluation Results</h1>
                        <p className={styles.subtitle}>Detailed performance reports for all faculty members.</p>
                    </div>
                    <Button variant="ghost">
                        <Download size={18} />
                        Export All Reports
                    </Button>
                </div>

                <div className={styles.tableContainer}>
                    {isLoading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
                    ) : (
                        <Table columns={columns} data={results} />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
