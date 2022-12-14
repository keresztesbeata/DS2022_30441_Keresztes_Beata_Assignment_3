import React from 'react';
import {ADMIN_ROLE, CLIENT_ROLE, isAuthorized} from "../common/auth/Authentication";
import {AdminDashboardPage} from "../admin/AdminDashboardPage";
import {ClientDashboardPage} from "../client/ClientDashboardPage";
import WelcomePage from "./WelcomePage";

export default function HomePage() {
    return (
        isAuthorized(ADMIN_ROLE) ? <AdminDashboardPage/> :
            isAuthorized(CLIENT_ROLE) ? <ClientDashboardPage/> : <WelcomePage/>
    );
}
