import React, {Component} from 'react'
import {Button, Modal} from 'react-bootstrap'

export const INFO = {name: "Information!", style: "info-modal"};
export const SUCCESS = {name: "Success!", style: "success-modal"};
export const WARNING = {name: "Warning!", style: "warning-modal"};
export const ERROR = {name: "Error!", style: "error-modal"};

export class ModalNotification extends Component {
    render() {
        return (
            <Modal show={this.props.notification.show}
                   onHide={this.props.onHide}
                   size="lg"
                   aria-labelledby="contained-modal-title-vcenter"
                   centered>
                <Modal.Header closeButton className={this.props.notification.type.style}>
                    <Modal.Title>{this.props.notification.type.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>{this.props.notification.message}</strong></p>
                    {
                        (this.props.notification.fields) ?
                            <>
                                {
                                    this.props.notification.fields.map((e) =>
                                        <p>{e.field} - {e.message}</p>)
                                }
                            </>
                            :
                            <div/>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.props.onHide}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}