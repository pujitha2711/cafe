package com.cafe.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String itemName;

    @Column(nullable = false)
    private double quantity;

    @Column(nullable = false)
    private String unit; // e.g. kg, liters, units

    @Column(nullable = false)
    private double lowStockThreshold;

    private LocalDateTime lastUpdated = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}
