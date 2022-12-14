package ds.measurements;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.Timestamp;

public class SensorReader {
    private static final String INPUT_FILE = "sensor.csv";
    private final BufferedReader reader;
    private final InputStream inputStream;
    private String deviceId;

    private static final Logger logger = LoggerFactory.getLogger(SensorReader.class);

    public SensorReader(String deviceId) {
        this.deviceId = deviceId;
        inputStream = getClass().getClassLoader().getResourceAsStream(INPUT_FILE);
        reader = new BufferedReader(new InputStreamReader(inputStream));
    }

    public String readNext() {
        try {
            String line = reader.readLine();
            if (line != null) {
                String[] columns = line.split(",");
                float value = Float.parseFloat(columns[0]);
                final Timestamp timestamp = new Timestamp(System.currentTimeMillis());
                logger.info("Read measurement data {} at timestamp {} for device {}.", value, timestamp, deviceId);

                JSONObject jsonObject = new JSONObject();
                jsonObject.put("device_id", deviceId);
                jsonObject.put("measurement_value", value);
                jsonObject.put("timestamp", timestamp.getTime());

                return jsonObject.toString();
            }
            logger.debug("No more data to read for device {}.", deviceId);
            inputStream.close();
        } catch (IOException e) {
            logger.error("Failed to read measurement data: {}", e.getMessage());
        }
        return null;
    }
}
