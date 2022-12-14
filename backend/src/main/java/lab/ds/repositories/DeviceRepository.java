package lab.ds.repositories;

import lab.ds.model.entities.Account;
import lab.ds.model.entities.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DeviceRepository extends JpaRepository<Device, UUID>, JpaSpecificationExecutor<Device> {
    List<Device> findByAccountAndAddress(Account account, String address);

    List<Device> findByAccount(Account account);

    List<Device> findByAccountNull();
}
