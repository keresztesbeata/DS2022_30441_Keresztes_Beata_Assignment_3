package lab.ds.services.api;

import lab.ds.controllers.handlers.requests.AccountData;
import lab.ds.controllers.handlers.requests.SearchCriteria;
import lab.ds.dtos.AccountDTO;
import lab.ds.model.exceptions.DuplicateDataException;
import lab.ds.model.exceptions.EntityNotFoundException;
import lab.ds.model.exceptions.InvalidFilterException;
import lab.ds.model.exceptions.NoLoggedInUserException;

import java.util.List;
import java.util.Optional;

public interface AccountService {

    /**
     * Create a new account.
     *
     * @param request a {@link AccountData}
     * @return a {@link AccountDTO}
     * @throws DuplicateDataException if the username is already taken
     */
    AccountDTO createAccount(final AccountData request) throws DuplicateDataException;

    /**
     * Find account by unique username.
     *
     * @param username the username by which the account is searched
     * @return an {@link AccountDTO}
     * @throws EntityNotFoundException if no account exists with the given username
     */
    AccountDTO findAccountByUsername(final String username) throws EntityNotFoundException;

    /**
     * Find all accounts.
     *
     * @param userRole optional param which restricts the search to user accounts with the given role
     * @return a list of {@link AccountDTO}
     */
    List<AccountDTO> findAccounts(final Optional<String> userRole);

    /**
     * Filter accounts by the given field.
     *
     * @param filter the name of the field to be filtered
     * @param userRole optional param which restricts the search to user accounts with the given role
     * @return a list of {@link AccountDTO}
     * @throws InvalidFilterException if the field in the filter is not present in the entity
     */
    List<AccountDTO> filterAccounts(final SearchCriteria filter, final Optional<String> userRole) throws InvalidFilterException;

    /**
     * Find accounts containing the given name.
     *
     * @param name the name of the users to be searched
     * @return a list of {@link AccountDTO}
     */
    List<AccountDTO> findAccountsByName(final String name);

    /**
     * Get all client accounts.
     *
     * @return a list of {@link AccountDTO}
     */
    List<AccountDTO> findClientAccounts();

    /**
     * Find account by unique id.
     *
     * @param id the id by which the account is searched
     * @return an {@link AccountDTO}
     * @throws EntityNotFoundException if no account with the given id exists
     */
    AccountDTO findAccountById(final String id) throws EntityNotFoundException;

    /**
     * Delete an existing account.
     *
     * @param id the id of the account
     * @throws EntityNotFoundException if no such account exists
     */
    void deleteAccount(final String id) throws EntityNotFoundException;

    /**
     * Update the details of the account.
     *
     * @param id  the id of the account
     * @param dto an {@link AccountDTO}
     * @return an {@link AccountDTO}
     * @throws DuplicateDataException  if the username is already taken
     * @throws EntityNotFoundException if no account was found with the given
     */
    AccountDTO updateAccount(final String id, final AccountDTO dto) throws DuplicateDataException, EntityNotFoundException;

    /**
     * Get the account of the currently logged-in user.
     *
     * @return {@link AccountDTO}
     * @throws NoLoggedInUserException if no user was logged in
     */
    AccountDTO getCurrentUserAccount() throws NoLoggedInUserException;
}
