import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from "react";
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Card from 'react-bootstrap/Card';
import { Rnd } from "react-rnd";
import { AttitudeIndicator, HeadingIndicator } from "react-typescript-flight-indicators";
import './App.css';
import MapManager from './MapManager.jsx';
import Header from './Header.jsx';
import { useMavlinkConnection } from "./MavlinkConnection.jsx";

const AppContext = {
    errorMessage: "",
};


function App() {

    const [width, setWidth] = useState(window.innerWidth)
    const [height, setHeight] = useState(window.innerHeight)
    const [width_rnd, setWidth_rnd] = useState(250)
    const [height_rnd, setHeight_rnd] = useState(125)
    const [posXrnd, setPosXrnd] = useState(width - width_rnd - 5)
    const [posYrnd, setPosYrnd] = useState(height - height_rnd - 5)

    const [showOffConvas, setShowOffCanvas] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [pitch, setPitch] = useState(0.0);
    const [yaw, setYaw] = useState(0.0);
    const [roll, setRoll] = useState(0.0);


    const [inPlanningMode, setInPlanningMode] = useState(false);

    const mavlinkComm = useMavlinkConnection({
        onData: data => {
            if (data.constructor.name == "Attitude") {
                setPitch(data.pitch * (180.0 / Math.PI))
                setYaw((data.yaw - 3.14) / 6.28 * 360)
                setRoll(data.roll * (180.0 / Math.PI))
            }
        },
        onError: error => {
            AppContext.errorMessage = error.toString();
            setShowModal(true)
        }
    })

    async function connectToAP(type, baud, address) {
        if (type == "WebSerial") {
            if (mavlinkComm.isConnectedToSerial) {
                console.log("Disconnecting to WebSerial")
                mavlinkComm.disconnectWebSerial()
            } else {
                console.log("Connecting to WebSerial")
                mavlinkComm.connectWebSerial(baud)
            } 
        } else if (type == "WebSocket") {
            if (mavlinkComm.isConnectedToWebSocket) {
                console.log("Disconnecting to WebSocket")
                mavlinkComm.disconnectWebSocket()
            } else {
                console.log("Connecting to WebSocket")
                mavlinkComm.connectWebSocket(address)
            } 
        }
    }

    return (
        <>
            <Header onPlanningModeChange={(planningMode) => setInPlanningMode(planningMode)} isConnectedToAp={mavlinkComm.isConnectedToSerial || mavlinkComm.isConnectedToWebSocket} onToggleOffCanvas={() => setShowOffCanvas(true)} onConnectButtonClicked={async (type, baud, address) => connectToAP(type, baud, address) } />

            <Offcanvas show={showOffConvas} onHide={() => setShowOffCanvas(false)} data-bs-theme="dark">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Settings</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Tabs defaultActiveKey="home" id="fill-tab-example" className="mb-1" justify
                    >
                        <Tab eventKey="home" title="Home">
                            Tab content for Home
                        </Tab>
                        <Tab eventKey="profile" title="Profile">
                            Tab content for Profile
                        </Tab>
                        <Tab eventKey="magic" title="Magic">
                            Tab content for Magic
                        </Tab>
                        <Tab eventKey="parameter" title="Parameter">
                            <Accordion>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>Accordion Item #1</Accordion.Header>
                                    <Accordion.Body>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                                        minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                                        aliquip ex ea commodo consequat. Duis aute irure dolor in
                                        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                                        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                                        culpa qui officia deserunt mollit anim id est laborum.
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>Accordion Item #2</Accordion.Header>
                                    <Accordion.Body>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                                        minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                                        aliquip ex ea commodo consequat. Duis aute irure dolor in
                                        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                                        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                                        culpa qui officia deserunt mollit anim id est laborum.
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Tab>
                    </Tabs>
                </Offcanvas.Body>
            </Offcanvas>

            <MapManager isInPlanningMode={inPlanningMode} />

            <Rnd className={inPlanningMode ? "hidden" : ""} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "solid 4px #4D5061",
                background: "#30323D",
                borderRadius: height_rnd,
                zIndex: 100,
                color: "#E8C547"
            }}
                maxWidth={500}
                maxHeight={250}
                minWidth={100}
                minHeight={50}
                default={{ x: posXrnd, y: posYrnd, z: 1, width: width_rnd, height: height_rnd }}
                lockAspectRatio={true}
                bounds=".leaflet-container"
            >
                <AttitudeIndicator roll={roll} pitch={pitch} showBox={false} />
                <HeadingIndicator heading={yaw} showBox={false} />
            </Rnd>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Serial port error</Modal.Title>
                </Modal.Header>
                <Modal.Body>{AppContext.errorMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default App
