package lab.ds.config;

import lab.ds.model.entities.Account;
import lab.ds.repositories.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import javax.transaction.Transactional;
import java.util.UUID;

@Component
public class UserDetailsServiceImpl implements UserDetailsService {
    private static final String USERNAME_NOT_FOUND_ERR_MSG = "Username is not found!";
    private static final String ID_NOT_FOUND_ERR_MSG = "Id is not found!";

    @Autowired
    private AccountRepository accountRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        final Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(USERNAME_NOT_FOUND_ERR_MSG));
        return new UserDetailsImpl(account);
    }

    @Transactional
    public UserDetails loadUserById(UUID id) {
        final Account account = accountRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException(ID_NOT_FOUND_ERR_MSG));
        return new UserDetailsImpl(account);
    }
}
