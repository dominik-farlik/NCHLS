import {Link} from "react-router-dom";
import React from "react";

function AddButton({ endpoint}) {
    return (
        <Link
            to={endpoint}
            className="btn btn-block bg-pink"
        >
            Přidat
        </Link>
    );
}

export default AddButton;