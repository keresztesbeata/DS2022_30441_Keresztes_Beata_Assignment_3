import React, {Component} from 'react';
import {AdminNavigationMenu} from "./components/AdminNavigationMenu";
import {AdminChatComponent} from "../chat/AdminChatComponent";


export class AdminDashboardPage extends Component {
    render() {
        return (
            <div className="page-container d-flex admin-dashboard-bg">
                <AdminNavigationMenu/>
                <div className={"mt-4"}>
                    <AdminChatComponent/>
                </div>
            </div>
        );
    }
}
