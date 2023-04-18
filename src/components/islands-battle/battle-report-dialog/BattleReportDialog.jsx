import Modal from "react-bootstrap/Modal";
import ListGroup from "react-bootstrap/ListGroup";

import style from "./BattleReportDialog.module.css";

export default function BattleReportDialog({
  battleReports,
  resetBattleReports,
}) {
  return (
    <Modal show={true} size="lg" centered className={style.reportModal}>
      <div className={style.battleContainer}>
        <Modal.Header className="border-0 text-white">
          <div>
            <h4>
              {battleReports.isWinner
              ? "Gratulálunk, győztél!"
              : "Sajnáljuk, vesztettél!"}
            </h4>
          </div>
        </Modal.Header>
        <div className={style.battleReportContainer}>
          <ListGroup className={`rounded-0 text-white ${style.reports}`}>
            {battleReports.rounds.map((round, index) => (
            <ListGroup.Item key={index} className="border-0 bg-transparent">
              <div className="d-flex mb-4">
                <div className="w-25 d-flex align-items-center">
                  <span className="text-white">{round.username}</span>
                </div>
                <div className="w-75">
                  <div className="d-flex justify-content-between w-100">
                    <div>
                      <span className="text-white">{round.message}</span>
                    </div>
                    <div className="text-danger">
                      <span>{round.damage} sebzés</span>
                    </div>
                  </div>
                  <div className="text-warning">
                    <span>Ellenfél fennmaradt életereje: {round.enemyRemainingHealth}</span>
                  </div>
                </div>
              </div>
            </ListGroup.Item>
            ))}
          </ListGroup>
          <div className={`text-white ${style.items}`}>
            <div className="d-flex flex-row justify-content-center gap-3">
              <div className="d-flex align-items-center gap-1">
                <img
                  src="../images/icons/coin.png"
                  alt="Érme"
                  title="Érme"
                ></img>
                <span>{battleReports.coins}</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <img src="../images/icons/wood.png" alt="Fa" title="Fa"></img>
                <span>{battleReports.woods}</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <img src="../images/icons/stone.png" alt="Kő" title="Kő"></img>
                <span>{battleReports.stones}</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <img
                  src="../images/icons/steel.png"
                  alt="Vas"
                  title="Vas"
                ></img>
                <span>{battleReports.irons}</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <img src="../images/icons/xp.png" alt="XP" title="XP"></img>
                <span>{battleReports.experience}</span>
              </div>
            </div>
          </div>
        </div>
        <Modal.Footer className="border-0 d-flex justify-content-center">
          <div>
          <button
                onClick={() => resetBattleReports()}
                className={`font-btn ${style.closeButton}`}
              >
                Bezárás
              </button>
          </div>
        </Modal.Footer>
      </div>
    </Modal>
  );
}