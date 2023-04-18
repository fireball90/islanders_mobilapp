import { Component } from "react";
import {
  Subject,
  map,
  pairwise,
  switchMap,
  scan,
  takeWhile,
  distinctUntilChanged,
  skip,
  filter,
  debounceTime,
} from "rxjs";
import { fromEvent } from "rxjs/internal/observable/fromEvent";
import { startWith } from "rxjs/internal/operators/startWith";
import { takeUntil } from "rxjs/internal/operators/takeUntil";
import GameFieldContext from "../../contexts/GameFieldContext";

import style from "./GameField.module.css";

export default class GameField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tileSize: 0,
      isLeftButtonHolded: false,
      zoom: 0,
      backgroundSizeAndPosition: {
        width: 0,
        height: 0,
        top: 0,
        left: 0,
      },
      mapSizeAndPosition: {
        width: 0,
        height: 0,
        top: 0,
        left: 0,
      },
      centerX: 0,
      centerY: 0,
    };

    this.mouseMove$ = new Subject();
    this.mouseLeave$ = new Subject();
    this.mouseUp$ = new Subject();
    this.mouseDown$ = new Subject();
    this.wheel$ = new Subject().pipe(debounceTime(5));
    this.resize$ = fromEvent(window, "resize");

    this.touchMove$ = new Subject();
    this.touchStart$ = new Subject().pipe(
      switchMap(() =>
        this.touchMove$.pipe(
          pairwise(),
          filter(([previousEvent, currentEvent]) => {
            return (
              previousEvent.touches.length === 1 &&
              currentEvent.touches.length === 1
            );
          }),
          map(([previousEvent, currentEvent]) => {
            const previousTouch =
              previousEvent.touches[0] || previousEvent.changedTouches[0];
            const currentTouch =
              currentEvent.touches[0] || currentEvent.changedTouches[0];
            const movementX = currentTouch.clientX - previousTouch.clientX;
            const movementY = currentTouch.clientY - previousTouch.clientY;

            return [movementX, movementY];
          })
        )
      )
    );

    this.pinch$ = new Subject();
    this.pinchEnd$ = new Subject();
    this.pinchStart$ = new Subject().pipe(
      switchMap(() =>
        this.pinch$.pipe(
          debounceTime(5),
          takeWhile((event) => {
            const touches = event.touches || event.changedTouches;
            return touches.length === 2;
          }),
          map((event) => {
            const touches = event.touches || event.changedTouches;

            const coordinateX = Math.round(
              (touches[0].pageX + touches[1].pageX) / 2
            );
            const coordinateY = Math.round(
              (touches[0].pageY + touches[1].pageY) / 2
            );

            const distance = Math.sqrt(
              Math.pow(Math.abs(touches[0].pageX - touches[1].pageX), 2) +
                Math.pow(Math.abs(touches[0].pageY - touches[1].pageY), 2)
            );

            return {
              coordinateX: coordinateX,
              coordinateY: coordinateY,
              distance: distance,
              scale: 0,
            };
          }),
          scan((lastPinchEvent, currentPinchEvent) => {
            return lastPinchEvent.distance + 10 <= currentPinchEvent.distance
              ? { ...currentPinchEvent, scale: 1.25 }
              : lastPinchEvent.distance - 10 >= currentPinchEvent.distance
              ? { ...currentPinchEvent, scale: 0.8 }
              : lastPinchEvent;
          }),
          distinctUntilChanged(),
          skip(1)
        )
      )
    );

    this.componentDestroyed$ = new Subject();
  }

  setCameraPositionByResize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const isMapWiderThanScreen =
      screenHeight >
      (screenWidth / this.props.mapTilesWide) * this.props.mapTilesHigh;

    if (isMapWiderThanScreen) {
      const tileSize = screenWidth / this.props.mapTilesWide;

      this.setState((state) => ({
        ...state,
        tileSize: tileSize,
        backgroundSizeAndPosition: {
          width: tileSize * this.props.backgroundTilesWide,
          height: tileSize * this.props.backgroundTilesHigh,
          top: (screenHeight - tileSize * this.props.backgroundTilesHigh) / 2,
          left: (screenWidth - tileSize * this.props.backgroundTilesWide) / 2,
        },
        mapSizeAndPosition: {
          width: screenWidth,
          height: tileSize * this.props.mapTilesHigh,
          top: (screenHeight - tileSize * this.props.mapTilesHigh) / 2,
          left: 0,
        },
        zoom: 0,
      }));
    } else {
      const tileSize = screenHeight / this.props.mapTilesHigh;

      this.setState((state) => ({
        ...state,
        tileSize: tileSize,
        backgroundSizeAndPosition: {
          width: tileSize * this.props.backgroundTilesWide,
          height: tileSize * this.props.backgroundTilesHigh,
          top: (screenHeight - tileSize * this.props.backgroundTilesHigh) / 2,
          left: (screenWidth - tileSize * this.props.backgroundTilesWide) / 2,
        },
        mapSizeAndPosition: {
          width: tileSize * this.props.mapTilesWide,
          height: screenHeight,
          top: 0,
          left: (screenWidth - tileSize * this.props.mapTilesWide) / 2,
        },
        zoom: 0,
      }));
    }
  }

  setCameraDistance(scale, resizeOrigoX, resizeOrigoY) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let newBackgroundWidth = this.state.backgroundSizeAndPosition.width * scale;
    let newBackgroundHeight =
      this.state.backgroundSizeAndPosition.height * scale;
    let newBackgroundLeft =
      resizeOrigoX -
      (resizeOrigoX - this.state.backgroundSizeAndPosition.left) * scale;
    let newBackgroundTop =
      resizeOrigoY -
      (resizeOrigoY - this.state.backgroundSizeAndPosition.top) * scale;

    if (newBackgroundLeft + newBackgroundWidth < screenWidth) {
      resizeOrigoX = screenWidth;
    }

    if (newBackgroundTop + newBackgroundHeight < screenHeight) {
      resizeOrigoY = screenHeight;
    }

    if (newBackgroundLeft > 0) {
      resizeOrigoX = 0;
    }

    if (newBackgroundTop > 0) {
      resizeOrigoY = 0;
    }

    const zoomMeasure = scale > 1 ? 1 : -1;

    if (
      this.state.zoom + zoomMeasure >= 0 &&
      this.state.zoom + zoomMeasure <= 5
    ) {
      this.setState(
        (state) => ({
          ...state,
          tileSize: state.tileSize * scale,
          backgroundSizeAndPosition: {
            width: state.backgroundSizeAndPosition.width * scale,
            height: state.backgroundSizeAndPosition.height * scale,
            top:
              resizeOrigoY -
              (resizeOrigoY - state.backgroundSizeAndPosition.top) * scale,
            left:
              resizeOrigoX -
              (resizeOrigoX - state.backgroundSizeAndPosition.left) * scale,
          },
          mapSizeAndPosition: {
            width: state.mapSizeAndPosition.width * scale,
            height: state.mapSizeAndPosition.height * scale,
            top:
              resizeOrigoY -
              (resizeOrigoY - state.mapSizeAndPosition.top) * scale,
            left:
              resizeOrigoX -
              (resizeOrigoX - state.mapSizeAndPosition.left) * scale,
          },
          zoom: state.zoom + zoomMeasure,
        })
      );
    }
  }

  setCameraPositionByMove(movementX, movementY, isTouchScreen) {
    if (!this.state.isLeftButtonHolded && !isTouchScreen) return;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let newMapLeft = this.state.mapSizeAndPosition.left + movementX;
    let newMapTop = this.state.mapSizeAndPosition.top + movementY;
    let newBackgroundLeft =
      this.state.backgroundSizeAndPosition.left + movementX;
    let newBackgroundTop = this.state.backgroundSizeAndPosition.top + movementY;

    if (
      newBackgroundLeft + this.state.backgroundSizeAndPosition.width <
      screenWidth
    ) {
      const difference =
        newBackgroundLeft +
        this.state.backgroundSizeAndPosition.width -
        screenWidth;
      newMapLeft -= difference;
      newBackgroundLeft -= difference;
    }

    if (
      newBackgroundTop + this.state.backgroundSizeAndPosition.height <
      screenHeight
    ) {
      const difference =
        newBackgroundTop +
        this.state.backgroundSizeAndPosition.height -
        screenHeight;
      newMapTop -= difference;
      newBackgroundTop -= difference;
    }

    if (newBackgroundLeft > 0) {
      const difference = newBackgroundLeft;
      newMapLeft -= difference;
      newBackgroundLeft -= difference;
    }

    if (newBackgroundTop > 0) {
      const difference = newBackgroundTop;
      newMapTop -= difference;
      newBackgroundTop -= difference;
    }

    this.setState((state) => ({
      ...state,
      backgroundSizeAndPosition: {
        width: state.backgroundSizeAndPosition.width,
        height: state.backgroundSizeAndPosition.height,
        top: newBackgroundTop,
        left: newBackgroundLeft,
      },
      mapSizeAndPosition: {
        width: state.mapSizeAndPosition.width,
        height: state.mapSizeAndPosition.height,
        top: newMapTop,
        left: newMapLeft,
      },
    }));
  }

  isAspectRatioSupported() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    return (
      this.state.backgroundSizeAndPosition.width >= screenWidth &&
      this.state.backgroundSizeAndPosition.height >= screenHeight
    );
  }

  componentDidMount() {
    this.mouseMove$
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe((event) =>
        this.setCameraPositionByMove(event.movementX, event.movementY, false)
      );

    this.mouseLeave$.pipe(takeUntil(this.componentDestroyed$)).subscribe(() => {
      this.setState((state) => ({
        ...state,
        isLeftButtonHolded: false,
      }));
    });

    this.mouseUp$.pipe(takeUntil(this.componentDestroyed$)).subscribe(() => {
      this.setState((state) => ({
        ...state,
        isLeftButtonHolded: false,
      }));
    });

    this.mouseDown$.pipe(takeUntil(this.componentDestroyed$)).subscribe(() => {
      this.setState((state) => ({
        ...state,
        isLeftButtonHolded: true,
      }));
    });

    this.wheel$.pipe(takeUntil(this.componentDestroyed$)).subscribe((event) => {
      if (event.deltaY > 0) {
        this.setCameraDistance(0.8, event.pageX, event.pageY);
      } else {
        this.setCameraDistance(1.25, event.pageX, event.pageY);
      }
    });

    this.resize$
      .pipe(takeUntil(this.componentDestroyed$), startWith(null))
      .subscribe(() => this.setCameraPositionByResize());

    this.touchStart$
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe(([movementX, movementY]) => {
        this.setCameraPositionByMove(movementX, movementY, true);
      });

    this.pinchStart$
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe((event) => {
        this.setState((state) => ({
          ...state,
          centerX: event.coordinateX,
          centerY: event.coordinateY,
        }));
        this.setCameraDistance(
          event.scale,
          event.coordinateX,
          event.coordinateY
        );
      });
  }

  componentWillUnmount() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  handleToggleFullScreen() {
    document.documentElement.requestFullscreen();
  }

  render() {
    return this.isAspectRatioSupported() ? (
      <GameFieldContext.Provider
        value={{
          zoom: this.state.zoom,
          tileSize: this.state.tileSize,
        }}
      >
        <div
          className={style.camera}
          onMouseMove={(event) => this.mouseMove$.next(event)}
          onMouseLeave={() => this.mouseLeave$.next()}
          onMouseDown={() => this.mouseDown$.next()}
          onMouseUp={() => this.mouseUp$.next()}
          onWheel={(event) => this.wheel$.next(event)}
          onTouchMove={(event) => {
            this.touchMove$.next(event);
            this.pinch$.next(event);
          }}
          onTouchStart={() => {
            this.touchStart$.next();
            this.pinchStart$.next();
          }}
          onTouchEnd={() => this.pinchEnd$.next()}
        >
          <div
            className={style.background}
            onDragStart={(event) => event.preventDefault()}
            style={{
              ...this.state.backgroundSizeAndPosition,
              backgroundSize: this.state.tileSize,
            }}
          ></div>
          <div
            className={style.gameMap}
            onDragStart={(event) => event.preventDefault()}
            style={{
              ...this.state.mapSizeAndPosition,
              backgroundImage: `url(${this.props.mapSpritePath})`,
            }}
          >
            <div className={style.animations}>
              {this.props.animations.map((animation) => animation)}
            </div>
            {this.props.staticObjects.map((objects) =>
              objects.map((object) => object)
            )}
          </div>
        </div>
      </GameFieldContext.Provider>
    ) : (
      <div>Ez a képernyő típus nem támogatott.</div>
    );
  }
}