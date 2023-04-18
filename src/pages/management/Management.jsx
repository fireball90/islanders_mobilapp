import Layout from "../../components/layout/Layout";
import ManagementUnbuiltBuildings from "../../components/management-unbuilt-buildings/ManagementUnbuiltBuildings";
import ManagementAbilities from "../../components/management-abilities/ManagementAbilities";
import { useContext, useEffect } from "react";

import style from "./Management.module.css";
import HudContext from "../../contexts/HudContext";


export default function Management() {
  const { setIsHudDisplayed } = useContext(HudContext);

  useEffect(() => {
    setIsHudDisplayed(true);
  }, []);

  return (
    <Layout title={"Sziget menedzselés"} navigations={[]}>
      <div className={style.container}>
        <div className={style.abilityPoints}>
          <ManagementAbilities />
        </div>
        <div className={style.buildings}>
          <ManagementUnbuiltBuildings />
        </div>
      </div>
    </Layout>
  );
}