package lab.ds.services.measurements;

import lab.ds.controllers.handlers.requests.EnergyConsumptionData;
import lombok.Data;

@Data
public class MeasurementData {
    private EnergyConsumptionData energyConsumptionData;
    private float first;
    private int nrMeasurements;
    private int maxNrMeasurements;

    public MeasurementData(EnergyConsumptionData firstMeasurement, int maxNrMeasurements) {
        this.maxNrMeasurements = maxNrMeasurements;
        reset(firstMeasurement);
    }

    public boolean addMeasurement(float currentValue) {
        if (nrMeasurements < maxNrMeasurements) {
            energyConsumptionData.setEnergy(currentValue - first);
            nrMeasurements++;
            return true;
        }
        return false;
    }

    public void reset(EnergyConsumptionData firstMeasurement) {
        this.nrMeasurements = 1;
        this.first = firstMeasurement.getEnergy();
        this.energyConsumptionData = firstMeasurement;
    }
}
