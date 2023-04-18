import GameFieldContext from "../../../contexts/GameFieldContext";
import { useEffect, useContext } from "react";

import './Tile.css'

export default function Tile({ xCoordinate, yCoordinate, scale, children }) {
  const { zoom, tileSize } = useContext(GameFieldContext);

useEffect(() => {

}, [zoom])

  return (
    <div
      className="tile"
      style={{
        width: tileSize * scale,
        height: tileSize * scale,
        top: yCoordinate * tileSize * scale,
        left: xCoordinate * tileSize * scale,
      }}
    >
      {children}
    </div>
  );
}
