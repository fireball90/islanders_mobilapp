import React from "react";
import Modal from "react-bootstrap/Modal";

import "./BattleConfirmDialog.css";

export default function BattleConfirmDialog({ close, attack }) {
  return (
    <>
    <Modal show={true} centered>
      <Modal.Header className="border-0">
        <Modal.Title className="text-white"><span>Csata megerősítése</span></Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-white"><span>Biztosan megtámadja a kiválasztott szigetet?</span></Modal.Body>
      <Modal.Footer className="border-0">
        <button className="battle-confirm-button font-btn text-white" onClick={() => close()}>Mégse</button>
        <button className="battle-confirm-button font-btn text-white" onClick={() => attack()}>Támad</button>
      </Modal.Footer>
    </Modal>
    </>
  );
}