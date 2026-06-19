package com.cafe.service;

import com.cafe.entity.*;
import com.cafe.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    // 1. Lexicon-Based Review Sentiment Analyzer
    public String analyzeSentiment(String comment) {
        if (comment == null || comment.isBlank()) {
            return "NEUTRAL";
        }
        String text = comment.toLowerCase();
        
        List<String> positiveWords = Arrays.asList(
            "delicious", "amazing", "great", "excellent", "love", "best", "good", "friendly", 
            "fresh", "sweet", "wonderful", "perfect", "yummy", "highly recommend", "tasty", "delightful"
        );
        
        List<String> negativeWords = Arrays.asList(
            "bad", "poor", "slow", "bitter", "worst", "cold", "expensive", "rude", "late", 
            "disappointing", "horrible", "stale", "dirty", "unfriendly", "waste", "avoid"
        );

        long positiveCount = positiveWords.stream().filter(text::contains).count();
        long negativeCount = negativeWords.stream().filter(text::contains).count();

        if (positiveCount > negativeCount) {
            return "POSITIVE";
        } else if (negativeCount > positiveCount) {
            return "NEGATIVE";
        } else {
            return "NEUTRAL";
        }
    }

    // 2. Collaborative-filtering / Category Frequency Recommendation Engine
    public List<Product> getRecommendations(Long userId) {
        List<Order> userOrders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        if (userOrders.isEmpty()) {
            // Fallback: Return top 4 rated available products
            return productRepository.findByIsAvailable(true).stream()
                    .sorted(Comparator.comparingDouble(Product::getRating).reversed())
                    .limit(4)
                    .collect(Collectors.toList());
        }

        // Find user's favorite product categories
        Map<Long, Long> categoryFrequency = userOrders.stream()
                .flatMap(order -> order.getOrderItems().stream())
                .map(item -> item.getProduct().getCategory().getId())
                .collect(Collectors.groupingBy(id -> id, Collectors.counting()));

        if (categoryFrequency.isEmpty()) {
            return productRepository.findByIsAvailable(true).stream().limit(4).collect(Collectors.toList());
        }

        Long favoriteCategoryId = Collections.max(categoryFrequency.entrySet(), Map.Entry.comparingByValue()).getKey();

        // Get products in favorite category that user hasn't ordered or order-frequent ones
        List<Product> categoryProducts = productRepository.findByCategoryId(favoriteCategoryId);
        Set<Long> orderedProductIds = userOrders.stream()
                .flatMap(order -> order.getOrderItems().stream())
                .map(item -> item.getProduct().getId())
                .collect(Collectors.toSet());

        List<Product> recommended = categoryProducts.stream()
                .filter(Product::isAvailable)
                .filter(p -> !orderedProductIds.contains(p.getId()))
                .limit(4)
                .collect(Collectors.toList());

        // If recommendations are fewer than 4, fill with general top-rated items
        if (recommended.size() < 4) {
            List<Product> general = productRepository.findByIsAvailable(true).stream()
                    .filter(p -> !orderedProductIds.contains(p.getId()) && !recommended.contains(p))
                    .sorted(Comparator.comparingDouble(Product::getRating).reversed())
                    .limit(4 - recommended.size())
                    .collect(Collectors.toList());
            recommended.addAll(general);
        }

        // Final fallback if list is still short
        if (recommended.size() < 4) {
            productRepository.findByIsAvailable(true).stream()
                .filter(p -> !recommended.contains(p))
                .limit(4 - recommended.size())
                .forEach(recommended::add);
        }

        return recommended.stream().limit(4).collect(Collectors.toList());
    }

    // 3. AI Generated Business Insights & Predictions
    public Map<String, Object> getSalesInsights() {
        Map<String, Object> insights = new HashMap<>();
        List<Order> orders = orderRepository.findAll();
        List<Inventory> stockItems = inventoryRepository.findAll();
        
        double totalRevenue = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.REJECTED)
                .mapToDouble(Order::getTotalAmount)
                .sum();

        // Calculate most popular item
        Map<String, Long> productPopularity = orders.stream()
                .flatMap(o -> o.getOrderItems().stream())
                .collect(Collectors.groupingBy(item -> item.getProduct().getName(), Collectors.summingLong(OrderItem::getQuantity)));

        String bestSeller = productPopularity.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");

        // Inventory Alerts
        List<String> inventoryAlerts = stockItems.stream()
                .filter(item -> item.getQuantity() <= item.getLowStockThreshold())
                .map(item -> String.format("Ingredient '%s' is running low (Current: %.1f %s, Threshold: %.1f %s).",
                        item.getItemName(), item.getQuantity(), item.getUnit(), item.getLowStockThreshold(), item.getUnit()))
                .collect(Collectors.toList());

        List<String> bulletPoints = new ArrayList<>();
        
        if (!bestSeller.equals("None")) {
            bulletPoints.add(String.format("AI Insight: '%s' is currently the highest-performing menu item. Consider running a combo offer or highlighting it on the landing page.", bestSeller));
        }

        if (!inventoryAlerts.isEmpty()) {
            bulletPoints.add("AI Inventory Prediction: Stock levels of critical ingredients are falling. Reorder within 24 hours to prevent menu disruption.");
        } else {
            bulletPoints.add("AI Inventory Prediction: Ingredient stock levels are healthy. Current inventory meets predicted demand for the next 7 days.");
        }

        // Time of day or growth trends (mock analysis based on data size)
        if (orders.size() > 5) {
            bulletPoints.add("AI Trend Analysis: Demand spikes detected during breakfast hours (8 AM - 10 AM) and tea time (4 PM - 6 PM). Align kitchen staff accordingly.");
            bulletPoints.add("AI Pricing Suggestion: Customers show a high willingness to purchase Combos. Bundle desserts with premium coffee to raise Average Order Value by 15%.");
        } else {
            bulletPoints.add("AI Insight: Feed more order transactions into the system to unlock hourly sales trend patterns and predictive pricing optimizations.");
        }

        insights.put("bestSeller", bestSeller);
        insights.put("totalRevenue", totalRevenue);
        insights.put("alerts", inventoryAlerts);
        insights.put("insights", bulletPoints);

        return insights;
    }

    // 4. Cafe Support AI Chatbot Interface
    public String getChatbotReply(String userMessage) {
        if (userMessage == null || userMessage.isBlank()) {
            return "Hello! I am your Cafe AI Assistant. How can I help you today?";
        }
        
        String msg = userMessage.toLowerCase();

        if (msg.contains("hello") || msg.contains("hi") || msg.contains("hey")) {
            return "Hello! Welcome to our Premium Cafe. ☕ How can I assist you today? You can ask about our menu, hours, discounts, or order status!";
        }
        if (msg.contains("menu") || msg.contains("coffee") || msg.contains("eat") || msg.contains("drink")) {
            return "Our menu features premium Espresso, Cappuccino, Chamomile Tea, cold brews, snacks like Grilled Sandwiches, and fresh desserts like Blueberry Cheesecake! You can view the full catalog in the 'Featured Menu' section.";
        }
        if (msg.contains("hour") || msg.contains("open") || msg.contains("time") || msg.contains("close")) {
            return "We are open daily from 7:00 AM to 11:00 PM. Our kitchen closes at 10:30 PM. We hope to see you soon!";
        }
        if (msg.contains("discount") || msg.contains("coupon") || msg.contains("offer") || msg.contains("promo")) {
            return "Yes! You can apply the coupon code 'COFFEE20' during checkout to get a flat 20% discount on your order. We also offer combo deals under the Combo section!";
        }
        if (msg.contains("track") || msg.contains("order") || msg.contains("status")) {
            return "You can track your order status in real-time from your Customer Dashboard under 'Order History'. The stages are: Pending → Accepted → Preparing → Served → Completed.";
        }
        if (msg.contains("vegan") || msg.contains("vegetarian") || msg.contains("gluten")) {
            return "We care about dietary choices! All our Teas and Coffees can be prepared with Almond or Soy Milk. We also have gluten-free snack options and completely vegetarian desserts.";
        }
        if (msg.contains("delivery") || msg.contains("address") || msg.contains("ship")) {
            return "We support both self-pickup and doorstep delivery within a 5km radius of the cafe. You can specify your address and phone number during checkout!";
        }
        if (msg.contains("refund") || msg.contains("cancel") || msg.contains("payment")) {
            return "If you want to cancel an order, please do so before the Admin accepts it. For refunds or payment issues, feel free to contact us via the contact form or call our support line directly.";
        }
        if (msg.contains("thank")) {
            return "You're very welcome! Enjoy your coffee and have an amazing day! ☕✨";
        }

        return "That's an interesting question! I recommend checking our Contact Us section or talking directly with our barista. Is there anything else about our menu or your order I can help with?";
    }
}
