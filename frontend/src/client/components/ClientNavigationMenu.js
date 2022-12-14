import React from 'react'
import {Nav} from "react-bootstrap";
import {Logout} from "../../common/auth/Authentication";

export class ClientNavigationMenu extends React.Component {
    render() {
        return (
            <div className="side-nav">
                <Nav defaultActiveKey="/client" className="flex-column">
                    <Nav.Link href="/client"><h5 className="gap-3 mb-5 mt-5">Online Energy Utility Platform</h5></Nav.Link>
                    <Nav.Link href="/client/devices">My Devices</Nav.Link>
                    <Nav.Link href="/client/energy_consumption">Energy consumption</Nav.Link>
                    <Nav.Link onClick={Logout}>Logout</Nav.Link>
                </Nav>
            </div>
        )
    }
}