import React, {useState} from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function ImageUploadPreview() {
    const [preview, setPreview] = useState(null);
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    };
    return (
        <div>
            <label className="form-label fw-bold">Obrázek</label>
            <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}/>
            {preview && (<div className="mt-3">
                <img
                    src={preview}
                    alt="Náhled"
                    className="img-thumbnail text-end"
                    style={{maxHeight: "300px"}}/>
            </div>)}
        </div>
    );
}

export default ImageUploadPreview;