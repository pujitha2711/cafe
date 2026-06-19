package com.cafe.service;

import com.cafe.dto.OrderItemDto;
import com.cafe.dto.OrderRequest;
import com.cafe.entity.*;
import com.cafe.repository.*;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    // Helper to send system notification
    private void createNotification(User user, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    // Deduct stock based on products ordered
    private void deductInventoryStock(Product product, int quantity) {
        String categoryName = product.getCategory().getName().toLowerCase();
        
        // Simulating ingredient consumption per product quantity
        if (categoryName.contains("coffee")) {
            deductIngredient("Coffee Beans", 0.02 * quantity, "kg");
            deductIngredient("Milk", 0.15 * quantity, "liters");
            deductIngredient("Sugar", 0.01 * quantity, "kg");
        } else if (categoryName.contains("tea")) {
            deductIngredient("Tea Leaves", 0.01 * quantity, "kg");
            deductIngredient("Milk", 0.1 * quantity, "liters");
            deductIngredient("Sugar", 0.01 * quantity, "kg");
        } else if (categoryName.contains("cold") || categoryName.contains("beverage")) {
            deductIngredient("Syrup & Flavourings", 0.05 * quantity, "liters");
            deductIngredient("Milk/Soda base", 0.25 * quantity, "liters");
        } else if (categoryName.contains("snack") || categoryName.contains("combo")) {
            deductIngredient("Baking Flour", 0.1 * quantity, "kg");
            deductIngredient("Butter & Cheese", 0.05 * quantity, "kg");
        } else if (categoryName.contains("dessert")) {
            deductIngredient("Cream & Sugar", 0.08 * quantity, "kg");
            deductIngredient("Pastry Base", 1.0 * quantity, "units");
        }
    }

    private void deductIngredient(String itemName, double amount, String unit) {
        Optional<Inventory> itemOpt = inventoryRepository.findByItemName(itemName);
        if (itemOpt.isPresent()) {
            Inventory item = itemOpt.get();
            double newQty = Math.max(0, item.getQuantity() - amount);
            item.setQuantity(newQty);
            inventoryRepository.save(item);

            // Log warnings for low stock levels
            if (newQty <= item.getLowStockThreshold()) {
                System.out.println("[ALERT] Low Stock: " + itemName + " is below safety limit. Remaining: " + newQty + " " + unit);
            }
        }
    }

    @Transactional
    public Order placeOrder(User user, OrderRequest request) {
        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .paymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()))
                .paymentStatus(PaymentStatus.PENDING)
                .address(request.getAddress())
                .phone(request.getPhone())
                .tax(request.getTax())
                .discount(request.getDiscount())
                .orderItems(new ArrayList<>())
                .build();

        double subtotal = 0.0;

        for (OrderItemDto itemDto : request.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + itemDto.getProductId()));

            if (!product.isAvailable()) {
                throw new RuntimeException("Product '" + product.getName() + "' is currently unavailable!");
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .price(product.getPrice())
                    .build();

            order.getOrderItems().add(orderItem);
            subtotal += product.getPrice() * itemDto.getQuantity();

            // Deduct from Inventory Ingredients
            deductInventoryStock(product, itemDto.getQuantity());
        }

        double totalAmount = subtotal + request.getTax() - request.getDiscount();
        order.setTotalAmount(Math.max(0, totalAmount));

        Order savedOrder = orderRepository.save(order);

        // Notify customer and logging
        createNotification(user, String.format("Thank you! Your order #%d has been placed successfully and is pending confirmation.", savedOrder.getId()));

        return savedOrder;
    }

    public List<Order> getCustomerOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String statusStr) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        OrderStatus status = OrderStatus.valueOf(statusStr.toUpperCase());
        order.setStatus(status);

        // Automatically update payment status for completed deliveries
        if (status == OrderStatus.COMPLETED) {
            order.setPaymentStatus(PaymentStatus.PAID);
            createNotification(order.getUser(), String.format("Your order #%d has been completed. Enjoy your items! ☕", order.getId()));
        } else if (status == OrderStatus.ACCEPTED) {
            createNotification(order.getUser(), String.format("Great news! Your order #%d has been accepted by the Cafe Admin.", order.getId()));
        } else if (status == OrderStatus.PREPARING) {
            createNotification(order.getUser(), String.format("Our baristas are now preparing your order #%d.", order.getId()));
        } else if (status == OrderStatus.SERVED) {
            createNotification(order.getUser(), String.format("Your order #%d has been served hot and fresh!", order.getId()));
        } else if (status == OrderStatus.REJECTED) {
            order.setPaymentStatus(PaymentStatus.FAILED);
            createNotification(order.getUser(), String.format("We regret to inform you that order #%d was rejected by the kitchen.", order.getId()));
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order confirmOrderPayment(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setStatus(OrderStatus.ACCEPTED);
        createNotification(order.getUser(), String.format("Payment for order #%d has been verified. The kitchen is preparing your order! ☕", order.getId()));
        return orderRepository.save(order);
    }

    // PDF Bill Invoice Generator using OpenPDF
    public byte[] generateInvoicePdf(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Set Up Styling fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Font.BOLD, new java.awt.Color(74, 44, 21)); // Coffee Brown
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.BOLD, java.awt.Color.DARK_GRAY);
            Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 10, java.awt.Color.BLACK);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, java.awt.Color.BLACK);

            // Title
            Paragraph title = new Paragraph("CAFE MANAGEMENT SYSTEM", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(15);
            document.add(title);

            Paragraph headerInfo = new Paragraph("128 Gourmet Street, Coffee Valley\nPhone: +1 234 567 890 | Email: support@cafemanage.com", regularFont);
            headerInfo.setAlignment(Element.ALIGN_CENTER);
            headerInfo.setSpacingAfter(25);
            document.add(headerInfo);

            // Bill details
            Paragraph billDetails = new Paragraph();
            billDetails.add(new Chunk("Invoice ID: ", boldFont));
            billDetails.add(new Chunk("CMS-" + order.getId() + "\n", regularFont));
            billDetails.add(new Chunk("Date: ", boldFont));
            billDetails.add(new Chunk(order.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + "\n", regularFont));
            billDetails.add(new Chunk("Customer Name: ", boldFont));
            billDetails.add(new Chunk(order.getUser().getFullName() + "\n", regularFont));
            billDetails.add(new Chunk("Phone: ", boldFont));
            billDetails.add(new Chunk((order.getPhone() != null ? order.getPhone() : order.getUser().getPhoneNumber()) + "\n", regularFont));
            billDetails.add(new Chunk("Delivery Address: ", boldFont));
            billDetails.add(new Chunk((order.getAddress() != null ? order.getAddress() : "Cafe Dine-in/Pickup") + "\n\n", regularFont));
            document.add(billDetails);

            // Itemized Table
            PdfPTable table = new PdfPTable(5); // 5 columns
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);
            table.setSpacingAfter(15);

            // Header cells
            String[] headers = {"#", "Item Name", "Qty", "Price ($)", "Total ($)"};
            for (String headerText : headers) {
                PdfPCell headerCell = new PdfPCell(new Paragraph(headerText, boldFont));
                headerCell.setBackgroundColor(new java.awt.Color(210, 180, 140)); // Tan
                headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                headerCell.setPadding(8);
                table.addCell(headerCell);
            }

            int index = 1;
            double subtotal = 0.0;
            for (OrderItem item : order.getOrderItems()) {
                table.addCell(new PdfPCell(new Paragraph(String.valueOf(index++), regularFont)));
                table.addCell(new PdfPCell(new Paragraph(item.getProduct().getName(), regularFont)));
                table.addCell(new PdfPCell(new Paragraph(String.valueOf(item.getQuantity()), regularFont)));
                table.addCell(new PdfPCell(new Paragraph(String.format("%.2f", item.getPrice()), regularFont)));
                
                double itemTotal = item.getPrice() * item.getQuantity();
                subtotal += itemTotal;
                table.addCell(new PdfPCell(new Paragraph(String.format("%.2f", itemTotal), regularFont)));
            }
            document.add(table);

            // Invoice Summary
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(40);
            summaryTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

            summaryTable.addCell(new PdfPCell(new Paragraph("Subtotal:", boldFont)));
            summaryTable.addCell(new PdfPCell(new Paragraph(String.format("$%.2f", subtotal), regularFont)));

            summaryTable.addCell(new PdfPCell(new Paragraph("Tax:", boldFont)));
            summaryTable.addCell(new PdfPCell(new Paragraph(String.format("$%.2f", order.getTax()), regularFont)));

            summaryTable.addCell(new PdfPCell(new Paragraph("Discount:", boldFont)));
            summaryTable.addCell(new PdfPCell(new Paragraph(String.format("-$%.2f", order.getDiscount()), regularFont)));

            PdfPCell totalHeader = new PdfPCell(new Paragraph("Grand Total:", boldFont));
            totalHeader.setBackgroundColor(new java.awt.Color(230, 230, 230));
            summaryTable.addCell(totalHeader);

            PdfPCell totalVal = new PdfPCell(new Paragraph(String.format("$%.2f", order.getTotalAmount()), boldFont));
            totalVal.setBackgroundColor(new java.awt.Color(230, 230, 230));
            summaryTable.addCell(totalVal);
            document.add(summaryTable);

            // Payment and footer
            Paragraph paymentInfo = new Paragraph();
            paymentInfo.setSpacingBefore(20);
            paymentInfo.add(new Chunk("Payment Method: ", boldFont));
            paymentInfo.add(new Chunk(order.getPaymentMethod().name() + "\n", regularFont));
            paymentInfo.add(new Chunk("Payment Status: ", boldFont));
            paymentInfo.add(new Chunk(order.getPaymentStatus().name() + "\n", regularFont));
            document.add(paymentInfo);

            Paragraph footer = new Paragraph("\n\nThank you for dining with us! Hope to see you again soon. ✨", subtitleFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to generate PDF receipt: " + e.getMessage());
        }

        return out.toByteArray();
    }
}
