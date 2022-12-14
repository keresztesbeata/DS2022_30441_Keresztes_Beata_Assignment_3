import React, {Component} from 'react';
import {Link} from 'react-router-dom'
import {Button, FormControl, FormGroup, FormLabel} from "react-bootstrap";
import {ERROR, ModalNotification} from "./components/ModalNotification";
import {Login} from "./auth/Authentication";

export class LoginPage extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            data: {
                username: "",
                password: "",
            },
            notification: {
                show: false,
                type: ERROR,
                message: "",
                fields: []
            }
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.hideNotification = this.hideNotification.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();

        Login(this.state.data.username, this.state.data.password)
            .catch(error => {
                    this.setState({
                        ...this.state,
                        notification: {
                            show: true,
                            type: ERROR,
                            message: error.message
                        }
                    })
                }
            );
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

    handleInputChange(event) {
        this.setState({
            ...this.state,
            data: {
                ...this.state.data,
                [event.target.name]: event.target.value
            },
            notification: {
                show: false,
            }
        });
    }

    render() {

        return (
            <div className="background-container page-background d-flex justify-content-center align-items-center">
                <div className="card col-sm-3 border-dark text-left">
                    <form onSubmit={this.handleSubmit} className="card-body">
                        <h3 className="card-title">Log in</h3>
                        {this.state.notification.show ? <ModalNotification notification={this.state.notification} onHide={this.hideNotification}/> :
                            <div/>}
                        <FormGroup className="mb-3" controlId="formBasicText">
                            <FormLabel>Username</FormLabel>
                            <FormControl type="text" placeholder="Enter username" name="username" required
                                         onChange={this.handleInputChange}/>
                        </FormGroup>
                        <FormGroup className="mb-3" controlId="formBasicPassword">
                            <FormLabel>Password</FormLabel>
                            <FormControl type="password" placeholder="Enter Password" name="password" required
                                         onChange={this.handleInputChange}/>
                        </FormGroup>
                        <div className="text-center">
                            <Button variant="secondary" type="submit">
                                Log in
                            </Button>
                        </div>
                        <center>
                            Don't have an account?
                            <Link to={"/register"}>Register now</Link>
                        </center>
                    </form>
                </div>
            </div>
        );
    }
}
