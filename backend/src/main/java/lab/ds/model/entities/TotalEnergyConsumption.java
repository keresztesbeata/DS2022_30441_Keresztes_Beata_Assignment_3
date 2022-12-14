package lab.ds.model.entities;

import java.time.LocalDateTime;

public interface TotalEnergyConsumption {
    Float getEnergy();

    LocalDateTime getTimestamp();

    String getAccountId();
}

