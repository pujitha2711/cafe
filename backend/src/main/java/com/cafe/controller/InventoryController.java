package com.cafe.controller;

import com.cafe.entity.Inventory;
import com.cafe.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@PreAuthorize("hasRole('ADMIN')")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<Inventory>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @PostMapping
    public ResponseEntity<Inventory> addInventoryItem(@RequestBody Inventory item) {
        return ResponseEntity.ok(inventoryService.addInventoryItem(item));
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<Inventory> updateStock(
            @PathVariable Long id,
            @RequestParam double quantity) {
        return ResponseEntity.ok(inventoryService.updateStock(id, quantity));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Inventory>> getLowStockItems() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }
}
