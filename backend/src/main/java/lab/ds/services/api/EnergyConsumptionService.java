package lab.ds.services.api;

import lab.ds.controllers.handlers.requests.EnergyConsumptionData;
import lab.ds.dtos.EnergyConsumptionDTO;
import lab.ds.dtos.TotalEnergyConsumptionDTO;
import lab.ds.model.entities.EnergyConsumption;
import lab.ds.model.exceptions.EntityNotFoundException;
import lab.ds.model.exceptions.InvalidAccessException;
import lab.ds.model.exceptions.InvalidDataException;

import java.time.LocalDate;
import java.util.List;

public interface EnergyConsumptionService {
    /**
     * Find the hourly energy consumption of a given device for a given day.
     *
     * @param accountId the id of the user's account
     * @param deviceId  the id of the device
     * @param date      the date for which the energy consumption is listed
     * @return a list of {@link EnergyConsumption} for the given device
     * @throws EntityNotFoundException if no device exists with the given id
     * @throws InvalidAccessException  if the device belongs to a different user
     * @throws InvalidDataException    if the selected date is a future date
     */
    List<EnergyConsumptionDTO> findHourlyDeviceEnergyConsumption(final String accountId, final String deviceId, final LocalDate date) throws EntityNotFoundException, InvalidAccessException, InvalidDataException;

    /**
     * Find the hourly energy consumption of all devices of a given user for a given day.
     *
     * @param accountId the id of the user's account
     * @param date      the date for which the energy consumption is listed
     * @return a list of {@link TotalEnergyConsumptionDTO} aggregated for all devices associated to the given user account
     * @throws InvalidDataException if the selected date is a future date
     */
    List<TotalEnergyConsumptionDTO> findHourlyTotalEnergyConsumption(final String accountId, final LocalDate date) throws InvalidDataException;

    /**
     * Register the enrgy consumption data.
     *
     * @param data {@link EnergyConsumptionData} representing the energy consumed by a given device in the specified hour.
     * @return {@link EnergyConsumptionDTO}
     * @throws EntityNotFoundException if no device exists with the given id
     */
    EnergyConsumptionDTO registerEnergyConsumption(final EnergyConsumptionData data) throws EntityNotFoundException;
}
