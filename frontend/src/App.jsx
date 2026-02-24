import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import AddRecord from "./pages/AddRecord.jsx";
import AddSubstance from "./pages/AddSubstance.jsx";
import Home from "./pages/Home.jsx";
import Substances from "./pages/Substances.jsx";
import Records from "./pages/Records.jsx";
import EditSubstance from "./pages/EditSubstance.jsx";
import Departments from "./pages/Departments.jsx";
import Inventory from "./pages/Inventory.jsx";
import EditRecord from "./pages/EditRecord.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import Login from "./pages/Login.jsx";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<RequireAuth />}>
                    <Route element={<Navbar />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/substances" element={<Substances />} />
                        <Route path="/records" element={<Records />} />
                        <Route path="/records/:departmentName" element={<Records />} />
                        <Route path="/departments" element={<Departments />} />
                        <Route path="/inventory/:departmentName" element={<Inventory />} />
                        <Route path="/add-record" element={<AddRecord />} />
                        <Route path="/edit-record/:recordId" element={<EditRecord />} />
                        <Route path="/add-substance" element={<AddSubstance />} />
                        <Route path="/edit-substance/:substanceId" element={<EditSubstance />} />
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
