package lab.ds.controllers;

import lab.ds.controllers.handlers.requests.EnergyConsumptionData;
import lab.ds.controllers.handlers.requests.ValidUUID;
import lab.ds.dtos.AccountDTO;
import lab.ds.dtos.DeviceDTO;
import lab.ds.dtos.EnergyConsumptionDTO;
import lab.ds.dtos.TotalEnergyConsumptionDTO;
import lab.ds.model.exceptions.EntityNotFoundException;
import lab.ds.model.exceptions.InvalidAccessException;
import lab.ds.model.exceptions.InvalidDataException;
import lab.ds.model.exceptions.NoLoggedInUserException;
import lab.ds.services.api.AccountService;
import lab.ds.services.api.DeviceService;
import lab.ds.services.api.EnergyConsumptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;

import static lab.ds.controllers.Constants.*;

@RestController
@Validated
@CrossOrigin
public class ClientController {
    @Autowired
    private AccountService accountService;
    @Autowired
    private DeviceService deviceService;
    @Autowired
    private EnergyConsumptionService energyConsumptionService;

    @GetMapping(CLIENT_ACCOUNT_PATH)
    public ResponseEntity<AccountDTO> getClientAccount() throws NoLoggedInUserException {
        return ResponseEntity.ok(accountService.getCurrentUserAccount());
    }

    @GetMapping(CLIENT_DEVICES_PATH)
    public ResponseEntity<List<DeviceDTO>> getClientDevices() throws EntityNotFoundException, NoLoggedInUserException {
        final AccountDTO accountDTO = accountService.getCurrentUserAccount();

        return ResponseEntity.ok(deviceService.findDevicesByAccountId(accountDTO.getId()));
    }

    @GetMapping(CLIENT_DEVICE_ID_PATH)
    public ResponseEntity<DeviceDTO> getClientDeviceById(@PathVariable(DEVICE_ID) @ValidUUID String deviceId) throws InvalidAccessException, NoLoggedInUserException, EntityNotFoundException {
        final AccountDTO accountDTO = accountService.getCurrentUserAccount();

        return ResponseEntity.ok(deviceService.findDeviceByIdAndAccountId(deviceId, accountDTO.getId()));
    }

    @GetMapping(ENERGY_CONSUMPTION_PATH)
    public ResponseEntity<List<TotalEnergyConsumptionDTO>> getClientHourlyEnergyConsumption(@RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") @Valid LocalDate date) throws NoLoggedInUserException, InvalidDataException {
        final AccountDTO accountDTO = accountService.getCurrentUserAccount();

        return ResponseEntity.ok(energyConsumptionService.findHourlyTotalEnergyConsumption(accountDTO.getId(), date));
    }

    @GetMapping(DEVICE_ENERGY_CONSUMPTION_PATH)
    public ResponseEntity<List<EnergyConsumptionDTO>> getClientHourlyEnergyConsumptionForDevice(@PathVariable(DEVICE_ID) @ValidUUID String deviceId,
                                                                                                @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") @Valid LocalDate date) throws EntityNotFoundException, InvalidAccessException, NoLoggedInUserException, InvalidDataException {
        final AccountDTO accountDTO = accountService.getCurrentUserAccount();

        return ResponseEntity.ok(energyConsumptionService.findHourlyDeviceEnergyConsumption(accountDTO.getId(), deviceId, date));
    }

    @PostMapping(value = ENERGY_CONSUMPTION_PATH, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<EnergyConsumptionDTO> registerEnergyConsumption(@RequestBody @Valid EnergyConsumptionData data) throws EntityNotFoundException {
        return new ResponseEntity<>(energyConsumptionService.registerEnergyConsumption(data), HttpStatus.CREATED);
    }
}
