import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Empresas from "./pages/Empresas";
import ProtectedRoute from "./components/ProtectedRoute";
import Cargos from "./pages/Cargos";
import Trabajadores from "./pages/Trabajadores";
import Asignaciones from "./pages/Asignaciones";
import Asistencia from "./pages/Asistencia";
import Sucursales from "./pages/Sucursales";
import Usuarios from "./pages/Usuarios";
import Postulantes from "./pages/Postulantes";
import Mailing from "./pages/Mailing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/empresas"
          element={
            <ProtectedRoute>
              <Empresas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cargos"
          element={
            <ProtectedRoute>
              <Cargos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trabajadores"
          element={
            <ProtectedRoute>
              <Trabajadores />
            </ProtectedRoute>
          }
        />

        <Route
          path="/asignaciones"
          element={
            <ProtectedRoute>
              <Asignaciones />
            </ProtectedRoute>
          }
        />

        <Route
          path="/asistencia"
          element={
            <ProtectedRoute>
              <Asistencia />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sucursales"
          element={
            <ProtectedRoute>
              <Sucursales />
            </ProtectedRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <Usuarios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/postulantes"
          element={
            <ProtectedRoute>
              <Postulantes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mailing"
          element={
            <ProtectedRoute>
              <Mailing />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;