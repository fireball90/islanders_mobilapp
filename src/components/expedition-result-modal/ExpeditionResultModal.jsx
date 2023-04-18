import { Modal } from "react-bootstrap";
import './ExpeditionResultModal.css'

export default function ExpeditionResultModal({ expeditionResult, onHide }) {
  return (
    <Modal
      show={true}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter modal-animation"
      centered
    >
      <div className="modal-exp-container">
        <Modal.Body>
          <div>
            <div className="text-center">
              <h4>{expeditionResult.title}</h4>
            </div>
            <div className="exp-message-container text-white">
              <p>{expeditionResult.message}</p>
              <p className="text-center">
                <span>
                  <img
                    src="../images/icons/coin.png"
                    alt="Érme"
                    title="Érme"
                  ></img>{" "}
                  {expeditionResult.coins} -{" "}
                </span>
                <span>
                  <img src="../images/icons/wood.png" alt="Fa" title="Fa"></img>{" "}
                  {expeditionResult.woods} -{" "}
                </span>
                <span>
                  <img
                    src="../images/icons/stone.png"
                    alt="Kő"
                    title="Kő"
                  ></img>{" "}
                  {expeditionResult.stones} -{" "}
                </span>
                <span>
                  <img
                    src="../images/icons/steel.png"
                    alt="Vas"
                    title="Vas"
                  ></img>{" "}
                  {expeditionResult.irons} -{" "}
                </span>
                <span>
                  <img src="../images/icons/xp.png" alt="XP" title="XP"></img>{" "}
                  {expeditionResult.experience}{" "}
                </span>
              </p>
            </div>
            <div className="d-flex justify-content-center">
              <button
                onClick={() => onHide()}
                className="modal-exp-btn font-btn"
              >
                Bezárás
              </button>
            </div>
          </div>
        </Modal.Body>
      </div>
    </Modal>
  );
}