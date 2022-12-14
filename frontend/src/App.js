import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.css';
import {LoginPage} from "./common/LoginPage";
import {RegisterPage} from "./common/RegisterPage";
import HomePage from "./home/HomePage";
import {ADMIN_ROLE, CLIENT_ROLE, isLoggedIn, ProtectedComponent} from "./common/auth/Authentication";
import {AdminDashboardPage} from "./admin/AdminDashboardPage";
import {ClientDashboardPage} from "./client/ClientDashboardPage";
import {AdminAccountsPage} from "./admin/AdminAccountsPage";
import {AdminDevicesPage} from "./admin/AdminDevicesPage";
import {ErrorPage} from "./common/ErrorPage";
import {AdminLinkDevicePage} from "./admin/AdminLinkDevicePage";
import {ClientDevicesPage} from "./client/ClientDevicesPage";
import {ClientEnergyConsumptionPage} from "./client/ClientEnergyConsumptionPage";

export default function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/admin"
                           element={<ProtectedComponent component={<AdminDashboardPage/>} authority={ADMIN_ROLE}/>}/>
                    <Route path="/client"
                           element={<ProtectedComponent component={<ClientDashboardPage/>} authority={CLIENT_ROLE}/>}/>
                    <Route path="/login" element={isLoggedIn() ? <HomePage/> : <LoginPage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>
                    <Route path="/admin/accounts"
                           element={<ProtectedComponent component={<AdminAccountsPage/>} authority={ADMIN_ROLE}/>}/>
                    <Route path="/admin/devices"
                           element={<ProtectedComponent component={<AdminDevicesPage/>} authority={ADMIN_ROLE}/>}/>
                    <Route path="/admin/link_device"
                           element={<ProtectedComponent component={<AdminLinkDevicePage/>} authority={ADMIN_ROLE}/>}/>
                    <Route path="/client/devices"
                           element={<ProtectedComponent component={<ClientDevicesPage/>} authority={CLIENT_ROLE}/>}/>
                    <Route path="/client/energy_consumption"
                           element={<ProtectedComponent component={<ClientEnergyConsumptionPage/>} authority={CLIENT_ROLE}/>}/>
                    <Route path='/error' element={<ErrorPage/>}/>
                    <Route element={<ErrorPage message={"Page not found!"}/>}/>
                </Routes>
            </BrowserRouter>
        </>
    );
}
