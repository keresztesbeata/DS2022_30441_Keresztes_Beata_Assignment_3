package lab.ds.dtos;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceDTO {
    private String id;
    private String description;
    private String address;
    private String accountId;
    private float maxEnergyConsumption;
}
