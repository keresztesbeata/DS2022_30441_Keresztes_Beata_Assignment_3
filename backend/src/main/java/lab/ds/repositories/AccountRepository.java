package lab.ds.repositories;

import lab.ds.model.entities.Account;
import lab.ds.model.entities.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID>, JpaSpecificationExecutor<Account> {
    Optional<Account> findByUsername(String username);

    List<Account> findByNameContainingIgnoreCase(String name);

    List<Account> findByRole(UserRole userRole);
}
