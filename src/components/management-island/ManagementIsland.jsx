import GameField from "../game-field/GameField";
import BuildableLocation from "./buildable-location/BuildableLocation";
import Building from "./building/Building";
import Tile from "./tile/Tile";
import style from "./ManagementIsland.module.css";
import React, { Component } from "react";
import IslandContext from "../../contexts/IslandContext";
import BuildingModal from "./building-modal/BuildingModal";
import BuildingNotification from "./building-request-notification/BuildingRequestNotification";
import axios from "axios";
import { timer, expand, Subject, takeUntil, take } from "rxjs";
import { AnimateKeyframes } from "react-simple-animate";
import NPC from "./npc/NPC";


export default class ManagementIsland extends Component {
  static contextType = IslandContext;

  constructor(props) {
    super(props);

    this.state = {
      buildings: [],
      buildableLocations: [],
      isModalShowed: false,
      openedBuilding: null,
      openedBuildingRemainingTime: 0,
      currentlyRunningAnimations: [],
      currentAnimationIndex: 0,
    };

    this.openBuildingModal = (openedBuilding) => {
      this.setState((state) => ({
        ...state,
        isModalShowed: true,
        openedBuilding: openedBuilding,
      }));
    };

    this.closeBuildingModal = () => {
      this.setState((state) => ({
        ...state,
        isModalShowed: false,
        openedBuilding: null,
      }));
    };

    this.setCollectedItemsToPlayer = (collectedItems) => {
      this.context.setPlayer({
        ...this.context.player,
        coins: this.context.player.coins + collectedItems.coins,
        woods: this.context.player.woods + collectedItems.woods,
        stones: this.context.player.stones + collectedItems.stones,
        irons: this.context.player.irons + collectedItems.irons,
      });
    };

    this.updateLastCollectDate = (buildingId, lastCollectDate) => {
      const collectedBuildings = this.context.buildings.map(building => building.id == buildingId ? {
        ...building,
        lastCollectDate: lastCollectDate
      } : building);

      this.context.setBuildings(collectedBuildings);
    }

    this.setOpenedBuildingRemainingTime = (
      currentRemainingTime,
      buildingType
    ) => {
      if (
        this.state.openedBuilding &&
        this.state.openedBuilding.buildingType === buildingType
      ) {
        this.setState((state) => ({
          ...state,
          openedBuildingRemainingTime: currentRemainingTime,
        }));
      }
    };

    this.buildBuilding = (xCoordinate, yCoordinate) => {
      axios
        .post(`${process.env.REACT_APP_API_BASE}/api/Building/CreateBuilding`, {
          buildingType: this.context.buildingToBeBuild.buildingType,
          xCoordinate: xCoordinate,
          yCoordinate: yCoordinate,
        })
        .then((response) => {
          this.context.setPlayer({
            ...this.context.player,
            coins:
              this.context.player.coins -
              this.context.buildingToBeBuild.coinsForBuild,
            woods:
              this.context.player.woods -
              this.context.buildingToBeBuild.woodsForBuild,
            stones:
              this.context.player.stones -
              this.context.buildingToBeBuild.stonesForBuild,
            irons:
              this.context.player.irons -
              this.context.buildingToBeBuild.ironsForBuild,
            experience:
              this.context.player.experience +
              this.context.buildingToBeBuild.experienceReward,
          });
          this.context.setBuildings([...this.context.buildings, response.data]);
          this.context.interruptBuildingRequest();
        })
        .catch(() => {
          alert("Nem sikerült kapcsolódni a szerverhez!");
        });
    };

    this.componentDestroyed$ = new Subject();
    this.scheduledAnimations$ = new Subject().pipe(
      take(1),
      expand(() => timer(Math.floor(Math.random() * 5000) + 5000))
    );

    this.DIRECTIONS = {
      top: 0,
      right: 1,
      bottom: 2,
      left: 3,
    };

    this.MAX_ANIMATIONS = 6;
  }

  freeBuildingLocations() {
    return this.context.buildableLocations.filter(
      (buildableLocation) =>
        this.context.buildings.filter(
          (building) =>
            building.xCoordinate === buildableLocation.xCoordinate &&
            building.yCoordinate === buildableLocation.yCoordinate
        ).length === 0
    );
  }

