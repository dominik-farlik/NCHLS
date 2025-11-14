function THead({ children }) {
    return (
        <thead
            className="pink-thead"
            style={{
                position: "sticky",
                top: 0,
                zIndex: 2,
            }}
        >
            <tr style={{ position: "sticky", top: "0" }}>
                {children}
            </tr>
        </thead>
    );
}

export default THead;