import React, {Component} from 'react';
import {FormSelect} from "react-bootstrap";

export class GeneralListComponent extends Component {
    render() {
        return (
            <FormSelect onChange={e => this.props.onSelect(e.target.value)}>
                {
                    this.props.items.map(item =>
                        <option key={item.id} value={item.id}>
                            {
                                this.props.fields.map(field => item[field]).join(", ")
                            }
                        </option>
                    )
                }
            </FormSelect>
        )
    }
}
