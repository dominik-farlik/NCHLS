import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";
import AddSubstance from "./pages/AddSubstance.tsx";
import Substances from "./pages/Substances.tsx";
import EditSubstance from "./pages/EditSubstance.tsx";
import Departments from "./pages/Departments.tsx";
import Department from "./pages/Department.tsx";
import {Toaster} from "react-hot-toast";
import AuthProvider from "./context/AuthProvider.tsx";
import ProtectedRoute from "./auth/ProtectedRoute.tsx";
import Login from "./auth/Login.tsx";
import Register from "./auth/Register.tsx";
import ResetPasswordRequest from "./auth/ResetPasswordRequest.tsx";
import ResetPassword from "./auth/ResetPassword.tsx";
import {Role} from "./schemas/Role.ts";
import Home from "./pages/Home.tsx";

function RootLayout() {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}

const router = createBrowserRouter([
    {
        element: <RootLayout/>,
        children: [
            {path: "/login", element: <Login/>},
            {path: "/register", element: <Register/>},
            {path: "/request-password-reset", element: <ResetPasswordRequest/>},
            {path: "/obnovit-heslo", element: <ResetPassword/>},
            {
                element: <ProtectedRoute/>,
                children: [
                    {path: "/", element: <Home/>}
                ]
            },
            {
                element: <ProtectedRoute allowedRoles={[Role.Editor, Role.Manager]}/>,
                children: [
                    {path: "/substances", element: <Substances/>},
                    {path: "/add-substance", element: <AddSubstance/>},
                    {path: "/edit-substance/:substanceId", element: <EditSubstance/>},
                    {path: "/departments", element: <Departments/>},
                    {path: "/department/:departmentId", element: <Department/>},
                ]
            },
        ]
    }
]);

function App() {
    return (
        <>
            <RouterProvider router={router}/>
            <Toaster position="top-center"/>
        </>
    );
}

export default App;
