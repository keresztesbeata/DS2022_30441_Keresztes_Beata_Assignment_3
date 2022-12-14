package lab.ds.repositories;

import lab.ds.model.entities.EnergyConsumption;
import lab.ds.model.entities.TotalEnergyConsumption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EnergyConsumptionRepository extends JpaRepository<EnergyConsumption, Integer> {
    @Transactional
    @Query(value = "SELECT e.* FROM energy_consumption e INNER JOIN device d on d.id = e.device_id WHERE d.account_id = ?1 and d.id = ?2 and date(e.timestamp) = ?3", nativeQuery = true)
    List<EnergyConsumption> findByAccountIdAndDeviceIdAndTimestamp(String accountId, String deviceId, LocalDate timestamp);

    @Transactional
    @Query(value = "select sum(e.energy) AS energy, str_to_date(date_format(e.timestamp,'%Y-%m-%d %H:00:00'), '%Y-%m-%d %H:00:00') AS timestamp, d.account_id AS accountId from energy_consumption e join device d on e.device_id = d.id where d.account_id = ?1 and date(e.timestamp) = ?2 group by accountId, timestamp", nativeQuery = true)
    List<TotalEnergyConsumption> findTotalEnergyConsumptionByAccountIdAndTimestamp(String accountId, LocalDate date);
}
