import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Auth/LoginPage/LoginPage';
import { ZonalDashboardPage } from './pages/ZonalAdmin/Dashboard/ZonalDashboardPage';
import { CollegesPage } from './pages/ZonalAdmin/Colleges/CollegesPage';
import { QCEManagementPage } from './pages/ZonalAdmin/QCEManagement/QCEManagementPage';
import { AcademicYearsPage } from './pages/ZonalAdmin/AcademicYears/AcademicYearsPage';
import { QCEDashboardPage } from './pages/QCEManager/Dashboard/QCEDashboardPage';
import { FacultyPage } from './pages/QCEManager/Faculty/FacultyPage';
import { ProgramsPage } from './pages/QCEManager/Programs/ProgramsPage';
import { EvaluationsPage } from './pages/QCEManager/Evaluations/EvaluationsPage';
import { DeptChairDashboardPage } from './pages/DeptChair/Dashboard/DeptChairDashboardPage';
import { FacultyDashboardPage } from './pages/Faculty/Dashboard/FacultyDashboardPage';
import { StudentDashboardPage } from './pages/Student/Dashboard/StudentDashboardPage';
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
        <Route path="/qce/faculty" element={<FacultyPage />} />
        <Route path="/qce/programs" element={<ProgramsPage />} />
        <Route path="/qce/evaluations" element={<EvaluationsPage />} />

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
