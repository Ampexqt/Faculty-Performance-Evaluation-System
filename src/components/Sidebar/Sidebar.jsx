import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Users,
    Calendar,
    BookOpen,
    Settings,
    ClipboardList,
    Briefcase
} from 'lucide-react';
import { cn } from '@/utils/cn';
import styles from './Sidebar.module.css';

const zonalAdminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/zonal/dashboard' },
    { icon: Building2, label: 'Colleges', path: '/zonal/colleges' },
    { icon: Users, label: 'QCE Management', path: '/zonal/qce-management' },
    { icon: Calendar, label: 'Academic Years', path: '/zonal/academic-years' },
    { icon: Settings, label: 'System Settings', path: '/zonal/settings' },
];

const qceMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/qce/dashboard' },
    { icon: Users, label: 'Faculty', path: '/qce/faculty' },
    { icon: BookOpen, label: 'Programs', path: '/qce/programs' },
    { icon: Calendar, label: 'Evaluations', path: '/qce/evaluations' },
];

const deanMenuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dean/overview' },
    { icon: ClipboardList, label: 'Faculty Results', path: '/dean/faculty-results' },
    { icon: Briefcase, label: 'Dept. Chairs', path: '/dean/dept-chairs' },
];

const deptChairMenuItems = [
    { icon: Users, label: 'Faculty', path: '/dept-chair/faculty' },
    { icon: BookOpen, label: 'Subjects', path: '/dept-chair/subjects' },
    { icon: Calendar, label: 'Schedules', path: '/dept-chair/schedules' },
];

const facultyMenuItems = [
    { icon: BookOpen, label: 'My Subjects', path: '/faculty/subjects' },
    { icon: Calendar, label: 'Evaluation Results', path: '/faculty/results' },
];

const studentMenuItems = [
    { icon: BookOpen, label: 'My Evaluations', path: '/student/evaluations' },
];

export function Sidebar({
    role = 'Zonal Admin',
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
        <aside className={cn(styles.sidebar, className)} {...props}>
            <nav className={styles.nav}>
                {menuItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(styles.navItem, isActive && styles.active)
                        }
                    >
                        <item.icon size={20} className={styles.icon} />
                        <span className={styles.label}>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
