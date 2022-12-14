package lab.ds.controllers;

import lab.ds.controllers.handlers.requests.DeviceData;
import lab.ds.controllers.handlers.requests.LinkDeviceRequest;
import lab.ds.controllers.handlers.requests.SearchCriteria;
import lab.ds.controllers.handlers.requests.ValidUUID;
import lab.ds.dtos.DeviceDTO;
import lab.ds.model.exceptions.EntityNotFoundException;
import lab.ds.model.exceptions.InvalidFilterException;
import lab.ds.model.exceptions.InvalidOperationException;
import lab.ds.services.api.DeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

import static lab.ds.controllers.Constants.*;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.springframework.http.ResponseEntity.ok;

@RestController
@Validated
@CrossOrigin
public class DeviceRestController {

    @Autowired
    private DeviceService deviceService;

    @PostMapping(value = DEVICES_PATH, consumes = APPLICATION_JSON_VALUE, produces = APPLICATION_JSON_VALUE)
    public ResponseEntity<DeviceDTO> addDevice(@RequestBody @Valid DeviceData data) {
        return new ResponseEntity<>(deviceService.addDevice(data), HttpStatus.CREATED);
    }

    @GetMapping(DEVICES_PATH)
    public ResponseEntity<List<DeviceDTO>> getDevices() {
        return ok(deviceService.findDevices());
    }

    @GetMapping(ACCOUNT_DEVICES_PATH)
    public ResponseEntity<List<DeviceDTO>> getDevicesByAccountId(@PathVariable(ACCOUNT_ID) @ValidUUID String accountId) throws EntityNotFoundException {
        return ok(deviceService.findDevicesByAccountId(accountId));
    }

    @GetMapping(DEVICES_FILTER_PATH)
    public ResponseEntity<List<DeviceDTO>> filterDevices(@RequestParam String filterKey, @RequestParam String filterValue) throws InvalidFilterException {
        return ok(deviceService.filterDevices(new SearchCriteria(filterKey, filterValue)));
    }

    @GetMapping(AVAILABLE_DEVICES_PATH)
    public ResponseEntity<List<DeviceDTO>> findAvailableDevices() {
        return ok(deviceService.findAvailableDevices());
    }

    @PutMapping(value = DEVICE_ID_PATH, consumes = APPLICATION_JSON_VALUE, produces = APPLICATION_JSON_VALUE)
    public ResponseEntity<DeviceDTO> updateDevice(@PathVariable(DEVICE_ID) @ValidUUID String deviceId,
                                                  @RequestBody @Valid DeviceData data) throws EntityNotFoundException {
        return ok(deviceService.updateDevice(deviceId, data));
    }

    @GetMapping(DEVICE_ID_PATH)
    public ResponseEntity<DeviceDTO> getDeviceById(@PathVariable(DEVICE_ID) @ValidUUID String deviceId) throws EntityNotFoundException {
        return ok(deviceService.findDeviceById(deviceId));
    }

    @DeleteMapping(DEVICE_ID_PATH)
    public ResponseEntity deleteDevice(@PathVariable(DEVICE_ID) @ValidUUID String deviceId) throws EntityNotFoundException {
        deviceService.deleteDevice(deviceId);

        return ResponseEntity.ok().build();
    }

    @PostMapping(value = LINK_DEVICE_PATH, consumes = APPLICATION_JSON_VALUE)
    public ResponseEntity linkDevice(@RequestBody @Valid LinkDeviceRequest request) throws EntityNotFoundException, InvalidOperationException {
        deviceService.linkDeviceToUser(request);

        return ResponseEntity.ok().build();
    }
}
