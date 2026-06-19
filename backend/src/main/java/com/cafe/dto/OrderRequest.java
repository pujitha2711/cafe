package com.cafe.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private String address;
    private String phone;
    private String paymentMethod; // CASH, UPI, CARD
    private double discount;
    private double tax;
    private List<OrderItemDto> items;
}
