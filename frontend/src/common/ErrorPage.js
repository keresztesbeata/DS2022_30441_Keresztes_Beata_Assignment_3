import React from "react";
import {Modal} from "react-bootstrap";

export function ErrorPage({message, fields}) {
    return (
        <div className="background-container bg-image d-flex justify-content-center align-items-center">
            <Modal.Dialog>
                <Modal.Header>
                    <Modal.Title>{message}</Modal.Title>
                </Modal.Header>
                {
                    (fields) ?
                        <Modal.Body>
                            <>
                                {
                                    fields.map((e) =>
                                        <p>{e.field} - {e.message}</p>)
                                }
                            </>
                        </Modal.Body>
                        :
                        <div/>
                }
            </Modal.Dialog>
        </div>
    );
}
