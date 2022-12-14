import React, {Component} from 'react';
import {Filter, GetAll} from "../api/AdminApi";
import {Button, FormControl, FormLabel, FormSelect, InputGroup} from "react-bootstrap";
import {GeneralListComponent} from "./GeneralListComponent";

export class GeneralFilterComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            selectedFilter: this.isEmpty(this.props.filters)? "" : this.props.filters[0],
            filterValue: "",
            selectedItem: null
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.isEmpty = this.isEmpty.bind(this);
    }

    isEmpty(array) {
        return array === null || array.length === 0;
    }

    componentDidMount() {
        // get all entities
        GetAll(this.props.type, this.props.userRole)
            .then(data => {
                this.setState({
                    ...this.state,
                    items: data,
                    hasError: false
                });
                this.selectFirst(data);
            })
            .catch(error => this.props.errorHandler(error));
    }

    selectFirst(data) {
        if (this.props.showList && !this.isEmpty(data)) {
            this.props.onSelect(data[0].id)
        }
    }

    handleInputChange(event) {
        this.setState({
            ...this.state,
            [event.target.name]: event.target.value
        });
    }

    onSearch() {
        // check if filter is set
        ((this.state.selectedFilter === null || this.state.filterValue === null || this.state.filterValue.trim() === '') ?
                GetAll(this.props.type, this.props.userRole)
                :
                Filter(this.props.type, this.state.selectedFilter, this.state.filterValue, this.props.userRole)
        )
            .then(data => {
                this.setState({
                    ...this.state,
                    items: data,
                    hasError: false
                });
                this.selectFirst(data);
                // pass the list of filtered items to the parent's callback function
                if (this.props.afterSearch) {
                    this.props.afterSearch(data);
                }
            })
            .catch(error => this.props.errorHandler(error));
    }

    render() {
        return (
            <div>
                <InputGroup className="gap-3 mb-3">
                    <FormLabel>Search by </FormLabel>
                    <FormSelect name="selectedFilter" onChange={this.handleInputChange}>
                        {
                            this.props.filters.map(filter =>
                                <option value={filter}>{filter}</option>
                            )
                        }
                    </FormSelect>
                    <FormControl type='text' name="filterValue"
                                 placeholder={`Enter ${this.state.selectedFilter}...`}
                                 onChange={this.handleInputChange}/>
                    <Button variant="primary" onClick={this.onSearch}>Search</Button>
                </InputGroup>
                {
                    this.props.showList ?
                        <GeneralListComponent fields={this.props.filters}
                                              items={this.state.items}
                                              onSelect={this.props.onSelect}/>
                        :
                        <div/>
                }
            </div>
        );
    }
}
