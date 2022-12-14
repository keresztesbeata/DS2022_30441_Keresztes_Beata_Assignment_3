import React, {Component} from 'react';
import {AdminNavigationMenu} from "./components/AdminNavigationMenu";
import {GeneralTable} from "./components/GeneralTable";
import {ACCOUNT_ENTITY, CREATE_REQUIRED_FIELD, EDIT_FIELD, VIEW_FIELD} from "./components/Constants";

export class AdminAccountsPage extends Component {
    render() {
        const columns = [{
            Header: 'ID',
            accessor: 'id',
            options: [VIEW_FIELD]
        }, {
            Header: 'Name',
            accessor: 'name',
            options: [VIEW_FIELD, EDIT_FIELD, CREATE_REQUIRED_FIELD]
        }, {
            Header: 'Username',
            accessor: 'username',
            options: [VIEW_FIELD, EDIT_FIELD, CREATE_REQUIRED_FIELD]
        }, {
            Header: 'Password',
            accessor: 'password',
            options: [EDIT_FIELD, CREATE_REQUIRED_FIELD]
        }, {
            Header: 'Role',
            accessor: 'role',
            isCategorical: true,    // the field can have a discrete set of values
            categories: ['ADMIN', 'CLIENT'], // the set of values reserved for the field
            options: [VIEW_FIELD, CREATE_REQUIRED_FIELD]
        }]
        const filters = ['id', 'name', 'username', 'role']
        return (
            <div className="page-container">
                <AdminNavigationMenu/>
                <GeneralTable type={ACCOUNT_ENTITY} columns={columns} filters={filters}/>
            </div>
        );
    }
}
