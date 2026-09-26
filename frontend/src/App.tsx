import {createBrowserRouter, RouterProvider} from "react-router-dom";
import AddRecord from "./pages/AddRecord.jsx";
import AddSubstance from "./pages/AddSubstance.tsx";
import Substances from "./pages/Substances.tsx";
import Records from "./pages/Records.jsx";
import EditSubstance from "./pages/EditSubstance.tsx";
import Departments from "./pages/Departments.tsx";
import Department from "./pages/Department.tsx";
import EditRecord from "./pages/EditRecord.jsx";
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
                {path: "/records", element: <Records/>},
                {path: "/records/:departmentName", element: <Records/>},
                {path: "/departments", element: <Departments/>},
                {path: "/department/:departmentId", element: <Department/>},
                {path: "/add-record", element: <AddRecord/>},
                {path: "/edit-record/:recordId", element: <EditRecord/>},

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
