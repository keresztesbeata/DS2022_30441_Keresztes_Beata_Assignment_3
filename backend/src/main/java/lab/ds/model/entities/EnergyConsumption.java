package lab.ds.model.entities;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class EnergyConsumption {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "energy")
    private Float energy;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;
}
