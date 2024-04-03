'use client';
import React from 'react';
import { useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { useWebSerial } from "@mniota/react-webserial-hook";
import ProgressBar from 'react-bootstrap/ProgressBar';

export default function Headerbar() {
    const serial = useWebSerial({
        onData: data => {
          const decoder = new TextDecoder();
          console.log(decoder.decode(data));
        }
    })

    return (
        <>
            <Navbar collapseOnSelect expand="sm" sticky="top" bg="dark" data-bs-theme="dark">
                <Container fluid>
                    <Navbar.Brand>React Control Station</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="#features">Features</Nav.Link>
                            <Nav.Link href="#pricing">Pricing</Nav.Link>
                            <Button variant="success" onClick={() => serial.requestPort()}>Request</Button>{' '}
                            <Button variant="warning" onClick={() => serial.openPort()}>Open</Button>{' '}
                            <Button variant="danger" onClick={() => serial.startReading()}>Read</Button>{' '}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    )
}