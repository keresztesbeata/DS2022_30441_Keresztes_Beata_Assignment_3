package lab.ds.services.impl;

import lab.ds.controllers.handlers.requests.SearchCriteria;
import lab.ds.model.exceptions.InvalidFilterException;

public interface FilterValidator {
    void validate(SearchCriteria searchCriteria) throws InvalidFilterException;
}
