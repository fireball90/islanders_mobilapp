import "../base-modal/BaseModal.css";

export default function BaseModal({ title, children, onHide }) {

    return (
        <div>
            <div className="d-flex justify-content-center  align-items-center">
                <div className="base-modal-container modal-animation">
                    <div className="base-modal-popup">
                        <button className="close-button" onClick={() => onHide()}></button>
                        <div className="base-modal-header">
                            <div className="base-modal-title">
                                <h3 className="text-white">{title}</h3>
                            </div>
                        </div>
                        <div className="base-modal-body mb-3">
                            {children}
                        </div>
                    </div>
                </div>
            </div>  
        </div>
      );
}

