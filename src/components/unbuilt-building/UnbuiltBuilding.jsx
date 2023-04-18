import { useContext } from "react";
import { Card } from "react-bootstrap";
import { OverlayTrigger } from "react-bootstrap";
import { Popover } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import IslandContext from "../../contexts/IslandContext";

import style from "./UnbuiltBuilding.module.css";

export default function UnbuiltBuilding({
  building,
  isBuilt,
  isInUpgradeMode,
  upgradeHandler,
  tooltipPosition,
}) {
  const { player, setBuildingToBeBuilt } = useContext(IslandContext);
  const navigate = useNavigate();

  function handleClick() {
    if (!isInUpgradeMode) {
      setBuildingToBeBuilt(building);
      navigate("/island");

      return;
    }

    upgradeHandler();
  }

  function checkHasEnoughMaterials() {
    return (
      player.coins >= building.coinsForBuild &&
      player.woods >= building.woodsForBuild &&
      player.stones >= building.stonesForBuild &&
      player.irons >= building.ironsForBuild
    );
  }

  function buttonText() {
    return !isInUpgradeMode ? "Építés" : "Fejlesztés";
  }

  function upgradeIcon() {
    return isInUpgradeMode ? (
      <i className="bi bi-arrow-up-square-fill text-warning fs-3"></i>
    ) : null;
  }

  return (
    <div
      className={isBuilt ? `${style.building} opacity-50` : `${style.building}`}
    >
      <Card className="border-0 rounded-0 bg-transparent">
        <div className={style.header}>
          <h4 className="text-center text-white">
            {upgradeIcon()} {building.name}
          </h4>
        </div>
        <div className={style.body}>
          <Card.Img variant="top" src={building.spritePath}></Card.Img>
        </div>
        <div className={style.footer}>
          <div className={style.buttonGroup}>
            {!isBuilt ? (
              <>
                <button
                  className={`${style.buildButton} font-btn`}
                  onClick={handleClick}
                  disabled={!checkHasEnoughMaterials()}
                >
                  <span>{buttonText()}</span>
                </button>
                <OverlayTrigger
                  trigger="focus"
                  placement={tooltipPosition}
                  overlay={
                    <Popover id="popover-basic" className="rounded-0">
                      <Popover.Body className="d-flex flex-column bg-transparent">
                        <p className="text-center">{building.description}</p>
                        <div className="d-flex justify-content-center align-items-end text-center">
                          <div className="d-flex flex-column justify-content-center align-items-center">
                            <img
                              src="../images/icons/wood.png"
                              alt="wood"
                              className={
                                building.woodsForBuild > player.woods
                                  ? "opacity-25"
                                  : ""
                              }
                            ></img>
                            <span
                              className={
                                building.woodsForBuild > player.woods
                                  ? "opacity-25"
                                  : ""
                              }
                            >
                              Fa {building.woodsForBuild} db
                            </span>
                          </div>
                          <div className="d-flex flex-column justify-content-center align-items-center">
                            <img
                              src="../images/icons/stone.png"
                              alt="stone"
                              className={
                                building.stonesForBuild > player.stones
                                  ? "opacity-25"
                                  : ""
                              }
                            ></img>
                            <span
                              className={
                                building.stonesForBuild > player.stones
                                  ? "opacity-25"
                                  : ""
                              }
                            >
                              Kő {building.stonesForBuild} db
                            </span>
                          </div>
                          <div className="d-flex flex-column justify-content-center align-items-center">
                            <img
                              src="../images/icons/steel.png"
                              alt="steel"
                              className={
                                building.ironsForBuild > player.irons
                                  ? "opacity-25"
                                  : ""
                              }
                            ></img>
                            <span
                              className={
                                building.ironsForBuild > player.irons
                                  ? "opacity-25"
                                  : ""
                              }
                            >
                              Vas {building.ironsForBuild} db
                            </span>
                          </div>
                          <div className="d-flex flex-column justify-content-center align-items-center">
                            <img
                              src="../images/icons/coin.png"
                              alt="coin"
                              className={
                                building.coinsForBuild > player.coins
                                  ? "opacity-25"
                                  : ""
                              }
                            ></img>
                            <span
                              className={
                                building.coinsForBuild > player.coins
                                  ? "opacity-25"
                                  : ""
                              }
                            >
                              Coin {building.coinsForBuild} db
                            </span>
                          </div>
                        </div>
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <button className={style.questionButton}></button>
                </OverlayTrigger>
              </>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
