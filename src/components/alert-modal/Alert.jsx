import "../alert-modal/Alert.css";
import { Link } from "react-router-dom";

export default function AlertModal({ title, close, children }) {

    return (
        <div>
            <div>
                <div className="alert-modal-container modal-animation">
                    <div className="alert-modal-popup">
                        <div className="alert-modal-header">
                            <div className="alert-modal-title">
                                <h3 className="text-white">{title}</h3>
                            </div>
                        </div>
                        <div className="alert-modal-body">
                            {children}
                        </div>
                        <div className="d-flex justify-content-center align-items-center">
                                {close !== false ? (
                                    <Link to="/island">
                                        <button className="alert-modal-close font-btn">OK</button>
                                    </Link>
                                ) : null}
                        </div>
                    </div>
                </div>
            </div>  
        </div>
      );
}

