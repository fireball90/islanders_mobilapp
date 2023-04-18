import React, { useContext, useEffect } from "react";
import "../expedition/expedition.css";
import Layout from "../../components/layout/Layout";
import HudContext from "../../contexts/HudContext";
import ExpeditionInterface from "../../components/expedition-interface/ExpeditionInterface";

export default function Expedition() {  
  const { setIsHudDisplayed } = useContext(HudContext);

  useEffect(() => {
    setIsHudDisplayed(true);
  }, []);

  return (
    <Layout navigations={[]} title="Expedíció">
      <ExpeditionInterface />
    </Layout>
  );
}