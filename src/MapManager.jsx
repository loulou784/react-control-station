import "leaflet/dist/leaflet.css";
import "./MapManager.css";
import { MapContainer, TileLayer, Marker, Polyline, Circle} from 'react-leaflet'
import { useState, useEffect, useRef, forwardRef } from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Table from 'react-bootstrap/Table';
import { Icon } from 'leaflet'
import "leaflet-rotatedmarker";

const droneIcon48 = new Icon({
    iconUrl: 'https://img.icons8.com/material/48/drone-bottom-view.png',
    iconSize: [48, 48], // size of the icon
    iconAnchor: [24, 24], // point of the icon which will correspond to marker's location
    popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
})

const droneIcon24 = new Icon({
    iconUrl: 'https://img.icons8.com/material/48/drone-bottom-view.png',
    iconSize: [24, 24], // size of the icon
    iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
    popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
})

const Coordinate = class {
    constructor(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    getLatitude() {
        return this.latitude;
    }

    getLongitude() {
        return this.longitude;
    }

    setLatitude(latitude) {
        this.latitude = latitude;
    }

    setLongitude(longitude) {
        this.longitude = longitude;
    }

    toString() {
        return `(${this.latitude}, ${this.longitude})`;
    }

    toArray() {
        return [this.latitude, this.longitude];
    }

    fromArray(array) {
        this.latitude = array[0];
        this.longitude = array[1];
    }
};
export default function MapManager({isInPlanningMode}) {

    const [currentHeading, setCurrentHeading] = useState(0)
    const [directToWPHeading, setDirectToWPHeading] = useState(0)
    const [targetHeading, setTargetHeading] = useState(0)
    const [GPSTrackHeading, setGPSTrackHeading] = useState(0)
    const [homeLocation, setHomeLocation] = useState(new Coordinate(0, 0))
    const [vehiculeLocation, setVehiculeLocation] = useState(new Coordinate(45.33052098976699, -71.98071994946895))
    const [missionWaypoints, setMissionWaypoints] = useState([])
    
    const inputFile = useRef(null) 

    const RotatedMarker = forwardRef(({ children, ...props }, forwardRef) => {
        const markerRef = useRef();

        const { rotationAngle, rotationOrigin } = props;
        useEffect(() => {
            const marker = markerRef.current;
            if (marker) {
                marker.setRotationAngle(rotationAngle);
                marker.setRotationOrigin(rotationOrigin);
            }
        }, [rotationAngle, rotationOrigin]);

        return (
            <Marker
                ref={(ref) => {
                    markerRef.current = ref;
                    if (forwardRef) {
                        forwardRef.current = ref;
                    }
                }}
                {...props}
            >
                {children}
            </Marker>
        );
    });
    RotatedMarker.displayName = "RotatedMarker";

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeading((currentHeading + 1) % 360);
        }, 10);
        return () => clearInterval(interval);
    }, [currentHeading]);

    function bearingAroundCoordinate(coordinate, radiusInM, angleInDegree) {
        var angleInRadian = -angleInDegree * Math.PI / 180;
        var radiusKm = radiusInM / 1000;
        var radiusLon = 1 / (111.319 * Math.cos(coordinate[0] * (Math.PI / 180))) * radiusKm;
        var radiusLat = 1 / 110.574 * radiusKm;
        return [coordinate[0] + radiusLat * Math.sin(angleInRadian), coordinate[1] + radiusLon * Math.cos(angleInRadian)]
    }

    const onLoadFileButtonClicked = () => {
        // `current` points to the mounted file input element
        inputFile.current.click();
    };

    const loadMissionFile = (e) => {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            var m = JSON.parse(text);
            console.log(JSON.stringify(m.mission.items))
            var waypoints = []
            for (var i = 1; i < m.mission.items.length; i++) {
                waypoints.push([m.mission.items[i].params[4], m.mission.items[i].params[5]])
            }
            setMissionWaypoints(waypoints);
        };
        reader.readAsText(e.target.files[0]);

    };

    return (
        <>
            <div id='mapContainer' className='fill-height p-0'>
                <MapContainer center={vehiculeLocation.toArray()} zoom={18} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                    <RotatedMarker position={vehiculeLocation.toArray()} rotationAngle={currentHeading} rotationOrigin="center" icon={droneIcon24}></RotatedMarker>
                    <Polyline pathOptions={{ color: 'red' }} positions={[vehiculeLocation.toArray(), bearingAroundCoordinate(vehiculeLocation.toArray(), 250, currentHeading)]} />
                    <Polyline pathOptions={{ color: 'darkorange' }} positions={[vehiculeLocation.toArray(), bearingAroundCoordinate(vehiculeLocation.toArray(), 250, directToWPHeading)]} />
                    <Polyline pathOptions={{ color: 'forestgreen' }} positions={[vehiculeLocation.toArray(), bearingAroundCoordinate(vehiculeLocation.toArray(), 250, targetHeading)]} />
                    <Polyline pathOptions={{ color: 'black' }} positions={[vehiculeLocation.toArray(), bearingAroundCoordinate(vehiculeLocation.toArray(), 250, GPSTrackHeading)]} />
                    <Polyline pathOptions={{ color: 'purple' }} positions={missionWaypoints} />
                </MapContainer>

                <div id="waypointParameterContainer" className={isInPlanningMode ? "" : "hidden"}>
                    <input type='file' id='file' ref={inputFile} onChange={loadMissionFile} style={{ display: 'none' }} />
                    <Container fluid>
                        <Row>
                            <Button variant="primary" size="sm" onClick={onLoadFileButtonClicked}>Load</Button>
                        </Row>
                    </Container>
                </div>
                <div id='legend'>
                    <span>&copy; Alex Morin / </span>
                    <span className='colorCurrentHeading'>Current Heading</span>
                    <span> / </span>
                    <span className='colorDirectToWP'>Direct to current WP</span>
                    <span> / </span>
                    <span className='colorTargetHeading'>Target Heading</span>
                    <span> / </span>
                    <span className='colorGPSTrack'>GPS Track</span>
                </div>
            </div>
        </>
    )
}