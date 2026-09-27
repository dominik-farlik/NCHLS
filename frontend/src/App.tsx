import {createBrowserRouter, RouterProvider} from "react-router-dom";
import AddSubstance from "./pages/AddSubstance.tsx";
import Substances from "./pages/Substances.tsx";
import EditSubstance from "./pages/EditSubstance.tsx";
import Departments from "./pages/Departments.tsx";
import Department from "./pages/Department.tsx";
import RequireAuth from "./components/RequireAuth.jsx";
import Login from "./pages/Login.jsx";
import {Toaster} from "react-hot-toast";


const router = createBrowserRouter(
    [
        {path: "/", element: <Substances/>},
        {path: "/login", element: <Login/>},
        {element: <RequireAuth/>, children: [
                {path: "/substances", element: <Substances/>},
                {path: "/add-substance", element: <AddSubstance/>},
                {path: "/edit-substance/:substanceId", element: <EditSubstance/>},
                {path: "/departments", element: <Departments/>},
                {path: "/department/:departmentId", element: <Department/>},
        ]},
    ]
);

function App() {
    return (
        <>
            <RouterProvider router={router}/>
            <Toaster position="top-center"/>
        </>
    );
}

export default App;
