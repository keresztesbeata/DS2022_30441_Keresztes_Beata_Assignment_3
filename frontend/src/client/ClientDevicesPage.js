import React, {Component} from 'react';
import {ClientDevicesTable} from "./components/ClientDevicesTable";
import {ClientNavigationMenu} from "./components/ClientNavigationMenu";

export class ClientDevicesPage extends Component {
    render() {
        const columns = [{
            Header: 'ID',
            accessor: 'id'
        }, {
            Header: 'Address',
            accessor: 'address'
        }, {
            Header: 'Description',
            accessor: 'description'
        }, {
            Header: 'Max energy consumption',
            accessor: 'maxEnergyConsumption'
        }]
        return (
            <div className="page-container">
                <ClientNavigationMenu/>
                <ClientDevicesTable columns={columns}/>
            </div>
        );
    }
}
