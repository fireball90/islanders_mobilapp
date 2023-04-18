import { Component } from "react";
import style from "./IslandsBattle.module.css";
import GameField from "../game-field/GameField";
import moment from "moment";
import Lock from "./lock/Lock";
import {
  Subject,
  scan,
  map,
  mergeMap,
  takeWhile,
  timer,
  takeUntil,
} from "rxjs";
import { GameHelper } from "../../game-helper/GameHelper";
import axios from "axios";
import Tile from "../management-island/tile/Tile";
import { EnemyIsland } from "./enemy-island/EnemyIsland";
import BattleConfirmDialog from "./battle-confirm-dialog/BattleConfirmDialog";
import BattleReportDialog from "./battle-report-dialog/BattleReportDialog";
import IslandContext from "../../contexts/IslandContext";

export default class IslandsBattle extends Component {
  static contextType = IslandContext;

  constructor(props) {
    super(props);

    this.LOCK_MINUTES_AFTER_BATTLE = 10;
    this.MAX_X_COORDINATES = 5;
    this.MAX_Y_COORDINATES = 3;

    this.state = {
      isInitReady: true,
      tempoparyLockCounter: 0,
      enemies: [],
      attackedEnemy: null,
      battleReports: null,
    };

    this.close = () => {
      this.setState((state) => ({
        ...state,
        attackedEnemy: null,
      }));
    };

    this.setAttackedEnemy = (attackedEnemy) => {
      this.setState((state) => ({
        ...state,
        attackedEnemy: attackedEnemy,
      }));
    };

    this.attack = () => {
      const battleDate = new Date();

      axios
        .get(
          `${process.env.REACT_APP_API_BASE}/api/Battle/StartBattle?enemyUsername=${this.state.attackedEnemy.username}`
        )
        .then((response) => {
          const battleReports = response.data;

          this.setState((state) => ({
            ...state,
            battleReports: battleReports,
          }));

          this.context.setPlayer({
            ...this.context.player,
            experience:
              this.context.player.experience + battleReports.experience,
            coins: this.context.player.coins + battleReports.coins,
            woods: this.context.player.woods + battleReports.woods,
            stones: this.context.player.stones + battleReports.stones,
            irons: this.context.player.irons + battleReports.irons,
            lastBattleDate: battleDate,
          });
        })
        .catch(() => {
          alert("Nem sikerült kapcsolódni a szerverhez!");
        });

      this.setState((state) => ({
        ...state,
        attackedEnemy: null,
      }));
    };

    this.resetBattleReports = () => {
      const earliestBattleDate = new Date(this.context.player.lastBattleDate);
      earliestBattleDate.setMinutes(earliestBattleDate.getMinutes() + 10);

      this.battle$.next(earliestBattleDate);

      this.setState((state) => ({
        ...state,
        battleReport: null,
      }));
    };

    this.battle$ = new Subject().pipe(
      map((earliestBattleDate) => {
        const now = new Date();
        return earliestBattleDate.getTime() - now.getTime();
      }),
      mergeMap((earliestBattleTime) => {
        this.setTempopraryLockCounter(earliestBattleTime);

        const timerStartTime = earliestBattleTime % 1000;
        const counterTime = earliestBattleTime - timerStartTime;

        return timer(timerStartTime, 1000).pipe(
          scan((counter) => counter - 1000, counterTime),
          takeWhile((counter) => counter >= 0)
        );
      })
    );
    this.componentDestroyed$ = new Subject();
  }

  setTempopraryLockCounter(counter) {
    this.setState((state) => ({
      ...state,
      tempoparyLockCounter: counter,
    }));
  }

  setEnemies(enemies) {
    this.setState((state) => ({
      ...state,
      enemies: enemies,
    }));
  }

  enemiesWithCoordinates(enemies) {
    const enemiesWithCoordinates = [];

    enemies.forEach((enemy) => {
      let randomCoordinatesFound = false;

      while (!randomCoordinatesFound) {
        const randomXCoordinate = Math.floor(
          Math.random() * this.MAX_X_COORDINATES
        );
        const randomYCoordinate = Math.floor(
          Math.random() * this.MAX_Y_COORDINATES
        );

        if (
          enemiesWithCoordinates.findIndex(
            (enemyWithCoordinates) =>
              enemyWithCoordinates.xCoordinate === randomXCoordinate &&
              enemyWithCoordinates.yCoordinate === randomYCoordinate
          ) === -1
        ) {
          randomCoordinatesFound = true;
          enemiesWithCoordinates.push({
            ...enemy,
            xCoordinate: randomXCoordinate,
            yCoordinate: randomYCoordinate,
          });
        }
      }
    });

    return enemiesWithCoordinates;
  }

  searchEnemies() {
    axios
      .get(`${process.env.REACT_APP_API_BASE}/api/Battle/GetAllEnemies`)
      .then((response) => {
        const enemiesWithCoordinates = this.enemiesWithCoordinates(
          response.data
        );
        this.setEnemies(enemiesWithCoordinates);
      })
      .catch(() => {
        alert("Nem sikerült kapcsolódni a szerverhez!");
      });
  }

  componentDidMount() {
    this.battle$
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe((counter) => {
        this.setTempopraryLockCounter(counter);
      });

    const now = new Date();
    const earliestBattleDate = new Date(this.context.player.lastBattleDate);
    earliestBattleDate.setMinutes(
      earliestBattleDate.getMinutes() + this.LOCK_MINUTES_AFTER_BATTLE
    );

    if (now < earliestBattleDate) {
      this.battle$.next(earliestBattleDate);
    }

    this.searchEnemies();
  }

  calculateMyHealth() {
    return 100 + GameHelper.CalculateLevel(this.context.player.experience) * 15;
  }

  componentWillUnmount() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  render() {
    return GameHelper.CalculateLevel(this.context.player.experience) < 5 ? (
      <Lock>Csak 5. szint elérése után nyílik meg a csata!</Lock>
    ) : this.state.tempoparyLockCounter !== 0 ? (
      <Lock>
        {moment(this.state.tempoparyLockCounter - 60 * 60 * 1000).format("LTS")}
      </Lock>
    ) : (
      <div className={style.container}>
        <GameField
          mapTilesWide={50}
          mapTilesHigh={30}
          backgroundTilesWide={80}
          backgroundTilesHigh={60}
          mapSpritePath={""}
          staticObjects={[
            this.state.enemies.map((enemy, index) => (
              <Tile
                key={index}
                xCoordinate={enemy.xCoordinate}
                yCoordinate={enemy.yCoordinate}
                scale={10}
              >
                <EnemyIsland
                  enemy={enemy}
                  myHealth={this.calculateMyHealth()}
                  setAttackedEnemy={this.setAttackedEnemy}
                />
              </Tile>
            )),
          ]}
          animations={[]}
        />
        {this.state.attackedEnemy ? (
          <BattleConfirmDialog
            attackedEnemy={this.state.attackedEnemy}
            close={this.close}
            attack={this.attack}
          />
        ) : null}
        {this.state.battleReports ? (
          <BattleReportDialog
            battleReports={this.state.battleReports}
            resetBattleReports={this.resetBattleReports}
          />
        ) : null}
      </div>
    );
  }
}