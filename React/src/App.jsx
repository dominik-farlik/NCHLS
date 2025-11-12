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


function App() {
    return (
        <Router>
            <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/add-substance" element={<AddSubstance />} />
                    <Route path="/edit-substance/:substance_id" element={<EditSubstance />} />
                    <Route path="/add-record" element={<AddRecord />} />
                    <Route path="/substances" element={<Substances />} />
                    <Route path="/records" element={<Records />} />
                    <Route path="/records/:departmentName" element={<Records />} />
                    <Route path="/departments" element={<Departments />} />
                    <Route path="/inventory/:departmentName" element={<Inventory />} />
                </Routes>
        </Router>
    );
}

export default App;