  startNPCAnimation() {
    const routesMap = this.convertRoutesToMap(this.context.island.npcRoutes);

    const startCoordinatesMap = this.startingCoordinates(routesMap);
    const startCoordinate = this.chooseRandomCoordinate(startCoordinatesMap);
    const routeCoordinates = this.createRouteForNPC(startCoordinate, routesMap);
    const movements = this.convertRouteCoordinatesToMovements(routeCoordinates);

    const sprite = this.chooseRandomSprite(this.context.island.npcSprites);
    const animation = this.createNPCAnimation(
      startCoordinate,
      movements,
      sprite
    );

    const now = new Date();
    const currentlyRunningAnimations =
      this.state.currentlyRunningAnimations.filter(
        (animation) => animation.endTime.getTime() > now.getTime()
      );

    if (currentlyRunningAnimations.length < 6) {
      this.setState((state) => ({
        ...state,
        currentAnimationIndex: animation.index,
        currentlyRunningAnimations: [...currentlyRunningAnimations, animation],
      }));
    }
  }

  animationGarbageCollect(animations) {
    const runningAnimations = [];
    const now = new Date();

    for (const animation of animations) {
      if (animation.endTime > now) {
        runningAnimations.push(animation);
      }
    }

    return runningAnimations;
  }

  convertRoutesToMap(routes) {
    const map = new Map();
    for (const route of routes) {
      map.set(`${route.xCoordinate}${route.yCoordinate}`, route);
    }
    return map;
  }

  startingCoordinates(routesMap) {
    const startingCoordinates = [];

    for (const route of routesMap) {
      const topNeighbourRouteKey = `${route[1].xCoordinate}${route[1].yCoordinate + 1
        }`;
      const rightNeighbourRouteKey = `${route[1].xCoordinate + 1}${route[1].yCoordinate
        }`;
      const bottomNeighbourRouteKey = `${route[1].xCoordinate}${route[1].yCoordinate - 1
        }`;
      const leftNeighbourRouteKey = `${route[1].xCoordinate - 1}${route[1].yCoordinate
        }`;

      let numberOfNeighbors = 0;

      if (routesMap.get(topNeighbourRouteKey)) {
        numberOfNeighbors++;
      }

      if (routesMap.get(rightNeighbourRouteKey)) {
        numberOfNeighbors++;
      }

      if (routesMap.get(bottomNeighbourRouteKey)) {
        numberOfNeighbors++;
      }

      if (routesMap.get(leftNeighbourRouteKey)) {
        numberOfNeighbors++;
      }

      if (numberOfNeighbors === 1) {
        startingCoordinates.push(route);
      }
    }

    return startingCoordinates;
  }

  chooseRandomCoordinate(coordinates) {
    const randomIndex = Math.floor(Math.random() * coordinates.length);
    return coordinates[randomIndex][1];
  }

  createRouteForNPC(startingCoordinate, routesMap) {
    const touchedRouteParts = new Map();
    const npcRouteCoordinates = [startingCoordinate];

    let currentRoutePart = startingCoordinate;
    let isEndRouteReached = false;

    while (!isEndRouteReached) {
      const possibleRouteParts = [];

      const topRoutePartKey = `${currentRoutePart.xCoordinate}${currentRoutePart.yCoordinate + 1
        }`;
      const rightRoutePartKey = `${currentRoutePart.xCoordinate + 1}${currentRoutePart.yCoordinate
        }`;
      const bottomRoutePartKey = `${currentRoutePart.xCoordinate}${currentRoutePart.yCoordinate - 1
        }`;
      const leftRoutePartKey = `${currentRoutePart.xCoordinate - 1}${currentRoutePart.yCoordinate
        }`;

      if (
        routesMap.get(topRoutePartKey) &&
        !touchedRouteParts.get(topRoutePartKey)
      ) {
        possibleRouteParts.push(routesMap.get(topRoutePartKey));
      }

      if (
        routesMap.get(rightRoutePartKey) &&
        !touchedRouteParts.get(rightRoutePartKey)
      ) {
        possibleRouteParts.push(routesMap.get(rightRoutePartKey));
      }

      if (
        routesMap.get(bottomRoutePartKey) &&
        !touchedRouteParts.get(bottomRoutePartKey)
      ) {
        possibleRouteParts.push(routesMap.get(bottomRoutePartKey));
      }

      if (
        routesMap.get(leftRoutePartKey) &&
        !touchedRouteParts.get(leftRoutePartKey)
      ) {
        possibleRouteParts.push(routesMap.get(leftRoutePartKey));
      }

      if (possibleRouteParts.length === 1) {
        npcRouteCoordinates.push(possibleRouteParts[0]);
        touchedRouteParts.set(
          `${currentRoutePart.xCoordinate}${currentRoutePart.yCoordinate}`,
          currentRoutePart
        );

        currentRoutePart = possibleRouteParts[0];
      } else if (possibleRouteParts.length > 1) {
        const randomIndex = Math.floor(
          Math.random() * possibleRouteParts.length
        );

        npcRouteCoordinates.push(possibleRouteParts[randomIndex]);
        touchedRouteParts.set(
          `${currentRoutePart.xCoordinate}${currentRoutePart.yCoordinate}`,
          currentRoutePart
        );

        currentRoutePart = possibleRouteParts[randomIndex];
      } else {
        isEndRouteReached = true;
      }
    }

    return npcRouteCoordinates;
  }

