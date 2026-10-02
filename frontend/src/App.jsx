import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import HRDashboard from "./pages/HRDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/hr-dashboard"
                    element={
                        <ProtectedRoute allowedRole="hr">
                            <HRDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employee-dashboard"
                    element={
                        <ProtectedRoute allowedRole="employee">
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;