package lab.ds.controllers.handlers.requests;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class DeviceData {
    @NotBlank
    private String address;
    private String description;
    private float maxEnergyConsumption;
}
