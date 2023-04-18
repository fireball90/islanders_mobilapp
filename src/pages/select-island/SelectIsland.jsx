import { useContext, useEffect, useState } from "react";
import Card from "react-bootstrap/Card";

import "./SelectIsland.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import HudContext from "../../contexts/HudContext";
import IslandContext from "../../contexts/IslandContext";

export default function SelectIsland() {
  const { setIsHudDisplayed } = useContext(HudContext);
  const { setPlayer } = useContext(IslandContext);

  const [selectedIsland, setSelectedIsland] = useState(null);
  const [creatingPending, setCreatingPending] = useState(false);

  const navigate = useNavigate();

  function submitHandler(event) {
    event.preventDefault();
    setCreatingPending(true);

    axios
      .post(
        `${process.env.REACT_APP_API_BASE}/api/Player/CreatePlayer?island=${selectedIsland}`
      )
      .then((response) => {
        setPlayer(response.data);
        navigate("/");
      })
      .catch(() => {
        alert("Nem sikerült kapcsolódni a szerverhez");
      })
      .finally(() => {
        setCreatingPending(false);
      });
  }

  function selectIslandHandler(island) {
    setSelectedIsland(island);
  }

  useEffect(() => {
    setIsHudDisplayed(false);
  }, []);

  return (
    <Layout title={"Válassz szigetet"} navigations={[]} close={false}>
      <form
        className="island-select-form"
        onSubmit={(event) => submitHandler(event)}
      >
        <div className="card-container">
          <div className="selectisland-card-bg">
            <Card
              className={selectedIsland === "Europian" ? "bg-warning" : "bg-transparent text-white"}
              onClick={() => selectIslandHandler("Europian")}
            >
              <Card.Img variant="top" src="../assets/europian_island.png" />
              <Card.Body className="text-center select-text-bg">
                <Card.Title>Európai sziget</Card.Title>
                <Card.Text>
                  <p>Alap statok:</p>
                  <p>Erő: 7</p>
                  <p>Ügyesség: 5</p>
                  <p>Intelligencia: 8</p>
                  <p>Alapanyag fontossági sorrend:</p>
                  <p>Kő - Vas - Fa</p>
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
          <div className="selectisland-card-bg">
            <Card
              className={selectedIsland === "Indian" ? "bg-warning" : "bg-transparent text-white"}
              onClick={() => selectIslandHandler("Indian")}
            >
              <Card.Img variant="top" src="../assets/indian-island.png" />
              <Card.Body className="text-center select-text-bg">
                <Card.Title>Indián sziget</Card.Title>
                <Card.Text>
                  <p>Alap statok:</p>
                  <p>Erő: 4</p>
                  <p>Ügyesség: 10</p>
                  <p>Intelligencia: 6</p>
                  <p>Alapanyag fontossági sorrend:</p>
                  <p>Fa - Kő - Vas</p>
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
          <div className="selectisland-card-bg">
            <Card
              className={selectedIsland === "Viking" ? "bg-warning" : "bg-transparent text-white"}
              onClick={() => selectIslandHandler("Viking")}
            >
              <Card.Img variant="top" src="../assets/viking_island.png" />
              <Card.Body className="text-center select-text-bg">
                <Card.Title>Viking sziget</Card.Title>
                <Card.Text>
                  <p>Alap statok:</p>
                  <p>Erő: 9</p>
                  <p>Ügyesség: 6</p>
                  <p>Intelligencia: 5</p>
                  <p>Alapanyag fontossági sorrend:</p>
                  <p>Vas - Fa - Kő</p>
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
          <div className="selectisland-card-bg">
            <Card
              className={selectedIsland === "Japan" ? "bg-warning" : "bg-transparent text-white"}
              onClick={() => selectIslandHandler("Japan")}
            >
              <Card.Img variant="top" src="../assets/japanese_island.png" />
              <Card.Body className="text-center select-text-bg">
                <Card.Title>Japán sziget</Card.Title>
                <Card.Text>
                  <p>Alap statok:</p>
                  <p>Erő: 6</p>
                  <p>Ügyesség: 8</p>
                  <p>Intelligencia: 6</p>
                  <p>Alapanyag fontossági sorrend:</p>
                  <p>Fa - Vas - Kő</p>
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
        </div>
        <div class="save-button-container">
          <button disabled={!selectedIsland || creatingPending} type="submit" className="selectisland-btn font-btn">
            Sziget mentése
          </button>
        </div>
      </form>
    </Layout>
  );
}
