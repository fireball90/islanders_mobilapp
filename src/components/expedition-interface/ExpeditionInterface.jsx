import { Component } from "react";
import axios from "axios";
import AlertModal from "../alert-modal/Alert";
import ExpeditionResultModal from "../expedition-result-modal/ExpeditionResultModal";
import IslandContext from "../../contexts/IslandContext";
import moment from "moment";
import {
  scan,
  Subject,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
  timer,
  map,
} from "rxjs";

import "./ExpeditionInterface.css";

export default class ExpeditionInterface extends Component {
  static contextType = IslandContext;

  constructor(props) {
    super(props);

    this.state = {
      expeditionResult: null,
      errorMessage: null,
      blockTime: 0,
    };

    this.hideExpeditionResultModal = () => {
      this.setState((state) => ({
        ...state,
        expeditionResult: null,
      }));
    };

    this.block$ = new Subject().pipe(
      map((date) => {
        const now = new Date();
        return date.getTime() - now.getTime() + 1000;
      }),
      tap((countdownTime) => {
        this.setState((state) => ({
          ...state,
          blockTime: countdownTime,
        }));
      }),
      switchMap((countdownTime) => {
        const beginTime = countdownTime % 1000;

        return timer(beginTime, 1000).pipe(
          scan(
            (previousTime) => previousTime - 1000,
            countdownTime - beginTime
          ),
          takeWhile((countdown) => countdown >= 0),
          takeUntil(this.componentDestroyed$)
        );
      })
    );
    this.componentDestroyed$ = new Subject();
  }

  handleChooseExpedition(difficulty) {
    axios
      .get(
        `${process.env.REACT_APP_API_BASE}/api/Expedition/Expedition?difficulty=${difficulty}`
      )
      .then((response) => {
        const expeditionResult = response.data;

        this.setState((state) => ({
          ...state,
          expeditionResult: expeditionResult,
        }));

        this.context.setPlayer({
          ...this.context.player,
          experience:
            this.context.player.experience + expeditionResult.experience,
          coins: this.context.player.coins + expeditionResult.coins,
          woods: this.context.player.woods + expeditionResult.woods,
          stones: this.context.player.stones + expeditionResult.stones,
          irons: this.context.player.irons + expeditionResult.irons,
          lastExpeditionDate: expeditionResult.date,
        });

        const nextExpeditionDate = new Date(expeditionResult.date);
        nextExpeditionDate.setMinutes(nextExpeditionDate.getMinutes() + 1);

        this.block$.next(nextExpeditionDate);
      })
      .catch((error) => {
        let errorMessage = null;

        if (error.code === "ERR_NETWORK") {
          errorMessage = "Nem sikerült kapcsolódni a szerverhez.";
        } else {
          errorMessage = error.response.data;
        }

        this.setState((state) => ({
          ...state,
          errorMessage: errorMessage,
        }));
      });
  }

  componentDidMount() {
    this.block$
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe((countdown) => {
        this.setState((state) => ({
          ...state,
          blockTime: countdown,
        }));
      });

    const nextExpeditionDate = new Date(this.context.player.lastExpeditionDate);
    nextExpeditionDate.setMinutes(nextExpeditionDate.getMinutes() + 1);
    const now = new Date();
    
    if (now < nextExpeditionDate) {
      this.block$.next(nextExpeditionDate);
    }
  }

  componentWillUnmount() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  render() {
    return (
      <>
        {this.state.blockTime === 0 ? (
          <div className="container-fluid">
            <div className="expedition justify-content-center">
              <h2>Válasszon az expedíciók erősségei közül</h2>
              <div className="edificult d-flex justify-content-evenly">
                <div className="exp-cont-bg">
                  <img
                    src="../images/difficulty/easy.png"
                    className="ecard-img-fluid"
                    alt="Easy"
                    title="Könnyű"
                  ></img>
                  <div className="ecard-body">
                    <button
                      className="expedition-btn font-btn"
                      title="Könnyű"
                      onClick={() => this.handleChooseExpedition(1)}
                    >
                      Könnyű
                    </button>
                    <p className="ecard-text">
                      Kevés alapanyag, xp és arany, de több esély a sikeres
                      expedícióra.
                    </p>
                  </div>
                </div>
                <div className="exp-cont-bg">
                  <img
                    src="../images/difficulty/medium.png"
                    className="ecard-img-fluid"
                    alt="Medium"
                    title="Normál"
                  ></img>
                  <div className="ecard-body">
                    <button
                      className="expedition-btn font-btn"
                      title="Normál"
                      onClick={() => this.handleChooseExpedition(2)}
                    >
                      Normál
                    </button>
                    <p className="ecard-text">
                      Közepes mennyiségű alapanyag, xp és arany, de kevesebb
                      esély a sikeres expedícióra.
                    </p>
                  </div>
                </div>
                <div className="exp-cont-bg">
                  <img
                    src="../images/difficulty/hard.png"
                    className="ecard-img-fluid"
                    alt="Hard"
                    title="Nehéz"
                  ></img>
                  <div className="ecard-body">
                    <button
                      className="expedition-btn font-btn"
                      title="Nehéz"
                      onClick={() => this.handleChooseExpedition(3)}
                    >
                      Nehéz
                    </button>
                    <p className="ecard-text">
                      Sok alapanyag, xp és arany, de alacsony esély a sikeres
                      expedícióra.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="expedition-block">
            <h4>Az expedíció jelenleg nem érhető el!</h4>
            <p>
              Kérlek, próbálkozz újra{" "}
              {moment(this.state.blockTime - 1000 * 60 * 60).format("LTS")}{" "}
              másodperc múlva.
            </p>
          </div>
        )}
        {this.state.errorMessage ? (
          <AlertModal title="Hiba történt">
            <span className="text-white">{this.state.errorMessage}</span>
          </AlertModal>
        ) : null}
        {this.state.expeditionResult ? (
          <ExpeditionResultModal
            expeditionResult={this.state.expeditionResult}
            onHide={this.hideExpeditionResultModal}
          />
        ) : null}
      </>
    );
  }
}