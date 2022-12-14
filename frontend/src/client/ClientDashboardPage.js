import React, {Component} from 'react';
import {ClientNavigationMenu} from "./components/ClientNavigationMenu";

export class ClientDashboardPage extends Component {
    render() {
        return (
            <div className="d-flex client-dashboard-bg">
                <ClientNavigationMenu/>
            </div>
        );
    }
}
