package ds.measurements;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.MessageProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static ds.measurements.Constants.*;

/**
 * The MessageProducer is responsible for producing the messages which will be put on the message queues.
 * The MessageProducer doesn't send the messages directly to the queue, but to an exchange.
 * The exchange receives the message from the producers and pushes them to the queues based on some forwarding mechanism.
 */
public class MessageProducer {

    private String host;
    private String deviceId;
    private int period;
    private String queueName;
    private String exchangeName;
    private Channel channel;
    private Connection connection;

    private static final ConnectionFactory connectionFactory = new ConnectionFactory();
    private SensorReader reader;

    private static final Logger logger = LoggerFactory.getLogger(MessageProducer.class);

    public MessageProducer(String deviceId) {
        this.deviceId = deviceId;
        readProperties();
        connectionFactory.setHost(host);
        reader = new SensorReader(this.deviceId);
        initConnection();
    }

    public void sendMessagesPeriodically() {
        ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor();
        executor.scheduleAtFixedRate(() -> {
            String measurement = reader.readNext();
            if (measurement != null) {
                try {
                    logger.debug("Sending message to queue {}", queueName);
                    channel.basicPublish(exchangeName, ROUTING_KEY, MessageProperties.PERSISTENT_TEXT_PLAIN, measurement.getBytes());
                } catch (IOException e) {
                    logger.error("Failed to send message to message queue: {}", e.getMessage());
                }
            } else {
                logger.error("No messages available! Closing connection.");
                try {
                    connection.close();
                } catch (IOException e) {
                    logger.error("Error closing connection to message broker!");
                }
            }
        }, 0, period, TimeUnit.SECONDS);
    }

    private void readProperties() {
        try (InputStream input = getClass().getClassLoader().getResourceAsStream("application.properties")) {
            Properties prop = new Properties();
            // load properties file
            prop.load(input);
            // get the properties value
            host = prop.getProperty("rabbitmqHost") != null ? prop.getProperty("rabbitmqHost") : DEFAULT_HOST;
            queueName = prop.getProperty("queueName") != null ? prop.getProperty("queueName") : DEFAULT_QUEUE_NAME;
            exchangeName = prop.getProperty("exchangeName") != null ? prop.getProperty("exchangeName") : DEFAULT_EXCHANGE_NAME;
            period = prop.getProperty("sendingPeriod") != null ? Integer.parseInt(prop.getProperty("sendingPeriod")) : DEFAULT_PERIOD;
            if(deviceId == null) {
                // if no device id was provided then obtain it from the configuration file or use a hard coded value
                deviceId = prop.getProperty("deviceId") != null ? prop.getProperty("deviceId") : DEFAULT_DEVICE_ID;
            }
        } catch (IOException e) {
            logger.error("Error reading properties file! Fallback to using the default values. Error: {}", e.getMessage());
        }
    }

    private void initConnection() {
        try {
            connection = connectionFactory.newConnection();
            channel = connection.createChannel();
            // declare an exchange
            channel.exchangeDeclare(exchangeName, "direct", true);
            // declare a queue
            channel.queueDeclare(queueName, true, false, false, null);
            // bind the queue to receive messages from this exchange and filter messages by the routing key
            channel.queueBind(queueName, exchangeName, ROUTING_KEY);
            logger.info("Successfully connected to queue {}", queueName);
        } catch (IOException | TimeoutException e) {
            logger.error("Failed to connect to message queue: {}", e.getMessage());
        }
    }
}