  convertRouteCoordinatesToMovements(routeCoordinates) {
    const movements = [];
    let currentMovementDirection = null;
    let currentMovementIndex = -1;

    for (let i = 1; i < routeCoordinates.length; i++) {
      let newMovementDirection;

      if (
        routeCoordinates[i - 1].xCoordinate > routeCoordinates[i].xCoordinate
      ) {
        newMovementDirection = this.DIRECTIONS.left;
      }

      if (
        routeCoordinates[i - 1].yCoordinate > routeCoordinates[i].yCoordinate
      ) {
        newMovementDirection = this.DIRECTIONS.top;
      }

      if (
        routeCoordinates[i - 1].xCoordinate < routeCoordinates[i].xCoordinate
      ) {
        newMovementDirection = this.DIRECTIONS.right;
      }

      if (
        routeCoordinates[i - 1].yCoordinate < routeCoordinates[i].yCoordinate
      ) {
        newMovementDirection = this.DIRECTIONS.bottom;
      }

      if (newMovementDirection !== currentMovementDirection) {
        currentMovementIndex++;
        currentMovementDirection = newMovementDirection;

        movements.push({ direction: currentMovementDirection, steps: 1 });
      } else {
        movements[currentMovementIndex].steps++;
      }
    }

    return movements;
  }

  chooseRandomSprite(sprites) {
    const randomIndex = Math.floor(Math.random() * sprites.length);

    return sprites[randomIndex];
  }

  createNPCAnimation(startCoordinate, movements, sprite) {
    const ISLAND_WIDTH_COORDINATES_PERCENT = 0.5;
    const ISlAND_HEIGHT_COODINATES_PERCENT = 0.3;
    const TIME_PER_STEP = 2;

    const STEPS_COUNT = movements.reduce((r, a) => r + a.steps, 0);

    let currentTranslateX =
      startCoordinate.xCoordinate / ISLAND_WIDTH_COORDINATES_PERCENT;
    let currentTranslateY =
      startCoordinate.yCoordinate / ISlAND_HEIGHT_COODINATES_PERCENT;
    let animationKeyframePercent = 0;

    const keyframes = [
      {
        0: `transform: translateX(${currentTranslateX}%) translateY(${currentTranslateY}%);`,
      },
    ];

    for (const movement of movements) {
      let keyframe = {};

      animationKeyframePercent += movement.steps / (STEPS_COUNT / 100);
      if (animationKeyframePercent > 100) animationKeyframePercent = 100;

      switch (movement.direction) {
        case this.DIRECTIONS.top:
          currentTranslateY -=
            movement.steps / ISlAND_HEIGHT_COODINATES_PERCENT;
          keyframe[
            animationKeyframePercent
          ] = `transform: translateX(${currentTranslateX}%) translateY(${currentTranslateY}%);`;

          keyframes.push(keyframe);

          break;
        case this.DIRECTIONS.right:
          currentTranslateX +=
            movement.steps / ISLAND_WIDTH_COORDINATES_PERCENT;
          keyframe[
            animationKeyframePercent
          ] = `transform: translateX(${currentTranslateX}%) translateY(${currentTranslateY}%);`;

          keyframes.push(keyframe);

          break;
        case this.DIRECTIONS.bottom:
          currentTranslateY +=
            movement.steps / ISlAND_HEIGHT_COODINATES_PERCENT;
          keyframe[
            animationKeyframePercent
          ] = `transform: translateX(${currentTranslateX}%) translateY(${currentTranslateY}%);`;

          keyframes.push(keyframe);

          break;
        case this.DIRECTIONS.left:
          currentTranslateX -=
            movement.steps / ISLAND_WIDTH_COORDINATES_PERCENT;
          keyframe[
            animationKeyframePercent
          ] = `transform: translateX(${currentTranslateX}%) translateY(${currentTranslateY}%)`;

          keyframes.push(keyframe);

          break;
        default:
      }
    }

    const ANIMATION_FREQUENCY = 8;
    const WALKING_ANIMATION_KEYFRAME_PERCENT =
      100 / (STEPS_COUNT * ANIMATION_FREQUENCY);

    const walkingKeyframes = [];
    let spritePosition = 0;
    let currentWalkingAnimationKeyframePercent = 0;

    for (const movement of movements) {
      for (let step = 0; step < movement.steps; step++) {
        for (let keyframes = 0; keyframes < ANIMATION_FREQUENCY; keyframes++) {
          const walkingKeyframe = {};

          switch (movement.direction) {
            case this.DIRECTIONS.top:
              walkingKeyframe[
                currentWalkingAnimationKeyframePercent
              ] = `background-image: url(${sprite}); background-position: ${(100 / 3) * 2
                }% ${(100 / 2) * spritePosition}%`;
              walkingKeyframes.push(walkingKeyframe);

              break;
            case this.DIRECTIONS.right:
              walkingKeyframe[
                currentWalkingAnimationKeyframePercent
              ] = `background-image: url(${sprite}); background-position: ${100 / 3
                }% ${(100 / 2) * spritePosition}%`;
              walkingKeyframes.push(walkingKeyframe);

              break;
            case this.DIRECTIONS.bottom:
              walkingKeyframe[
                currentWalkingAnimationKeyframePercent
              ] = `background-image: url(${sprite}); background-position: ${0}% ${(100 / 2) * spritePosition
                }%`;
              walkingKeyframes.push(walkingKeyframe);

              break;
            case this.DIRECTIONS.left:
              walkingKeyframe[
                currentWalkingAnimationKeyframePercent
              ] = `background-image: url(${sprite}); background-position: ${100}% ${(100 / 2) * spritePosition
                }%`;
              walkingKeyframes.push(walkingKeyframe);

              break;
            default:
          }

          spritePosition < 2 ? spritePosition++ : (spritePosition = 0);

          currentWalkingAnimationKeyframePercent +=
            WALKING_ANIMATION_KEYFRAME_PERCENT;
          if (currentWalkingAnimationKeyframePercent > 100)
            currentWalkingAnimationKeyframePercent = 100;
        }
      }
    }

    const duration = STEPS_COUNT * TIME_PER_STEP;
    const endTime = new Date();
    endTime.setMilliseconds(endTime.getMilliseconds() + duration * 1000);

    return {
      duration: duration,
      keyframes: keyframes,
      walkingKeyframes: walkingKeyframes,
      endTime: endTime,
      index: this.state.currentAnimationIndex + 1,
    };
  }

