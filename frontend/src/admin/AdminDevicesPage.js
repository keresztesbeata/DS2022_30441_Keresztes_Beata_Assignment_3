import React, {Component} from 'react';
import {AdminNavigationMenu} from "./components/AdminNavigationMenu";
import {GeneralTable} from "./components/GeneralTable";
import {CREATE_REQUIRED_FIELD, DEVICE_ENTITY, EDIT_FIELD, VIEW_FIELD} from "./components/Constants";

export class AdminDevicesPage extends Component {
    render() {
        const columns = [{
            Header: 'ID',
            accessor: 'id',
            options: [VIEW_FIELD]
        }, {
            Header: 'Address',
            accessor: 'address',
            options: [VIEW_FIELD, EDIT_FIELD, CREATE_REQUIRED_FIELD]
        }, {
            Header: 'Description',
            accessor: 'description',
            options: [VIEW_FIELD, EDIT_FIELD, CREATE_REQUIRED_FIELD]
        }, {
            Header: 'Max energy consumption',
            accessor: 'maxEnergyConsumption',
            options: [VIEW_FIELD, EDIT_FIELD, CREATE_REQUIRED_FIELD]
        }, {
            Header: 'Account ID',
            accessor: 'accountId',
            options: [VIEW_FIELD]
        }]
        const filters = ['id', 'address', 'description', 'accountId'];
        return (
            <div className="page-container">
                <AdminNavigationMenu/>
                <GeneralTable type={DEVICE_ENTITY} columns={columns} filters={filters}/>
            </div>
        );
    }
}
