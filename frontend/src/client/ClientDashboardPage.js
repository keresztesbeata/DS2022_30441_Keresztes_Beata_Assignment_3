import React, {Component} from 'react';
import {ClientNavigationMenu} from "./components/ClientNavigationMenu";
import {ChatComponent} from "../chat/ChatComponent";

export class ClientDashboardPage extends Component {
    render() {
        return (
            <div className="page-container d-flex client-dashboard-bg">
                <ClientNavigationMenu/>
                <div className={"mt-4"}>
                    <ChatComponent/>
                </div>
            </div>
        );
    }
}
