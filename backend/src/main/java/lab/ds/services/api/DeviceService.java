package lab.ds.services.api;

import lab.ds.controllers.handlers.requests.DeviceData;
import lab.ds.controllers.handlers.requests.LinkDeviceRequest;
import lab.ds.controllers.handlers.requests.SearchCriteria;
import lab.ds.dtos.DeviceDTO;
import lab.ds.model.exceptions.*;

import java.util.List;

public interface DeviceService {

    /**
     * Find a list of all devices.
     *
     * @return a list of {@link DeviceDTO}
     */
    List<DeviceDTO> findDevices();

    /**
     * Find a list of all available devices for the given user which are not assigned to a user yet.
     *
     * @return a list of {@link DeviceDTO}
     */
    List<DeviceDTO> findAvailableDevices();

    /**
     * Filter devices based on some criteria.
     *
     * @param searchCriteria the criteria to filter the devices
     * @return a list of {@link DeviceDTO}
     * @throws InvalidFilterException if the field in the filter is not present in the entity
     */
    List<DeviceDTO> filterDevices(final SearchCriteria searchCriteria) throws InvalidFilterException;

    /**
     * Create a device and link it to a user account.
     *
     * @param request the {@link DeviceData}
     * @return the device that was added
     */
    DeviceDTO addDevice(final DeviceData request);

    /**
     * Create a user-device mapping.
     *
     * @param request {@link LinkDeviceRequest} which contains both the accountId and the associated device id
     * @throws EntityNotFoundException if no user account or no device exists with the given id
     * @throws InvalidOperationException if the user has role Admin as only clients can have associated devices
     */
    void linkDeviceToUser(final LinkDeviceRequest request) throws EntityNotFoundException, InvalidOperationException;

    /**
     * Find a device by its unique id.
     *
     * @param deviceId the device deviceId
     * @return {@link DeviceDTO}
     * @throws EntityNotFoundException if no device can be found by the given id
     */
    DeviceDTO findDeviceById(final String deviceId) throws EntityNotFoundException;

    /**
     * Find a device by its unique id.
     *
     * @param deviceId  the device deviceId
     * @param accountId the deviceId of the user account
     * @return {@link DeviceDTO}
     * @throws EntityNotFoundException if no device can be found by the given id
     * @throws InvalidAccessException  if the device belongs to a different user
     */
    DeviceDTO findDeviceByIdAndAccountId(final String deviceId, final String accountId) throws EntityNotFoundException, InvalidAccessException;

    /**
     * Find a list of devices belonging to the given user.
     *
     * @param accountId the id of the user account
     * @return a list of {@link DeviceDTO}
     * @throws EntityNotFoundException if no user exists with the given id
     */
    List<DeviceDTO> findDevicesByAccountId(final String accountId) throws EntityNotFoundException;

    /**
     * Remove (unlink) a device from a user account.
     *
     * @param deviceId the id of the device
     * @throws EntityNotFoundException if no device exists with the given id
     */
    void deleteDevice(final String deviceId) throws EntityNotFoundException;

    /**
     * Update an existing device with the given information.
     *
     * @param deviceId the id of the device
     * @throws EntityNotFoundException if no device exists with the given id
     */
    DeviceDTO updateDevice(final String deviceId, final DeviceData request) throws EntityNotFoundException;
}
