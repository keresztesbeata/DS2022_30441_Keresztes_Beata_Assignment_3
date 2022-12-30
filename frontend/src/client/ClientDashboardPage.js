import React from 'react';
import {ClientNavigationMenu} from "./components/ClientNavigationMenu";
import {ClientChatComponent} from "../chat/ClientChatComponent";

export const ClientDashboardPage = () => {
    return (
        <div className="page-container d-flex client-dashboard-bg">
            <ClientNavigationMenu/>
            <div className={"mt-4"}>
                <ClientChatComponent/>
            </div>
        </div>
    );
}