  componentDidUpdate() {
    if (this.context.isIslandInitialized) {
      this.scheduledAnimations$.next();
    }
  }

  componentDidMount() {
    if (!this.context.isIslandInitialized) {
      this.context.initializeIslandFromHttp();
    }

    this.scheduledAnimations$
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe(() => {
        this.startNPCAnimation();
      });
  }

  currentlyRunningAnimations() {
    const now = new Date();
    return this.state.currentlyRunningAnimations.filter(
      (animaton) => animaton.endTime.getTime() > now.getTime()
    );
  }

  componentWillUnmount() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  render() {
    return this.context.isIslandInitialized ? (
      <div className={style.container}>
        <GameField
          mapTilesWide={50}
          mapTilesHigh={30}
          backgroundTilesWide={80}
          backgroundTilesHigh={60}
          mapSpritePath={this.context.island.spritePath}
          staticObjects={[
            this.context.buildings.map((building) => (
              <Tile
                key={`${building.id}${building.level}`}
                xCoordinate={building.xCoordinate}
                yCoordinate={building.yCoordinate}
                scale={2}
              >
                <Building
                  building={building}
                  setCollectedItemsToPlayer={this.setCollectedItemsToPlayer}
                  updateLastCollectDate={this.updateLastCollectDate}
                  openBuildingModal={this.openBuildingModal}
                  setOpenedBuildingRemainingTime={
                    this.setOpenedBuildingRemainingTime
                  }
                />
              </Tile>
            )),
            this.freeBuildingLocations().map((buildableLocation, index) => (
              <Tile
                key={index}
                xCoordinate={buildableLocation.xCoordinate}
                yCoordinate={buildableLocation.yCoordinate}
                scale={2}
              >
                <BuildableLocation
                  xCoordinate={buildableLocation.xCoordinate}
                  yCoordinate={buildableLocation.yCoordinate}
                  buildBuilding={this.buildBuilding}
                />
              </Tile>
            )),
          ]}
          animations={this.state.currentlyRunningAnimations.map((animation) => (
            <AnimateKeyframes
              play
              duration={animation.duration}
              direction="normal"
              keyframes={animation.keyframes}
              key={animation.index}
            >
              <NPC
                walkingKeyframes={animation.walkingKeyframes}
                duration={animation.duration}
              />
            </AnimateKeyframes>
          ))}
        />
        {this.state.isModalShowed ? (
          <BuildingModal
            openedBuilding={this.state.openedBuilding}
            closeBuildingModal={this.closeBuildingModal}
          />
        ) : null}
        {this.context.buildingToBeBuild ? <BuildingNotification /> : null}
      </div>
    ) : null
  }
}