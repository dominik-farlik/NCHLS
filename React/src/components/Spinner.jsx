import React from "react";

function Spinner() {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center p-4">
            <div className="spinner-border text-secondary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
}

export default Spinner;