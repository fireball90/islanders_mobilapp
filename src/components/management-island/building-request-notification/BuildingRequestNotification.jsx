import Card from 'react-bootstrap/Card';
import { CloseButton } from 'react-bootstrap';

import "./BuildingRequestNotification.css"
import { useContext } from 'react';
import IslandContext from '../../../contexts/IslandContext';

export default function BuildingRequestNotification () {
    const { buildingToBeBuild, interruptBuildingRequest } = useContext(IslandContext);

    return (
        <div className="building-notification">
            <Card style={{ width: '18rem' }} className="border-0 rounded-0 bg-transparent">
                <Card.Body className="d-flex justify-content-between">
                    <span className="text-white">
                        Készülsz megépíteni ezt az épületet: <b>{ buildingToBeBuild.name }</b>
                    </span>
                    <button className="building-request-close" onClick={() => interruptBuildingRequest()}/> 
                </Card.Body>
            </Card>
        </div>
    )
}