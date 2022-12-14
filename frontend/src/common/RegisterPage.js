import React, {Component} from 'react';
import {Link} from 'react-router-dom'
import {Button, FormControl, FormGroup, FormLabel, FormSelect} from "react-bootstrap";
import {ERROR, ModalNotification, SUCCESS} from "./components/ModalNotification";
import {Register} from "./auth/Authentication";
import validate from "./components/validator/FormValidator";

export class RegisterPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formControls: {
                name: {
                    value: "",
                    placeholder: "Enter name...",
                    valid: false,
                    validationRules: {
                        minLength: 3,
                        isRequired: true
                    }
                },
                username: {
                    value: "",
                    placeholder: "Enter username...",
                    valid: false,
                    validationRules: {
                        minLength: 3,
                        isRequired: true,
                        checkInvalidCharacters: true,
                    }
                },
                role: {
                    value: "",
                    placeholder: "Select role...",
                    valid: false,
                    validationRules: {
                        isRequired: true
                    }
                },
                password: {
                    value: "",
                    placeholder: "Enter name...",
                    valid: false,
                    validationRules: {
                        minLength: 3,
                        isRequired: true,
                        hasDigit: true,
                        checkInvalidCharacters: true,
                    }
                }
            },
            formIsValid: false,
            notification: {
                show: false,
                type: ERROR,
                message: "",
                fields: []
            }
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.hideNotification = this.hideNotification.bind(this);
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

    handleSubmit(event) {
        event.preventDefault();

        let account = {
            name: this.state.formControls.name.value,
            username: this.state.formControls.username.value,
            password: this.state.formControls.password.value,
            role: this.state.formControls.role.value
        };

        Register(account)
            .then(() => {
                this.setState({
                    ...this.state,
                    notification: {
                        show: true,
                        type: SUCCESS,
                        message: "Successful registration! Please log in!"
                    }
                })
            })
            .catch(error => {
                this.setState({
                    ...this.state,
                    notification: {
                        show: true,
                        type: ERROR,
                        message: error.message,
                        fields: error.errors
                    }
                })
            });
    }

    handleInputChange(event) {
        const name = event.target.name;
        const value = event.target.value;
        const updatedControls = this.state.formControls;
        const updatedFormElement = updatedControls[name];

        updatedFormElement.value = value;
        updatedFormElement.valid = validate(value, updatedFormElement.validationRules);
        updatedControls[name] = updatedFormElement;

        let formIsValid = true;
        for (let updatedFormElementName in updatedControls) {
            formIsValid = updatedControls[updatedFormElementName].valid && formIsValid;
        }

        this.setState({
            formControls: updatedControls,
            formIsValid: formIsValid
        });
    }

    render() {
        return (
            <div className="background-container page-background d-flex justify-content-center align-items-center">
                <div className="card col-sm-3 border-dark text-left">
                    <form onSubmit={this.handleSubmit} className="card-body">
                        <h3 className="card-title">Register</h3>
                        {this.state.notification.show ?
                            <ModalNotification notification={this.state.notification} onHide={this.hideNotification}/> :
                            <div/>}
                        <FormGroup className="mb-3" controlId="1">
                            <FormLabel>Name</FormLabel>
                            <FormControl type="text" name="name"
                                         placeholder={this.state.formControls.name.placeholder}
                                         value={this.state.formControls.name.value}
                                         required
                                         isValid={this.state.formControls.name.valid}
                                         onChange={this.handleInputChange}/>
                        </FormGroup>
                        <FormGroup className="mb-3" controlId="2">
                            <FormLabel>Role</FormLabel>
                            <FormSelect name="role"
                                        placeholder={this.state.formControls.role.placeholder}
                                        value={this.state.formControls.role.value}
                                        isValid={this.state.formControls.role.valid}
                                        required
                                        onChange={this.handleInputChange}>
                                <option value="">-- Choose role --</option>
                                <option value="ADMIN">Admin</option>
                                <option value="CLIENT">Client</option>
                            </FormSelect>
                        </FormGroup>
                        <FormGroup className="mb-3" controlId="3">
                            <FormLabel>Username</FormLabel>
                            <FormControl type="text" name="username"
                                         placeholder={this.state.formControls.username.placeholder}
                                         value={this.state.formControls.username.value}
                                         isValid={this.state.formControls.username.valid}
                                         required
                                         onChange={this.handleInputChange}/>
                        </FormGroup>
                        <FormGroup className="mb-3" controlId="4">
                            <FormLabel>Password</FormLabel>
                            <FormControl type="password" name="password"
                                         placeholder={this.state.formControls.username.placeholder}
                                         value={this.state.formControls.password.value}
                                         isValid={this.state.formControls.password.valid}
                                         required
                                         onChange={this.handleInputChange}/>
                        </FormGroup>
                        <div className="text-center">
                            <Button variant="secondary" type="submit" disabled={!this.state.formIsValid}>
                                Register
                            </Button>
                        </div>
                        <center>
                            Already have an account?
                            <Link to={"/login"}>Log in</Link>
                        </center>
                    </form>
                </div>
            </div>
        );
    }
}
