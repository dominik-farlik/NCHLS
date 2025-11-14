import React from "react";

function Table({ children }) {
    return (
        <div className="table-responsive border-top border-2 border-light" style={{ maxHeight: "79vh", overflowY: "auto" }}>
            <table className="table table-hover align-middle table-bordered" style={{ position: "relative" }}>
                {children}
            </table>
        </div>
    );
}

export default Table;