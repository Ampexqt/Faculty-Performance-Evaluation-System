import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Auth/LoginPage/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage/RegisterPage';
import { ZonalDashboardPage } from './pages/ZonalAdmin/Dashboard/ZonalDashboardPage';
import { CollegesPage } from './pages/ZonalAdmin/Colleges/CollegesPage';
import { QCEManagementPage } from './pages/ZonalAdmin/QCEManagement/QCEManagementPage';
import { AcademicYearsPage } from './pages/ZonalAdmin/AcademicYears/AcademicYearsPage';
import { QCEDashboardPage } from './pages/QCEManager/Dashboard/QCEDashboardPage';
import { FacultyPage } from './pages/QCEManager/Faculty/FacultyPage';
import { ProgramsPage } from './pages/QCEManager/Programs/ProgramsPage';
import { EvaluationsPage } from './pages/QCEManager/Evaluations/EvaluationsPage';
import { DeanOverviewPage } from './pages/Dean/Overview/DeanOverviewPage';
import { FacultyResultsPage } from './pages/Dean/FacultyResults/FacultyResultsPage';
import { DeptChairsPage } from './pages/Dean/DeptChairs/DeptChairsPage';
import { EvaluationsPage as DeanEvaluationsPage } from './pages/Dean/Evaluations/EvaluationsPage';
import { DeptChairDashboardPage } from './pages/DeptChair/Dashboard/DeptChairDashboardPage';
import { FacultyAccountsPage } from './pages/DeptChair/FacultyAccounts/FacultyAccountsPage';
import { ProgramsPage as DeptChairProgramsPage } from './pages/DeptChair/Programs/ProgramsPage';
import { SubjectsPage as DeptChairSubjectsPage } from './pages/DeptChair/Subjects/SubjectsPage';
import { SchedulesPage as DeptChairSchedulesPage } from './pages/DeptChair/Schedules/SchedulesPage';
import { EvaluationsPage as DeptChairEvaluationsPage } from './pages/DeptChair/Evaluations/EvaluationsPage';
import { FacultyOverviewPage } from './pages/Faculty/Overview/FacultyOverviewPage';
import { MySubjectsPage } from './pages/Faculty/MySubjects/MySubjectsPage';
import { EvaluationResultsPage } from './pages/Faculty/EvaluationResults/EvaluationResultsPage';
import { StudentOverviewPage } from './pages/Student/Overview/StudentOverviewPage';
import { StudentEvaluationsPage } from './pages/Student/Evaluations/StudentEvaluationsPage';
import './styles/globals.css';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

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

        {/* Dean Routes */}
        <Route path="/dean/overview" element={<DeanOverviewPage />} />
        <Route path="/dean/faculty-results" element={<FacultyResultsPage />} />
        <Route path="/dean/dept-chairs" element={<DeptChairsPage />} />
        <Route path="/dean/evaluations" element={<DeanEvaluationsPage />} />

        {/* Department Chair Routes */}
        <Route path="/dept-chair/faculty" element={<DeptChairDashboardPage />} />
        <Route path="/dept-chair/faculty-accounts" element={<FacultyAccountsPage />} />
        <Route path="/dept-chair/programs" element={<DeptChairProgramsPage />} />
        <Route path="/dept-chair/subjects" element={<DeptChairSubjectsPage />} />
        <Route path="/dept-chair/schedules" element={<DeptChairSchedulesPage />} />
        <Route path="/dept-chair/evaluations" element={<DeptChairEvaluationsPage />} />

        {/* Faculty Routes */}
        <Route path="/faculty/overview" element={<FacultyOverviewPage />} />
        <Route path="/faculty/subjects" element={<MySubjectsPage />} />
        <Route path="/faculty/results" element={<EvaluationResultsPage />} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<StudentOverviewPage />} />
        <Route path="/student/evaluations" element={<StudentEvaluationsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
