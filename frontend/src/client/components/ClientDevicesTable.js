import React, {Component} from 'react';
import {Table} from "react-bootstrap";
import {ERROR} from "../../common/components/ModalNotification";
import {GetDevicesOfClient} from "../api/ClientApi";

export class ClientDevicesTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            notification: {
                show: false,
                type: ERROR,
                message: "",
                fields: []
            }
        }
        this.onLoad = this.onLoad.bind(this);
        this.hideNotification = this.hideNotification.bind(this);
        this.onError = this.onError.bind(this);
    }

    onError(error) {
        this.setState({
            ...this.state,
            notification: {
                show: true,
                type: ERROR,
                message: error.message,
                fields: error.errors
            }
        });
    }

    onLoad() {
        GetDevicesOfClient()
            .then(data => {
                this.setState({
                    ...this.state,
                    data: data,
                    notification: {
                        show: false
                    }
                });
            })
            .catch(error => this.onError(error));
    }

    componentDidMount() {
        this.onLoad();
    }

    hideNotification() {
        this.setState({
            ...this.state,
            notification: {
                ...this.state.notification,
                show: false
            }
        });
    }

    render() {
        return (
            <div className="table-container">
                <Table data={this.state.data} striped hover responsive>
                    <thead>
                    <tr>
                        {
                            this.props.columns.map(col =>
                                <th>{col.Header}</th>
                            )
                        }
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.data.map(elem =>
                            <tr id={elem.id}>
                                {
                                    this.props.columns.map(col =>
                                        <td>{elem[col.accessor]}</td>
                                    )
                                }
                            </tr>
                        )
                    }
                    </tbody>
                </Table>
            </div>
        );
    }
}
