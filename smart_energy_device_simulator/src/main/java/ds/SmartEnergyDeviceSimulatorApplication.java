package ds;

import ds.measurements.MessageProducer;

public class SmartEnergyDeviceSimulatorApplication {

    public static void main(String[] args) {
        final String deviceId = args.length > 0 ? args[0] : null;
        MessageProducer service = new MessageProducer(deviceId);
        service.sendMessagesPeriodically();
    }
}
