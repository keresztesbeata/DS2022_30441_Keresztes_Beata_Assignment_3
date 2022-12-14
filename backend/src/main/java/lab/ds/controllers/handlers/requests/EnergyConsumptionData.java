package lab.ds.controllers.handlers.requests;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class EnergyConsumptionData {
    @NotBlank
    @ValidUUID
    private String deviceId;
    private float energy;
    @NotNull
    private LocalDateTime timestamp;
}
