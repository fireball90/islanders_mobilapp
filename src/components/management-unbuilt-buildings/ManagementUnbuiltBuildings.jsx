import { useContext, useEffect } from "react";
import IslandContext from "../../contexts/IslandContext";
import UnbuiltBuilding from "../unbuilt-building/UnbuiltBuilding";

export default function ManagementUnbuiltBuildings() {
  const {
    isIslandInitialized,
    buildings,
    unbuiltBuildings,
    initializeIslandFromHttp,
  } = useContext(IslandContext);

  function checkIsBuilt(buildingType) {
    return (
      buildings.filter((building) => building.buildingType === buildingType)
        .length > 0
    );
  }

  function compare(a, b) {
    if (checkIsBuilt(a.buildingType)) {
      return 1;
    }

    if (checkIsBuilt(b.buildingType)) {
      return -1;
    }

    return 0;
  }

  useEffect(() => {
    if (!isIslandInitialized) {
      initializeIslandFromHttp();
    }
  }, []);

  return (
    <div className="w-100 h-100 d-flex flex-wrap gap-3 align-content-start">
      {unbuiltBuildings.sort(compare).map((building, index) => (
        <UnbuiltBuilding
          key={index}
          isBuilt={checkIsBuilt(building.buildingType)}
          building={building}
          tooltipPosition="left"
        />
      ))}
    </div>
  );
}