import React, { Component } from "react";
import GameFieldContext from "../../../contexts/GameFieldContext";
import { OverlayTrigger } from "react-bootstrap";
import MovablePopover from "../../management-island/movable-popover/MovablePopover";
import { Image } from "react-bootstrap";

import "./EnemyIsland.css";

export class EnemyIsland extends Component {
  static contextType = GameFieldContext;

  constructor(props) {
    super(props);

    this.state ={
      show: false
    }

    // Triggereli a popupot, hogy betöltés után rögtön megjelenjen
    setTimeout(() => {
      this.setState((state) => ({
        ...state,
        show: true
      }))
    })

    this.ref = React.createRef();
  }

  healthDifferent() {
    const healthDifferent = this.props.enemy.health - this.props.myHealth;

    if (healthDifferent > 0) {
      return <div><span className="text-success">+{healthDifferent}</span> többlet élet</div>
    } else if (healthDifferent < 0) {
      return <div><span className="text-danger">{healthDifferent}</span> többlet élet</div>
    } else {
      return <div><span className="text-warning">{healthDifferent}</span> többlet élet</div>
    }
  }

  render() {
    return (
      <div
        ref={this.ref}
        onClick={() => this.props.setAttackedEnemy(this.props.enemy)}
        className="enemy-island"
        style={{ backgroundImage: `url(${this.props.enemy.spritePath})` }}
      >
        <OverlayTrigger
          show={this.state.show}
          container={this.ref}
          trigger={null}
          overlay={
            <MovablePopover zoom={this.context.zoom}>
              <div className="enemy-island-hud">
                <Image src={this.props.enemy.profileImage} />
                <div className="enemy-data">
                  <div className="title">
                    <span>
                      {this.props.enemy.username}
                    </span>
                    <span className="text-warning">
                      {this.props.enemy.level}. SZINT
                    </span>
                  </div>
                  <div>{ this.healthDifferent() }</div>
                </div>
              </div>
            </MovablePopover>
          }
        >
          <div></div>
        </OverlayTrigger>
      </div>
    );
  }
}