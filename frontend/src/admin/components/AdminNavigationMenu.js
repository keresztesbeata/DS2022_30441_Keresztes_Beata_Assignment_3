import React from 'react'
import {Nav} from "react-bootstrap";
import {Logout} from "../../common/auth/Authentication";

export class AdminNavigationMenu extends React.Component {
    render() {
        return (
            <div className="side-nav">
                <Nav defaultActiveKey="/admin" className="flex-column">
                    <Nav.Link href="/admin"><h5 className="gap-3 mb-5 mt-5">Online Energy Utility Platform</h5></Nav.Link>
                    <Nav.Link href="/admin/accounts">Manage Users</Nav.Link>
                    <Nav.Link href="/admin/devices">Manage Devices</Nav.Link>
                    <Nav.Link href="/admin/link_device">Link Devices to Users</Nav.Link>
                    <Nav.Link onClick={Logout}>Logout</Nav.Link>
                </Nav>
            </div>
        )
    }
}