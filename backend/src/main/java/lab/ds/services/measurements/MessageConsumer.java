package lab.ds.services.measurements;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Delivery;
import lab.ds.controllers.handlers.requests.EnergyConsumptionData;
import lab.ds.dtos.DeviceDTO;
import lab.ds.dtos.EnergyConsumptionDTO;
import lab.ds.model.exceptions.EntityNotFoundException;
import lab.ds.services.api.DeviceService;
import lab.ds.services.api.EnergyConsumptionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@Slf4j
@Service
public class MessageConsumer {
    @Value("${rabbitmq.queue-name:sensor_measurements_queue}")
    private String queueName;
    @Value("${rabbitmq.queue-capacity:6}")
    private Integer queueCapacity;
    @Value("${rabbitmq.host:localhost}")
    private String host;
    private Channel channel;
    private Connection connection;
    @Autowired
    private EnergyConsumptionService energyConsumptionService;
    @Autowired
    private DeviceService deviceService;
    @Autowired
    private NotificationDispatcher dispatcher;
    private static final ObjectMapper mapper = new ObjectMapper();
    private static final ConnectionFactory connectionFactory = new ConnectionFactory();
    private Map<String, MeasurementData> devicesMeasurementsMap = new HashMap<>();

    public void connectToMessageQueue() {
        try {
            connectionFactory.setHost(host);
            connection = connectionFactory.newConnection();
            channel = connection.createChannel();
            // connect to the specified message queue
            channel.queueDeclare(queueName, true, false, false, null);
            log.info("Successfully connected to queue {}", queueName);
            while (channel.isOpen()) {
                channel.basicConsume(queueName, true, (consumerTag, delivery) -> deliverMessage(delivery), consumerTag -> {
                });
            }
        } catch (IOException e) {
            log.error("Failed to consume the message from the queue: {}", e.getMessage());
        } catch (TimeoutException e) {
            log.error("Timeout! Failed to connect to message queue: {}", e.getMessage());
        }
    }

    private void deliverMessage(Delivery delivery) {
        final String message = new String(delivery.getBody(), StandardCharsets.UTF_8);
        log.debug("Received message {} from queue {}", message, queueName);
        final EnergyConsumptionData energyConsumption = decodeMessage(message);

        if (energyConsumption != null) {
            log.debug("Preprocessing measurement {}", energyConsumption);
            try {
                MeasurementData measurementData = devicesMeasurementsMap.get(energyConsumption.getDeviceId());
                if (measurementData != null) {
                    if (measurementData.addMeasurement(energyConsumption.getEnergy())) {
                        log.debug("Current (total) energy consumption {} for device {} at time {}", measurementData.getEnergyConsumptionData().getEnergy(), energyConsumption.getDeviceId(), energyConsumption.getTimestamp());
                    } else {
                        final EnergyConsumptionDTO dto = energyConsumptionService.registerEnergyConsumption(measurementData.getEnergyConsumptionData());
                        log.info("Saved hourly energy consumption {} in db", dto);

                        final DeviceDTO deviceDto = deviceService.findDeviceById(dto.getDeviceId());

                        if (measurementData.getEnergyConsumptionData().getEnergy() > deviceDto.getMaxEnergyConsumption()) {
                            // notify the client if the measured energy is larger than the max value set for the given device
                            dispatcher.notifyUser(deviceDto.getAccountId(),
                                    new Notification(String.format("The measured total hourly energy value %f for the device %s is greater than the maximum value of %f.",
                                            measurementData.getEnergyConsumptionData().getEnergy(), deviceDto.getId(), deviceDto.getMaxEnergyConsumption())));
                        }
                        measurementData.reset(energyConsumption);
                    }
                } else {
                    devicesMeasurementsMap.put(energyConsumption.getDeviceId(), new MeasurementData(energyConsumption, queueCapacity));
                    log.debug("Reading measurements for device {} at hour {}", energyConsumption.getDeviceId(), energyConsumption.getTimestamp());
                }
            } catch (EntityNotFoundException e) {
                log.error("Received measurements from non-existent device: {}", e.getMessage());
            }
        } else {
            log.error("Received message with invalid format! Discard message {}", message);
        }
    }

    private EnergyConsumptionData decodeMessage(String message) {
        try {
            JsonNode jsonNode = mapper.readTree(message);
            EnergyConsumptionData energyConsumptionData = new EnergyConsumptionData();
            energyConsumptionData.setEnergy((float) jsonNode.get("measurement_value").asDouble());
            energyConsumptionData.setTimestamp(Instant.ofEpochMilli(jsonNode.get("timestamp").asLong()).atZone(ZoneId.systemDefault()).toLocalDateTime());
            energyConsumptionData.setDeviceId(jsonNode.get("device_id").asText());

            return energyConsumptionData;
        } catch (JsonProcessingException e) {
            log.error("Failed to decode the received message: {}", e.getMessage());
        }
        return null;
    }
}
