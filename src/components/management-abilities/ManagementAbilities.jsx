import style from "./ManagementAbilities.module.css";
import { OverlayTrigger } from "react-bootstrap";
import { Popover } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import { GameHelper } from "../../game-helper/GameHelper";
import { forkJoin, from } from "rxjs";
import axios from "axios";
import IslandContext from "../../contexts/IslandContext";

export default function ManagementAbilities() {
  const { player, setPlayer } = useContext(IslandContext);

  const [addedStrength, setAddedStrength] = useState(0);
  const [addedIntelligence, setAddedIntelligence] = useState(0);
  const [addedAgility, setAddedAgility] = useState(0);

  const [maximumSkills, setMaximumSkills] = useState({
    strength: 0,
    intelligence: 0,
    agility: 0,
  });
  const [defaultSkills, setDefaultSkills] = useState({
    strength: 0,
    intelligence: 0,
    agility: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  function handleClickStrength() {
    if (
      calculateUnusedAbilityPoints() > 0 &&
      maximumSkills.strength > addedStrength + player.strength
    ) {
      setAddedStrength(addedStrength + 1);
    }
  }

  function handleClickIntelligence() {
    if (
      calculateUnusedAbilityPoints() > 0 &&
      maximumSkills.intelligence > addedIntelligence + player.intelligence
    ) {
      setAddedIntelligence(addedIntelligence + 1);
    }
  }

  function handleClickAgility() {
    if (
      calculateUnusedAbilityPoints() > 0 &&
      maximumSkills.agility > addedAgility + player.agility
    ) {
      setAddedAgility(addedAgility + 1);
    }
  }

  function checkUnsavedPoints() {
    return addedStrength + addedAgility + addedIntelligence > 0;
  }

  function handleCancel() {
    setAddedStrength(0);
    setAddedIntelligence(0);
    setAddedAgility(0);
  }

  function handleSave() {
    axios
      .put(`${process.env.REACT_APP_API_BASE}/api/Player/UpdateSkillPoints`, {
        strength: addedStrength,
        intelligence: addedIntelligence,
        agility: addedAgility,
      })
      .then(() => {
        setPlayer({
          ...player,
          strength: player.strength + addedStrength,
          intelligence: player.intelligence + addedIntelligence,
          agility: player.agility + addedAgility,
        });

        setAddedStrength(0);
        setAddedIntelligence(0);
        setAddedAgility(0);
      })
      .catch(() => {
        alert("Nem sikerült kapcsolódni a szerverhez!");
      });
  }

  function calculateUnusedAbilityPoints() {
    const currentLevel = GameHelper.CalculateLevel(player.experience);
    const allAbilityPoints =
      defaultSkills.strength +
      defaultSkills.intelligence +
      defaultSkills.agility +
      currentLevel * 3;

    return (
      allAbilityPoints -
      player.strength -
      player.intelligence -
      player.agility -
      addedStrength -
      addedIntelligence -
      addedAgility
    );
  }

  function requestDefaultAndMaximumSkills() {
    const urls = [
      `${process.env.REACT_APP_API_BASE}/api/Island/GetDefaultSkills`,
      `${process.env.REACT_APP_API_BASE}/api/Island/GetMaximumSkillPoints`,
    ];
    const request$ = urls.map((url) => from(axios.get(url)));

    forkJoin(request$).subscribe({
      next: (responses) => {
        const defaultSkills = responses[0].data;
        const maximumSkills = responses[1].data;

        setDefaultSkills(defaultSkills);
        setMaximumSkills(maximumSkills);
        setIsLoaded(true);
      },
      error: () => alert("Nem sikerült kapcsolódni a szerverhez!"),
    });
  }

  useEffect(() => {
    requestDefaultAndMaximumSkills();
  }, []);

  return isLoaded ? (
    <div>
      <div className="text-center">
        <h5 className="text-white">Elérhető képességpontok</h5>
        <span className="fs-2 text-warning">
          {calculateUnusedAbilityPoints()}
        </span>
      </div>
      <div className="d-flex flex-row justify-content-center gap-3">
        <div className="d-flex flex-column text-center text-white p-2 stat-container">
          <span>Erő</span>
          <span className="fs-5 text-warning">
            {addedStrength + player.strength}
          </span>
          <div>
            <button className={style.btnBg} onClick={handleClickStrength}>
              <img
                alt="Plusz"
                title="Plusz"
                src={
                  calculateUnusedAbilityPoints() === 0
                    ? "../images/ui/plusz_btn_inactive.png"
                    : "../images/ui/plusz_btn_active.png"
                }
              ></img>
            </button>
            <OverlayTrigger
              trigger="focus"
              placement="bottom"
              overlay={
                <Popover id="popover-basic" className="rounded-0">
                  <Popover.Header as="h3" className="bg-body"></Popover.Header>
                  <Popover.Body className="d-flex flex-column bg-transparent text-center">
                    <span>Növeli a bevitt sebzés mértékét.</span>
                  </Popover.Body>
                </Popover>
              }
            >
              <button className={style.btnBg}>
                <img
                  alt="Leírás"
                  title="Leírás"
                  src="../images/ui/kerdojel_btn.png"
                ></img>
              </button>
            </OverlayTrigger>
          </div>
        </div>
        <div className="d-flex flex-column text-center text-white p-2 stat-container">
          <span>Ügyesség</span>
          <span className="fs-5 text-warning">
            {addedAgility + player.agility}
          </span>
          <div>
            <button className={style.btnBg} onClick={handleClickAgility}>
              <img
                alt="Plusz"
                title="Plusz"
                src={
                  calculateUnusedAbilityPoints() === 0
                    ? "../images/ui/plusz_btn_inactive.png"
                    : "../images/ui/plusz_btn_active.png"
                }
              ></img>
            </button>
            <OverlayTrigger
              trigger="focus"
              placement="bottom"
              overlay={
                <Popover id="popover-basic" className="rounded-0">
                  <Popover.Header as="h3" className="bg-body"></Popover.Header>
                  <Popover.Body className="d-flex flex-column bg-transparent text-center">
                    <span>Növeli a kritikus találat esélyét.</span>
                  </Popover.Body>
                </Popover>
              }
            >
              <button className={style.btnBg}>
                <img
                  alt="Leírás"
                  title="Leírás"
                  src="../images/ui/kerdojel_btn.png"
                ></img>
              </button>
            </OverlayTrigger>
          </div>
        </div>
        <div className="d-flex flex-column text-center text-white p-2 stat-container">
          <span>Intelligencia</span>
          <span className="fs-5 text-warning">
            {addedIntelligence + player.intelligence}
          </span>
          <div>
            <button className={style.btnBg} onClick={handleClickIntelligence}>
              <img
                alt="Plusz"
                title="Plusz"
                src={
                  calculateUnusedAbilityPoints() === 0
                    ? "../images/ui/plusz_btn_inactive.png"
                    : "../images/ui/plusz_btn_active.png"
                }
              ></img>
            </button>
            <OverlayTrigger
              trigger="focus"
              placement="bottom"
              overlay={
                <Popover id="popover-basic" className="rounded-0">
                  <Popover.Header as="h3" className="bg-body"></Popover.Header>
                  <Popover.Body className="d-flex flex-column bg-transparent text-center">
                    <span>
                      Növeli a visszatérő alapanyagok, érmék és XP mennyiségét.
                    </span>
                  </Popover.Body>
                </Popover>
              }
            >
              <button className={style.btnBg}>
                <img
                  alt="Leírás"
                  title="Leírás"
                  src="../images/ui/kerdojel_btn.png"
                ></img>
              </button>
            </OverlayTrigger>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center gap-2">
        <button
          className={`${style.btnBase} font-btn`}
          onClick={handleSave}
          disabled={!checkUnsavedPoints()}
        >
          <span>Mentés</span>
        </button>
        <button
          className={`${style.btnBase} font-btn`}
          onClick={handleCancel}
          disabled={!checkUnsavedPoints()}
        >
          <span>Visszavonás</span>
        </button>
      </div>
    </div>
  ) : null;
}