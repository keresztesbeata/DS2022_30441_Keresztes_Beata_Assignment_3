package lab.ds.dtos.mappers;

import lab.ds.controllers.handlers.requests.EnergyConsumptionData;
import lab.ds.dtos.EnergyConsumptionDTO;
import lab.ds.dtos.TotalEnergyConsumptionDTO;
import lab.ds.model.entities.EnergyConsumption;
import lab.ds.model.entities.TotalEnergyConsumption;

public class EnergyConsumptionMapper implements Mapper<EnergyConsumption, EnergyConsumptionData, EnergyConsumptionDTO> {
    @Override
    public EnergyConsumption mapToEntity(EnergyConsumptionData data) {
        return EnergyConsumption.builder()
                .energy(data.getEnergy())
                .timestamp(data.getTimestamp())
                .build();
    }

    @Override
    public EnergyConsumption mapDtoToEntity(EnergyConsumptionDTO dto) {
        return EnergyConsumption.builder()
                .energy(dto.getEnergy())
                .timestamp(dto.getTimestamp())
                .build();
    }

    @Override
    public EnergyConsumptionDTO mapToDto(EnergyConsumption entity) {
        return EnergyConsumptionDTO.builder()
                .deviceId(entity.getDevice().getId().toString())
                .timestamp(entity.getTimestamp())
                .energy(entity.getEnergy())
                .build();
    }

    public TotalEnergyConsumptionDTO mapToDto(TotalEnergyConsumption entity) {
        return TotalEnergyConsumptionDTO.builder()
                .accountId(entity.getAccountId())
                .timestamp(entity.getTimestamp())
                .energy(entity.getEnergy())
                .build();
    }
}
