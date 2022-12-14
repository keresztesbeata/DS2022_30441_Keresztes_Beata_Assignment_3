package lab.ds.services.impl;

import lab.ds.config.UserDetailsImpl;
import lab.ds.controllers.handlers.requests.AccountData;
import lab.ds.controllers.handlers.requests.SearchCriteria;
import lab.ds.dtos.AccountDTO;
import lab.ds.dtos.mappers.AccountMapper;
import lab.ds.model.entities.Account;
import lab.ds.model.entities.UserRole;
import lab.ds.model.exceptions.DuplicateDataException;
import lab.ds.model.exceptions.EntityNotFoundException;
import lab.ds.model.exceptions.InvalidFilterException;
import lab.ds.model.exceptions.NoLoggedInUserException;
import lab.ds.repositories.AccountRepository;
import lab.ds.repositories.DeviceRepository;
import lab.ds.services.api.AccountService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AccountServiceImpl implements AccountService {
    @Autowired
    private AccountRepository repository;
    @Autowired
    private DeviceRepository deviceRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    private final AccountMapper mapper = new AccountMapper();
    private static final String DUPLICATE_USERNAME_ERR_MSG = "Duplicate username! The name %s is already taken.";
    private static final String NOT_EXISTENT_ACCOUNT_ERR_MSG = "This account doesn't exist!";
    private static final String NO_LOGGED_IN_USER_ERR_MS = "No logged in user!";

    /**
     * {@inheritDoc}
     */
    @Override
    public AccountDTO createAccount(final AccountData request) throws DuplicateDataException {
        Account account = mapper.mapToEntity(request);
        if (repository.findByUsername(account.getUsername()).isPresent()) {
            throw new DuplicateDataException(String.format(DUPLICATE_USERNAME_ERR_MSG, account.getUsername()));
        }
        final String encodedPassword = passwordEncoder.encode(account.getPassword());
        account.setPassword(encodedPassword);
        final Account savedAccount = repository.save(account);
        log.debug("Account with id {} for user with username {} was created successfully!", account.getId(), account.getUsername());

        return mapper.mapToDto(savedAccount);
    }

    /**
     * /**
     * {@inheritDoc}
     */
    @Override
    public AccountDTO findAccountByUsername(final String username) throws EntityNotFoundException {
        return mapper.mapToDto(
                repository.findByUsername(username)
                        .orElseThrow(() -> new EntityNotFoundException(NOT_EXISTENT_ACCOUNT_ERR_MSG))
        );
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public AccountDTO findAccountById(final String id) throws EntityNotFoundException {
        return mapper.mapToDto(
                repository.findById(UUID.fromString(id))
                        .orElseThrow(() -> new EntityNotFoundException(NOT_EXISTENT_ACCOUNT_ERR_MSG))
        );
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void deleteAccount(final String id) throws EntityNotFoundException {
        final Account account = repository.findById(UUID.fromString(id))
                .orElseThrow(() -> new EntityNotFoundException(NOT_EXISTENT_ACCOUNT_ERR_MSG));

        // delete the account from all associated devices, but keep the devices themselves
        deviceRepository.findByAccount(account).forEach(device -> {
            device.setAccount(null);
            deviceRepository.save(device);
        });
        log.info("Account with id {} was removed from all associated devices!", id);

        // finally delete the account
        repository.delete(account);
        log.info("Account with id {} was successfully deleted!", id);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public AccountDTO updateAccount(final String id, final AccountDTO dto) throws DuplicateDataException, EntityNotFoundException {
        Account newAccount = mapper.mapDtoToEntity(dto);
        final Account oldAccount = repository.findById(UUID.fromString(id))
                .orElseThrow(() -> new EntityNotFoundException(NOT_EXISTENT_ACCOUNT_ERR_MSG));
        newAccount.setId(oldAccount.getId());

        if (dto.getPassword() != null) {
            newAccount.setPassword(passwordEncoder.encode(dto.getPassword()));
        } else {
            newAccount.setPassword(oldAccount.getPassword());
        }

        if (!newAccount.getUsername().equals(oldAccount.getUsername()) &&
                repository.findByUsername(newAccount.getUsername()).isPresent()) {
            throw new DuplicateDataException(String.format(DUPLICATE_USERNAME_ERR_MSG, newAccount.getUsername()));
        }

        final Account savedAccount = repository.save(newAccount);
        log.info("Account with id {} was successfully updated!", id);

        return mapper.mapToDto(savedAccount);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public AccountDTO getCurrentUserAccount() throws NoLoggedInUserException {
        final Object currentUserAccount = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (currentUserAccount instanceof UserDetailsImpl) {
            return mapper.mapToDto(((UserDetailsImpl) currentUserAccount).getAccount());
        } else {
            throw new NoLoggedInUserException(NO_LOGGED_IN_USER_ERR_MS);
        }
    }

    @Override
    public List<AccountDTO> findClientAccounts() {
        return repository.findByRole(UserRole.CLIENT)
                .stream()
                .map(mapper::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<AccountDTO> filterAccounts(final SearchCriteria searchCriteria, final Optional<String> userRole) throws InvalidFilterException {
        final Specification<Account> specification = new AccountSpecification(searchCriteria);
        ((FilterValidator) specification).validate(searchCriteria);
        final List<Account> accounts = repository.findAll(specification);

        return userRole.map(s -> accounts
                .stream()
                .filter(account -> s.equals(account.getRole().name()))
                .map(mapper::mapToDto)
                .collect(Collectors.toList()))
                .orElseGet(() -> accounts
                .stream()
                .map(mapper::mapToDto)
                .collect(Collectors.toList()));
    }

    @Override
    public List<AccountDTO> findAccounts(final Optional<String> userRole) {
        final List<Account> accounts = repository.findAll();

        return userRole.map(s -> accounts
                        .stream()
                        .filter(account -> s.equals(account.getRole().name()))
                        .map(mapper::mapToDto)
                        .collect(Collectors.toList()))
                .orElseGet(() -> accounts
                        .stream()
                        .map(mapper::mapToDto)
                        .collect(Collectors.toList()));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<AccountDTO> findAccountsByName(final String name) {
        return repository.findByNameContainingIgnoreCase(name.toLowerCase())
                .stream()
                .map(mapper::mapToDto)
                .collect(Collectors.toList());
    }
}
