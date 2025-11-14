function Modal({ children, handleDelete }) {
    return (
        <div className="modal fade" id="deleteModal" tabIndex="-1" aria-labelledby="deleteModalLabel"
             aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="deleteModalLabel">Odstranit látku</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {children}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Zavřít</button>
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={handleDelete}>Ano</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;