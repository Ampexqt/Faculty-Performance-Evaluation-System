import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Auth/LoginPage/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage/RegisterPage';
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage/ForgotPasswordPage';
import { ZonalDashboardPage } from './pages/ZonalAdmin/Dashboard/ZonalDashboardPage';
import { CollegesPage } from './pages/ZonalAdmin/Colleges/CollegesPage';
import { QCEManagementPage } from './pages/ZonalAdmin/QCEManagement/QCEManagementPage';
import { EvaluatorAccountsPage } from './pages/ZonalAdmin/Evaluators/EvaluatorAccountsPage';
import { AcademicYearsPage } from './pages/ZonalAdmin/AcademicYears/AcademicYearsPage';

import { QCEDashboardPage } from './pages/QCEManager/Dashboard/QCEDashboardPage';
import { FacultyPage } from './pages/QCEManager/Faculty/FacultyPage';
import { ProgramsPage } from './pages/QCEManager/Programs/ProgramsPage';
import { EvaluationsPage } from './pages/QCEManager/Evaluations/EvaluationsPage';
import { FacultyEvaluationDetail } from './pages/QCEManager/Evaluations/FacultyEvaluationDetail';
import { EvaluationResultsPage as QCEEvaluationResultsPage } from './pages/QCEManager/Results/EvaluationResultsPage';
import { DeanOverviewPage } from './pages/Dean/Overview/DeanOverviewPage';
import { FacultyAccountsPage as DeanFacultyAccountsPage } from './pages/Dean/FacultyAccounts/FacultyAccountsPage';
import { DeptChairsPage } from './pages/Dean/DeptChairs/DeptChairsPage';
import { DeanEvaluatePage as DeanEvaluationsPage } from './pages/Dean/Evaluations/DeanEvaluatePage';
import { ProgramsPage as DeanProgramsPage } from './pages/Dean/Programs/ProgramsPage';
import { DeptChairDashboardPage } from './pages/DeptChair/Dashboard/DeptChairDashboardPage';
import { FacultyAccountsPage as DeptChairFacultyAccountsPage } from './pages/DeptChair/FacultyAccounts/FacultyAccountsPage';
import { ProgramsPage as DeptChairProgramsPage } from './pages/DeptChair/Programs/ProgramsPage';
import { SubjectsPage as DeptChairSubjectsPage } from './pages/DeptChair/Subjects/SubjectsPage';
import { SchedulesPage as DeptChairSchedulesPage } from './pages/DeptChair/Schedules/SchedulesPage';
import { EvaluationsPage as DeptChairEvaluationsPage } from './pages/DeptChair/Evaluations/EvaluationsPage';
import { FacultyOverviewPage } from './pages/Faculty/Overview/FacultyOverviewPage';
import { MySubjectsPage } from './pages/Faculty/MySubjects/MySubjectsPage';
import { EvaluationResultsPage as FacultyEvaluationResultsPage } from './pages/Faculty/EvaluationResults/EvaluationResultsPage';
import { StudentOverviewPage } from './pages/Student/Overview/StudentOverviewPage';
import { StudentEvaluationsPage } from './pages/Student/Evaluations/StudentEvaluationsPage';
import { EvaluationFormPage } from './pages/Student/EvaluationForm/EvaluationFormPage';
import { PresidentDashboardPage } from './pages/President/Dashboard/PresidentDashboardPage';
import { PresidentEvaluationFormPage } from './pages/President/EvaluationForm/PresidentEvaluationFormPage';
import { VPAADashboardPage } from './pages/VPAA/Dashboard/VPAADashboardPage';
import { VPAAEvaluationFormPage } from './pages/VPAA/EvaluationForm/VPAAEvaluationFormPage';
import './styles/globals.css';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes */}

          {/* Zonal Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Zonal Admin']} />}>
            <Route path="/zonal/dashboard" element={<ZonalDashboardPage />} />
            <Route path="/zonal/colleges" element={<CollegesPage />} />
            <Route path="/zonal/qce-management" element={<QCEManagementPage />} />
            <Route path="/zonal/academic-years" element={<AcademicYearsPage />} />
            <Route path="/zonal/evaluator-accounts" element={<EvaluatorAccountsPage />} />
          </Route>

          {/* QCE Manager Routes */}
          <Route element={<ProtectedRoute allowedRoles={['QCE Manager']} />}>
            <Route path="/qce/dashboard" element={<QCEDashboardPage />} />
            <Route path="/qce/faculty" element={<FacultyPage />} />
            <Route path="/qce/programs" element={<ProgramsPage />} />
            <Route path="/qce/evaluations" element={<EvaluationsPage />} />
            <Route path="/qce/evaluations/:facultyId" element={<FacultyEvaluationDetail />} />
            <Route path="/qce/results" element={<QCEEvaluationResultsPage />} />
          </Route>

          {/* Dean Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Dean']} />}>
            <Route path="/dean/overview" element={<DeanOverviewPage />} />
            <Route path="/dean/faculty-accounts" element={<DeanFacultyAccountsPage />} />
            <Route path="/dean/dept-chairs" element={<DeptChairsPage />} />
            <Route path="/dean/programs" element={<DeanProgramsPage />} />
            <Route path="/dean/evaluations" element={<DeanEvaluationsPage />} />
            <Route path="/dean/evaluation-form" element={<EvaluationFormPage />} />
          </Route>

          {/* Department Chair Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Department Chair']} />}>
            <Route path="/dept-chair/faculty" element={<DeptChairDashboardPage />} />
            <Route path="/dept-chair/faculty-accounts" element={<DeptChairFacultyAccountsPage />} />
            <Route path="/dept-chair/programs" element={<DeptChairProgramsPage />} />
            <Route path="/dept-chair/subjects" element={<DeptChairSubjectsPage />} />
            <Route path="/dept-chair/schedules" element={<DeptChairSchedulesPage />} />
            <Route path="/dept-chair/evaluations" element={<DeptChairEvaluationsPage />} />
            <Route path="/dept-chair/evaluation-form" element={<EvaluationFormPage />} />
          </Route>

          {/* Faculty Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Faculty']} />}>
            <Route path="/faculty/overview" element={<FacultyOverviewPage />} />
            <Route path="/faculty/subjects" element={<MySubjectsPage />} />
            <Route path="/faculty/results" element={<FacultyEvaluationResultsPage />} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
            <Route path="/student/dashboard" element={<StudentOverviewPage />} />
            <Route path="/student/evaluations" element={<StudentEvaluationsPage />} />
            <Route path="/student/evaluation-form" element={<EvaluationFormPage />} />
          </Route>

          {/* President Routes */}
          <Route element={<ProtectedRoute allowedRoles={['President']} />}>
            <Route path="/president/dashboard" element={<PresidentDashboardPage />} />
            <Route path="/president/evaluate" element={<PresidentEvaluationFormPage />} />
          </Route>

          {/* VPAA Routes */}
          <Route element={<ProtectedRoute allowedRoles={['VPAA']} />}>
            <Route path="/vpaa/dashboard" element={<VPAADashboardPage />} />
            <Route path="/vpaa/evaluate" element={<VPAAEvaluationFormPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
