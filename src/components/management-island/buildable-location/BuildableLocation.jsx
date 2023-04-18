import style from "./BuildableLocation.module.css";
import { useContext } from "react";
import IslandContext from "../../../contexts/IslandContext";

export default function BuildableLocation({ buildBuilding, xCoordinate, yCoordinate }) {
  const { buildingToBeBuild } = useContext(IslandContext);

  return buildingToBeBuild ? (
    <div
      className={style.buildableLocation}
      onClick={() => buildBuilding(xCoordinate, yCoordinate)}
    >
    </div>
  ) : null;
}