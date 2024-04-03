import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import './Header.css';

const Header = ({ onToggleOffCanvas, onConnectButtonClicked, isConnectedToAp, onPlanningModeChange }) => {
    const [isWebSerialAvailable, setIsWebSerialAvailable] = useState(navigator.serial != null)
    const [serialBaudRate, setSerialBaudRate] = useState(57600)
    const [webSocketAddress, setWebSocketAddress] = useState("")
    const [selectedCommunicationType, setSelectedCommunicationType] = useState("WebSocket")
    const [inPlanningMode, setInPlanningMode] = useState(false)

    return (
        <>
            <Navbar onToggle={() => console.log("onCollapse")} expand="md" sticky="top" bg="dark" data-bs-theme="dark">
                <Container fluid>
                    <Navbar.Brand>React Control Station</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link onClick={() => { onToggleOffCanvas() }}>Settings</Nav.Link>
                            <Nav.Link onClick={() => { setInPlanningMode(!inPlanningMode); onPlanningModeChange(!inPlanningMode) }}>{!inPlanningMode ? "Planning" : "Driving" }</Nav.Link>
                        </Nav>
                        <Form className="d-flex">
                            
                            {isWebSerialAvailable == true &&
                                <Form.Select disabled={isConnectedToAp} value={selectedCommunicationType} className="me-2" aria-label="Default select example" onChange={e => { setSelectedCommunicationType(e.target.value); console.log(e.target.value) }}>
                                    <option value="WebSerial">WebSerial</option>
                                    <option value="WebSocket">WebSocket</option>
                                </Form.Select>
                            }

                            {selectedCommunicationType == "WebSerial" && isWebSerialAvailable == true &&
                                <Form.Select disabled={isConnectedToAp} className="me-2" aria-label="Default select example" value={serialBaudRate} onChange={e => { setSerialBaudRate(e.target.value); console.log(e.target.value) }}>
                                    <option value="1200">1200</option>
                                    <option value="2400">2400</option>
                                    <option value="4800">4800</option>
                                    <option value="9600">9600</option>
                                    <option value="19200">19200</option>
                                    <option value="38400">38400</option>
                                    <option value="57600">57600</option>
                                    <option value="111100">111100</option>
                                    <option value="115200">115200</option>
                                    <option value="230400">230400</option>
                                    <option value="460800">460800</option>
                                    <option value="500000">500000</option>
                                    <option value="625000">625000</option>
                                    <option value="921600">921600</option>
                                    <option value="1000000">1000000</option>
                                    <option value="1500000">1500000</option>
                                </Form.Select>
                            }

                            {(selectedCommunicationType == "WebSocket" || !isWebSerialAvailable) &&
                                <Form.Control disabled={isConnectedToAp} value={webSocketAddress} onChange={e => setWebSocketAddress(e.target.value)} className="me-2" type="text" placeholder="ws://address:[port]" />
                            }

                            <Button variant={isConnectedToAp ? "danger" : "success"} onClick={() => { onConnectButtonClicked(selectedCommunicationType, serialBaudRate, webSocketAddress) }}>{isConnectedToAp ? "Disconnect" : "Connect"}</Button>
                        </Form>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    )
}

Header.propTypes = {
    isConnectedToAp: PropTypes.bool,
    onPlanningModeChange: PropTypes.func,
    onToggleOffCanvas: PropTypes.func,
    onConnectButtonClicked: PropTypes.func
};

export default Header
