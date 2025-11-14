import { useEffect, useState } from "react";

function Alert({ message, type = "danger", onClose }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!message) return;

        setVisible(true);

        const hideTimer = setTimeout(() => {
            setVisible(false);
        }, 2500);

        const removeTimer = setTimeout(() => {
            onClose?.();
        }, 3000);

        return () => {
            clearTimeout(hideTimer);
            clearTimeout(removeTimer);
        };
    }, [message, onClose]);

    if (!message) return null;

    return (
        <div
            role="alert"
            className={`alert alert-${type} fade ${visible ? "show" : ""}`}
        >
            {message}
        </div>
    );
}

export default Alert;
