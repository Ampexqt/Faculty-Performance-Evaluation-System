import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    ClipboardList,
    Calendar,
    Settings,
    FileText,
    GraduationCap,
    Building2,
    UserCog,
    BarChart3,
    X
} from 'lucide-react';
import { cn } from '@/utils/cn';
import styles from './Sidebar.module.css';

const zonalAdminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/zonal/dashboard' },
    { icon: Building2, label: 'Colleges', path: '/zonal/colleges' },
    { icon: Calendar, label: 'Academic Years', path: '/zonal/academic-years' },
    { icon: UserCog, label: 'QCE Accounts', path: '/zonal/qce-management' },
];

const qceMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/qce/dashboard' },
    { icon: Users, label: 'Faculty', path: '/qce/faculty' },
    { icon: BookOpen, label: 'Programs', path: '/qce/programs' },
    { icon: ClipboardList, label: 'Evaluations', path: '/qce/evaluations' },
    { icon: BarChart3, label: 'Evaluation Results', path: '/qce/results' },
];

const deanMenuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dean/overview' },
    { icon: ClipboardList, label: 'Faculty Results', path: '/dean/faculty-results' },
    { icon: BookOpen, label: 'Programs', path: '/dean/programs' },
    { icon: ClipboardList, label: 'Evaluations', path: '/dean/evaluations' },
];

const deptChairMenuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dept-chair/faculty' },
    { icon: Users, label: 'Faculty Accounts', path: '/dept-chair/faculty-accounts' },
    { icon: GraduationCap, label: 'Programs', path: '/dept-chair/programs' },
    { icon: BookOpen, label: 'Subjects', path: '/dept-chair/subjects' },
    { icon: Calendar, label: 'Assigned Subjects', path: '/dept-chair/schedules' },
    { icon: ClipboardList, label: 'Evaluations', path: '/dept-chair/evaluations' },
];

const facultyMenuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/faculty/overview' },
    { icon: BookOpen, label: 'My Subjects', path: '/faculty/subjects' },
    { icon: Calendar, label: 'Evaluation Results', path: '/faculty/results' },
];

const studentMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
    { icon: ClipboardList, label: 'My Evaluations', path: '/student/evaluations' },
];

export function Sidebar({
    role = 'Zonal Admin',
    isMobileOpen = false,
    onClose,
    className,
    ...props
}) {
    let menuItems = zonalAdminMenuItems;

    if (role === 'QCE Manager') {
        menuItems = qceMenuItems;
    } else if (role === 'College Dean') {
        menuItems = deanMenuItems;
    } else if (role === 'Dept. Chair') {
        menuItems = deptChairMenuItems;
    } else if (role === 'Faculty') {
        menuItems = facultyMenuItems;
    } else if (role === 'Student') {
        menuItems = studentMenuItems;
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div className={styles.overlay} onClick={onClose} />
            )}

            <aside
                className={cn(
                    styles.sidebar,
                    isMobileOpen && styles.mobileOpen,
                    className
                )}
                {...props}
            >
                {/* Mobile Close Button */}
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={24} />
                </button>

                <nav className={styles.nav}>
                    {menuItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(styles.navItem, isActive && styles.active)
                            }
                            onClick={onClose}
                        >
                            <item.icon size={20} className={styles.icon} />
                            <span className={styles.label}>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
}
