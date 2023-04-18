import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { ListGroup, Modal } from "react-bootstrap";
import IslandContext from "../../../contexts/IslandContext";

import "./BuildingModal.css";
import UnbuiltBuilding from "../../unbuilt-building/UnbuiltBuilding";

export default function BuildingModal({ openedBuilding, closeBuildingModal }) {
  const { player, setPlayer, buildings, setBuildings } =
    useContext(IslandContext);

  const [nextLevelBuilding, setNextLevelBuilding] = useState();
  const [isNextLevelAvailable, setIsNextLevelAvailable] = useState(false);

  const upgradeBuilding = () => {
    axios
      .post(
        `${process.env.REACT_APP_API_BASE}/api/Building/UpgradeBuilding?type=${openedBuilding.buildingType}`
      )
      .then((response) => {
        const upgradedBuilding = response.data;

        const buildingsWithoutOpened = buildings.filter(
          (building) => building.id !== openedBuilding.id
        );
        buildingsWithoutOpened.push(upgradedBuilding);

        setBuildings([...buildingsWithoutOpened]);
        setPlayer({
          ...player,
          coins: player.coins - upgradedBuilding.coinsForBuild,
          woods: player.woods - upgradedBuilding.woodsForBuild,
          stones: player.stones - upgradedBuilding.stonesForBuild,
          irons: player.irons - upgradedBuilding.ironsForBuild,
          experience: player.experience + upgradedBuilding.experienceReward,
        });

        closeBuildingModal();
      })
      .catch(() => {
        alert("Nem sikerült kapcsolódni a szerverhez.");
      });
  };

  function notNullProducedItems() {
    const notNullProducedItems = [];

    if (openedBuilding.producedCoins > 0)
      notNullProducedItems.push({
        name: "érmék",
        quantity: openedBuilding.producedCoins,
      });
    if (openedBuilding.producedIrons > 0)
      notNullProducedItems.push({
        name: "vas",
        quantity: openedBuilding.producedIrons,
      });
    if (openedBuilding.producedStones > 0)
      notNullProducedItems.push({
        name: "kő",
        quantity: openedBuilding.producedStones,
      });
    if (openedBuilding.producedWoods > 0)
      notNullProducedItems.push({
        name: "fa",
        quantity: openedBuilding.producedWoods,
      });

    return notNullProducedItems;
  }

  useEffect(() => {
    if (openedBuilding.maxLevel > openedBuilding.level) {
      axios
        .get(
          `${process.env.REACT_APP_API_BASE}/api/Building/GetNextLevelOfBuilding?type=${openedBuilding.buildingType}`
        )
        .then((response) => {
          setNextLevelBuilding(response.data);
          setIsNextLevelAvailable(true);
        })
        .catch(() => {
          alert("Nem sikerült kapcsolódni a szerverhez.");
        });
    }
  }, []);

  return (
    <Modal
      className="building-modal"
      show={true}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header className="border-0">
        <div className="d-flex justify-content-center gap-2 w-100 h-100">
          <h5>
            {openedBuilding.name}{" "}
            <span className="fs-5 text-warning">{openedBuilding.level}</span>
          </h5>
        </div>
        <button className="close" onClick={() => closeBuildingModal()}></button>
      </Modal.Header>
      <Modal.Body className="pt-0">
        <ListGroup>
          {notNullProducedItems(openedBuilding).map((item, index) => (
            <ListGroup.Item
              key={index}
              className="border-0 w-100 text-black d-flex justify-content-between bg-warning mb-3"
            >
              <div>Termelt {item.name}</div>
              <div>
                {item.quantity}db / {openedBuilding.productionInterval / 60000}{" "}
                perc &#40; max {openedBuilding.maximumProductionCount}db &#41;
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
        {isNextLevelAvailable ? (
          <div className="d-flex justify-content-center">
            <UnbuiltBuilding
              building={nextLevelBuilding}
              isBuilt={false}
              isInUpgradeMode={true}
              upgradeHandler={upgradeBuilding}
              tooltipPosition="right"
            />
          </div>
        ) : null}
      </Modal.Body>
    </Modal>
  );
}