import { Component, PureComponent } from 'react';
import { AnimateKeyframes } from 'react-simple-animate'
import GameFieldContext from '../../../contexts/GameFieldContext';

import './NPC.css'

export default class NPC extends PureComponent {
    static contextType = GameFieldContext;
    
    // eslint-disable-next-line no-useless-constructor
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div
                style={{
                    width: this.context.tileSize,
                    height: this.context.tileSize
                }}
                className="npc"
            >
                <AnimateKeyframes
                    play
                    duration={this.props.duration}
                    direction="normal"
                    easeType="step-end"
                    keyframes={this.props.walkingKeyframes}
                />
            </div>
        )
    }
}