import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { ZonalDashboardPage } from './pages/ZonalDashboardPage/ZonalDashboardPage';
import { CollegesPage } from './pages/CollegesPage/CollegesPage';
import { QCEManagementPage } from './pages/QCEManagementPage/QCEManagementPage';
import { AcademicYearsPage } from './pages/AcademicYearsPage/AcademicYearsPage';
import { QCEDashboardPage } from './pages/QCEDashboardPage/QCEDashboardPage';
import { DeptChairDashboardPage } from './pages/DeptChairDashboardPage/DeptChairDashboardPage';
import { FacultyDashboardPage } from './pages/FacultyDashboardPage/FacultyDashboardPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage/StudentDashboardPage';
import './styles/globals.css';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Zonal Admin Routes */}
        <Route path="/zonal/dashboard" element={<ZonalDashboardPage />} />
        <Route path="/zonal/colleges" element={<CollegesPage />} />
        <Route path="/zonal/qce-management" element={<QCEManagementPage />} />
        <Route path="/zonal/academic-years" element={<AcademicYearsPage />} />

        {/* QCE Manager Routes */}
        <Route path="/qce/dashboard" element={<QCEDashboardPage />} />

        {/* Department Chair Routes */}
        <Route path="/dept-chair/faculty" element={<DeptChairDashboardPage />} />

        {/* Faculty Routes */}
        <Route path="/faculty/subjects" element={<FacultyDashboardPage />} />

        {/* Student Routes */}
        <Route path="/student/evaluations" element={<StudentDashboardPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
