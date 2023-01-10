package ds.measurements;

public interface Constants {
    String DEFAULT_QUEUE_NAME = "sensor_measurements_queue";
    String DEFAULT_EXCHANGE_NAME = "sensor_measurements_exchange";
    String ROUTING_KEY = "sensor_measurements";
    String DEFAULT_DEVICE_ID = "2565d8ee-5f68-40c2-9ccc-1d640432818c";
    int DEFAULT_PERIOD = 30;
    String DEFAULT_HOST = "localhost";
    int DEFAULT_PORT = 5672;
}
