package com.cafe.service;

import com.cafe.entity.Inventory;
import com.cafe.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public Inventory addInventoryItem(Inventory item) {
        return inventoryRepository.save(item);
    }

    public Inventory updateStock(Long id, double quantity) {
        Inventory item = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found with ID: " + id));
        item.setQuantity(quantity);
        return inventoryRepository.save(item);
    }

    public List<Inventory> getLowStockItems() {
        return inventoryRepository.findAll().stream()
                .filter(item -> item.getQuantity() <= item.getLowStockThreshold())
                .collect(Collectors.toList());
    }
}
