import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import RecordForm from "./RecordForm.jsx";
import SubstanceForm from "./SubstanceForm.jsx";

function Home() {
    return <h1>Home content</h1>;
}

function App() {
    return (
        <Router>
            <Navbar />
            <div className="container mt-3">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/add-substance" element={<SubstanceForm />} />
                    <Route path="/add-record" element={<RecordForm />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
