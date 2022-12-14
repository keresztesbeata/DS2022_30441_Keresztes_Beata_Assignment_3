package lab.ds.backend.services.impl;

import lab.ds.backend.services.Constants;
import lab.ds.controllers.handlers.requests.DeviceData;
import lab.ds.controllers.handlers.requests.LinkDeviceRequest;
import lab.ds.model.entities.Account;
import lab.ds.model.entities.Device;
import lab.ds.model.entities.UserRole;
import lab.ds.model.exceptions.EntityNotFoundException;
import lab.ds.repositories.AccountRepository;
import lab.ds.repositories.DeviceRepository;
import lab.ds.services.impl.DeviceServiceImpl;
import lombok.SneakyThrows;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@RunWith(MockitoJUnitRunner.class)
class DeviceServiceImplTest {

    @Mock
    private AccountRepository accountRepository;
    @Mock
    private DeviceRepository deviceRepository;
    @InjectMocks
    private DeviceServiceImpl service;
    private Device device;
    private Account account;
    private DeviceData request;

    @BeforeEach
    void setUp() {
        account = Account.builder()
                .id(UUID.fromString(Constants.ID_1))
                .name(Constants.NAME_1)
                .username(Constants.USERNAME_1)
                .password(new BCryptPasswordEncoder().encode(Constants.PASSWORD_1))
                .role(UserRole.CLIENT)
                .build();

        device = Device.builder()
                .id(UUID.fromString(Constants.DEVICE_ID_1))
                .address(Constants.ADDRESS_1)
                .description(Constants.DESCRIPTION)
                .account(account)
                .build();

        Set<Device> devices = new HashSet<>();
        devices.add(device);
        account.setDevices(devices);

        request = new DeviceData();
        request.setAddress(Constants.ADDRESS_1);
        request.setDescription(Constants.DESCRIPTION);
    }

    @Test
    @SneakyThrows
    void addDevice() {
        Mockito.when(deviceRepository.save(any(Device.class)))
                .thenReturn(device);

        // add a device
        Assertions.assertEquals(Constants.DEVICE_ID_1, service.addDevice(request).getId());

        Mockito.when(accountRepository.findById(UUID.fromString(Constants.ID_1)))
                .thenReturn(Optional.of(account));
        Mockito.when(deviceRepository.findById(UUID.fromString(Constants.DEVICE_ID_1)))
                .thenReturn(Optional.of(device));

        LinkDeviceRequest linkDeviceRequest = new LinkDeviceRequest();
        linkDeviceRequest.setDeviceId(Constants.DEVICE_ID_1);
        linkDeviceRequest.setAccountId(Constants.ID_1);

        // map the device to an existing account
        Assertions.assertDoesNotThrow(() -> service.linkDeviceToUser(linkDeviceRequest));

        verify(accountRepository, times(1)).findById(UUID.fromString(Constants.ID_1));
    }

    @Test
    @SneakyThrows
    void findDeviceById() {
        Mockito.when(deviceRepository.findById(UUID.fromString(Constants.DEVICE_ID_1)))
                .thenReturn(Optional.of(device));

        Assertions.assertEquals(Constants.DEVICE_ID_1, service.findDeviceById(Constants.DEVICE_ID_1).getId());
        verify(deviceRepository).findById(UUID.fromString(Constants.DEVICE_ID_1));

        Assertions.assertThrows(EntityNotFoundException.class, () -> service.findDeviceById(Constants.DEVICE_ID_2));
        verify(deviceRepository).findById(UUID.fromString(Constants.DEVICE_ID_2));
    }

    @Test
    @SneakyThrows
    void findDevicesByAccountId() {
        final Device device2 = Device.builder()
                .id(UUID.fromString(Constants.DEVICE_ID_2))
                .address(Constants.ADDRESS_2)
                .description(Constants.DESCRIPTION)
                .account(account)
                .build();

        Mockito.when(accountRepository.findById(UUID.fromString(Constants.ID_1)))
                .thenReturn(Optional.of(account));

        Mockito.when(deviceRepository.findByAccount(any(Account.class)))
                .thenReturn(List.of(device, device2));

        Assertions.assertDoesNotThrow(() -> service.findDevicesByAccountId(Constants.ID_1));
        Assertions.assertEquals(2, service.findDevicesByAccountId(Constants.ID_1).size());

        Assertions.assertThrows(EntityNotFoundException.class, () -> service.findDevicesByAccountId(Constants.ID_2));
    }

    @Test
    void removeDevice() {
        Mockito.when(deviceRepository.findById(UUID.fromString(Constants.DEVICE_ID_1)))
                .thenReturn(Optional.of(device));

        Assertions.assertDoesNotThrow(() -> service.deleteDevice(Constants.DEVICE_ID_1));
        verify(deviceRepository).delete(any(Device.class));

        Assertions.assertThrows(EntityNotFoundException.class, () -> service.deleteDevice(Constants.DEVICE_ID_2));
    }

    @Test
    @SneakyThrows
    void updateDevice() {
        Mockito.when(deviceRepository.save(any(Device.class)))
                .thenReturn(device);
        Assertions.assertEquals(Constants.DEVICE_ID_1, service.addDevice(request).getId());

        Mockito.when(deviceRepository.findById(UUID.fromString(Constants.DEVICE_ID_1)))
                .thenReturn(Optional.of(device));

        Assertions.assertEquals(Constants.ADDRESS_1, service.updateDevice(Constants.DEVICE_ID_1, request).getAddress());
    }
}