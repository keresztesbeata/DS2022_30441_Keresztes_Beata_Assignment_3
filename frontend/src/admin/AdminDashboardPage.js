import React, {Component} from 'react';
import {AdminNavigationMenu} from "./components/AdminNavigationMenu";

export class AdminDashboardPage extends Component {
    render() {
        return (
            <div className="d-flex admin-dashboard-bg">
                <AdminNavigationMenu/>
            </div>
        );
    }
}
