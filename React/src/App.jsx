import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import RecordForm from "./RecordForm.jsx";
import SubstanceForm from "./SubstanceForm.jsx";
import Home from "./Home.jsx";
import SubstancePage from "./SubstancePage.jsx";



function App() {
    return (
        <Router>
            <Navbar />
            <div className="container mt-3">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/add-substance" element={<SubstanceForm />} />
                    <Route path="/add-record" element={<RecordForm />} />
                    <Route path="/substances" element={<SubstancePage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
