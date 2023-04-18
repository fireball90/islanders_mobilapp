import axios from "axios";
import React, { Component } from "react";
import { OverlayTrigger } from "react-bootstrap";
import { scan, Subject, takeUntil, takeWhile, tap, timer } from "rxjs";
import GameFieldContext from "../../../contexts/GameFieldContext";
import MovablePopover from "../movable-popover/MovablePopover";
import moment from "moment";
import useSound from "use-sound";
import click from "../../../sounds/click.mp3";

import "./Building.css";

export default function BuildingHoc(props) {
  const [play] = useSound(click, {
    volume: 0.2,
  });

  const playSound = () => {
    play();
  };

  return <Building {...props} playSound={playSound} />;
}

export class Building extends Component {
  static contextType = GameFieldContext;

  constructor(props) {
    super(props);

    this.state = {
      isUnderConstruction: false,
      producedCoins: this.calculateProducedItemsSinceLastCollection(
        this.props.building.producedCoins
      ),
      producedIrons: this.calculateProducedItemsSinceLastCollection(
        this.props.building.producedIrons
      ),
      producedStones: this.calculateProducedItemsSinceLastCollection(
        this.props.building.producedStones
      ),
      producedWoods: this.calculateProducedItemsSinceLastCollection(
        this.props.building.producedWoods
      ),
      timeLeftToBuildingCompletion: 0,
    };

    const countdownTick = 1000;
    const beginTime = this.calculateFirstProductionTime() % countdownTick;
    const defaultProductionInterval =
      Math.round((this.calculateFirstProductionTime() - beginTime) / 1000) *
      1000;

    this.construction$ = timer(0, countdownTick);
    this.production$ = timer(beginTime, 1000).pipe(
      scan((previousTime) => {
        return previousTime === 0
          ? this.props.building.productionInterval - 1000
          : previousTime - countdownTick;
      }, defaultProductionInterval)
    );

    this.componentDestroyed$ = new Subject();
    this.ref = React.createRef();
  }

  calculateProducedItemsSinceLastCollection(item) {
    const now = new Date();
    const currentProductionDate = new Date(this.props.building.buildDate);
    const lastCollectDate = new Date(this.props.building.lastCollectDate);

    let productionsFromLastCollection = 0;

    while (currentProductionDate.getTime() < now.getTime()) {
      if (currentProductionDate.getTime() > lastCollectDate.getTime()) {
        productionsFromLastCollection++;
      }

      currentProductionDate.setTime(
        currentProductionDate.getTime() + this.props.building.productionInterval
      );
    }

    return this.calculateProducedItem(item * productionsFromLastCollection);
  }

  calculateFirstProductionTime() {
    const now = new Date();
    const currentProductionDate = new Date(this.props.building.buildDate);

    while (currentProductionDate.getTime() <= now.getTime()) {
      currentProductionDate.setTime(
        currentProductionDate.getTime() + this.props.building.productionInterval
      );
    }

    return currentProductionDate.getTime() - now.getTime() + 1000;
  }

  hasResourceProduction() {
    return (
      this.state.producedCoins +
        this.state.producedIrons +
        this.state.producedStones +
        this.state.producedWoods >
      0
    );
  }

  notNullProducedItems() {
    const notNullProducedItems = [];

    if (this.state.producedCoins > 0) {
      notNullProducedItems.push({
        name: "Érmék",
        iconPath: "../images/icons/coin.png",
        quantity: this.state.producedCoins,
      });
    }
    if (this.state.producedIrons) {
      notNullProducedItems.push({
        name: "Vas",
        iconPath: "../images/icons/steel.png",
        quantity: this.state.producedIrons,
      });
    }
    if (this.state.producedStones) {
      notNullProducedItems.push({
        name: "Kő",
        iconPath: "../images/icons/stone.png",
        quantity: this.state.producedStones,
      });
    }
    if (this.state.producedWoods) {
      notNullProducedItems.push({
        name: "Fa",
        iconPath: "../images/icons/wood.png",
        quantity: this.state.producedWoods,
      });
    }

    return notNullProducedItems;
  }

