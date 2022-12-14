package lab.ds.dtos.mappers;

import lab.ds.controllers.handlers.requests.DeviceData;
import lab.ds.dtos.DeviceDTO;
import lab.ds.model.entities.Device;

public class DeviceMapper implements Mapper<Device, DeviceData, DeviceDTO> {
    @Override
    public Device mapToEntity(DeviceData data) {
        return Device.builder()
                .address(data.getAddress())
                .description(data.getDescription())
                .maxEnergyConsumption(data.getMaxEnergyConsumption())
                .build();
    }

    @Override
    public Device mapDtoToEntity(DeviceDTO dto) {
        return Device.builder()
                .address(dto.getAddress())
                .description(dto.getDescription())
                .maxEnergyConsumption(dto.getMaxEnergyConsumption())
                .build();
    }

    @Override
    public DeviceDTO mapToDto(Device entity) {
        return DeviceDTO.builder()
                .id(entity.getId().toString())
                .accountId(entity.getAccount() != null ? entity.getAccount().getId().toString() : null)
                .address(entity.getAddress())
                .description(entity.getDescription())
                .maxEnergyConsumption(entity.getMaxEnergyConsumption())
                .build();
    }
}
