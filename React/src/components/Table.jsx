import React from "react";

function Table({ children }) {
    return (
        <div className="table-responsive" style={{flex: "1", overflowY: "auto" }}>
            <table className="table table-hover align-middle table-bordered" style={{ position: "relative" }}>
                {children}
            </table>
        </div>
    );
}

export default Table;