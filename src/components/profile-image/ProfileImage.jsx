import { useContext } from "react";
import { Link } from "react-router-dom";
import IslandContext from "../../contexts/IslandContext";
import { GameHelper } from "../../game-helper/GameHelper";

import style from "./ProfileImage.module.css";

export default function ProfileImage() {
  const { player } = useContext(IslandContext);
  const imagePaths = {
    Europian: "../images/ui/eu_ribbon.png",
    Indian: "../images/ui/indian_ribbon.png",
    Viking: "../images/ui/viking_ribbon.png",
    Japan: "../images/ui/japanese_ribbon.png",
  };
  const level = GameHelper.CalculateLevel(player.experience);

  return (
    <div className={style.profile}>
      <Link to="/myprofile">
        <img
          alt="Saját profil"
          title="Saját profil"
          src={imagePaths[player.selectedIsland]}
        ></img>
      </Link>
      <div className={style.level}>
        <h4>{level}</h4>
      </div>
    </div>
  );
}