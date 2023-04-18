import React, { useContext, useEffect } from "react";
import IslandsBattle from "../../components/islands-battle/IslandsBattle";
import HudContext from "../../contexts/HudContext";

export default function Battle() {
  const { setIsHudDisplayed } = useContext(HudContext);

  useEffect(() => {
    setIsHudDisplayed(true);
  }, []);

  return (
    <IslandsBattle />
  )
}