  collectItems() {
    this.setState((state) => ({
      ...state,
      producedCoins: 0,
      producedIrons: 0,
      producedStones: 0,
      producedWoods: 0,
    }));

    const collectDate = new Date();
    axios
      .post(`${process.env.REACT_APP_API_BASE}/api/Building/CollectItems`, {
        collectDate: moment(collectDate).format(),
        buildingType: this.props.building.buildingType,
      })
      .then((response) => {
        this.props.setCollectedItemsToPlayer(response.data);
        this.props.updateLastCollectDate(this.props.building.id, collectDate);
      })
      .catch(() => {
        alert("Nem sikerült kapcsolódni a szerverhez!");
      });
  }

  componentDidMount() {
    this.production$
      .pipe(
        takeUntil(this.componentDestroyed$),
        tap((currentRemainingTime) => {
          if (currentRemainingTime === 0) {
            this.setState((state) => ({
              ...state,
              producedCoins: this.calculateProducedItem(
                state.producedCoins + this.props.building.producedCoins
              ),
              producedIrons: this.calculateProducedItem(
                state.producedIrons + this.props.building.producedIrons
              ),
              producedStones: this.calculateProducedItem(
                state.producedStones + this.props.building.producedStones
              ),
              producedWoods: this.calculateProducedItem(
                state.producedWoods + this.props.building.producedWoods
              ),
            }));
          }
        })
      )
      .subscribe((currentRemainingTime) => {
        this.props.setOpenedBuildingRemainingTime(
          currentRemainingTime,
          this.props.building.buildingType
        );
      });

    this.construction$
      .pipe(
        takeUntil(this.componentDestroyed$),
        tap(() => {
          const now = new Date();
          const buildDate = new Date(this.props.building.buildDate);

          if (now.getTime() >= buildDate.getTime()) {
            this.setState((state) => ({
              ...state,
              timeLeftToBuildingCompletion: 0,
            }));
          }
        }),
        takeWhile(() => {
          const now = new Date();
          const buildDate = new Date(this.props.building.buildDate);
          return now.getTime() < buildDate.getTime();
        })
      )
      .subscribe(() => {
        const now = new Date();
        const buildDate = new Date(this.props.building.buildDate);

        this.setState((state) => ({
          ...state,
          timeLeftToBuildingCompletion: buildDate.getTime() - now.getTime(),
        }));
      });
  }

  calculateProducedItem(amount) {
    return amount > this.props.building.maximumProductionCount
      ? this.props.building.maximumProductionCount
      : amount;
  }

  componentWillUnmount() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  render() {
    return this.state.timeLeftToBuildingCompletion === 0 ? (
      <div
        className="building-sprite"
        style={{ backgroundImage: `url(${this.props.building.spritePath})` }}
        ref={this.ref}
      >
        <OverlayTrigger
          show={this.hasResourceProduction()}
          container={this.ref}
          trigger={null}
          overlay={
            <MovablePopover zoom={this.context.zoom}>
              {this.notNullProducedItems().map((item, index) => (
                <div key={index}>
                  <img
                    src={item.iconPath}
                    alt={item.name}
                    title={item.name}
                    className="collect-icon"
                  ></img>
                  <span className="collect-number">{item.quantity}</span>
                </div>
              ))}
              <button
                onClick={() => {
                  this.collectItems(); this.props.playSound();
                }}
                className="collect-btn"
              >
                Begyűjt
              </button>
            </MovablePopover>
          }
        >
          <div
            className="w-100 h-100"
            onClick={() => this.props.openBuildingModal(this.props.building)}
          ></div>
        </OverlayTrigger>
      </div>
    ) : (
      <div
        className="building-sprite"
        style={{ backgroundImage: "url(/assets/sprites/working.png)" }}
        ref={this.ref}
      >
        <OverlayTrigger
          show={true}
          container={this.ref}
          trigger={null}
          overlay={
            <MovablePopover zoom={this.context.zoom}>
              {moment(
                this.state.timeLeftToBuildingCompletion - 60 * 60 * 1000
              ).format("LTS")}
            </MovablePopover>
          }
        >
          <div></div>
        </OverlayTrigger>
      </div>
    );
  }
}