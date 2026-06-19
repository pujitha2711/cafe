package com.cafe.config;

import com.cafe.entity.*;
import com.cafe.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;

@Component
public class DbSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Admin User if not exists
        if (!userRepository.existsByEmail("admin@cafe.com")) {
            User admin = User.builder()
                    .fullName("Cafe Admin")
                    .email("admin@cafe.com")
                    .phoneNumber("+111111111")
                    .address("Cafe Central Station")
                    .password(passwordEncoder.encode("admin123"))
                    .role(UserRole.ROLE_ADMIN)
                    .isVerified(true)
                    .build();
            userRepository.save(admin);
            System.out.println("[DB SEEDER] Created Default Admin: admin@cafe.com / admin123");
        }

        // 2. Seed Categories
        if (categoryRepository.count() == 0) {
            Category coffee = Category.builder()
                    .name("Coffee")
                    .description("Premium roasted coffee beans brewed to perfection.")
                    .imageUrl("https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80")
                    .build();

            Category tea = Category.builder()
                    .name("Tea")
                    .description("Soothing organic herbal infusions and classic teas.")
                    .imageUrl("https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80")
                    .build();

            Category coldBev = Category.builder()
                    .name("Cold Beverages")
                    .description("Refreshing iced coffees, milkshakes, and sodas.")
                    .imageUrl("https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&q=80")
                    .build();

            Category snacks = Category.builder()
                    .name("Snacks")
                    .description("Freshly grilled paninis, wraps, and savory bites.")
                    .imageUrl("https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=500&q=80")
                    .build();

            Category desserts = Category.builder()
                    .name("Desserts")
                    .description("Sweet indulgence including cheesecakes and muffins.")
                    .imageUrl("https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80")
                    .build();

            Category combos = Category.builder()
                    .name("Combo Offers")
                    .description("Special discounted bundles for a complete meal.")
                    .imageUrl("https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=500&q=80")
                    .build();

            categoryRepository.saveAll(Arrays.asList(coffee, tea, coldBev, snacks, desserts, combos));
            System.out.println("[DB SEEDER] Seeded Categories.");
        }

        // 3. Seed Products
        if (productRepository.count() == 0) {
            Category coffee = categoryRepository.findByName("Coffee").orElseThrow();
            Category tea = categoryRepository.findByName("Tea").orElseThrow();
            Category coldBev = categoryRepository.findByName("Cold Beverages").orElseThrow();
            Category snacks = categoryRepository.findByName("Snacks").orElseThrow();
            Category desserts = categoryRepository.findByName("Desserts").orElseThrow();
            Category combos = categoryRepository.findByName("Combo Offers").orElseThrow();

            List<Product> products = Arrays.asList(
                    // Coffee
                    Product.builder()
                            .name("Classic Espresso")
                            .description("Rich, concentrated shot of our signature dark roast espresso.")
                            .price(3.25)
                            .rating(4.8)
                            .imageUrl("https://images.unsplash.com/photo-1510707577719-fa7c18305222?w=500&q=80")
                            .category(coffee)
                            .isAvailable(true)
                            .build(),
                    Product.builder()
                            .name("Vanilla Latte")
                            .description("Espresso combined with steamed milk and a touch of sweet vanilla syrup.")
                            .price(4.50)
                            .rating(4.7)
                            .imageUrl("https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&q=80")
                            .category(coffee)
                            .isAvailable(true)
                            .build(),
                    Product.builder()
                            .name("Caramel Macchiato")
                            .description("Steamed milk with vanilla syrup, marked with espresso, topped with caramel drizzle.")
                            .price(4.95)
                            .rating(4.9)
                            .imageUrl("https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&q=80")
                            .category(coffee)
                            .isAvailable(true)
                            .build(),

                    // Tea
                    Product.builder()
                            .name("Organic Chamomile Tea")
                            .description("A soothing caffeine-free herbal infusion made from pure chamomile flowers.")
                            .price(3.50)
                            .rating(4.6)
                            .imageUrl("https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&q=80")
                            .category(tea)
                            .isAvailable(true)
                            .build(),
                    Product.builder()
                            .name("Matcha Green Latte")
                            .description("Japanese ceremonial-grade matcha whisked with steamed milk.")
                            .price(4.75)
                            .rating(4.8)
                            .imageUrl("https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&q=80")
                            .category(tea)
                            .isAvailable(true)
                            .build(),

                    // Cold Beverages
                    Product.builder()
                            .name("Iced Mocha Frappe")
                            .description("Blended espresso, chocolate syrup, milk, and ice, topped with whipped cream.")
                            .price(5.25)
                            .rating(4.9)
                            .imageUrl("https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80")
                            .category(coldBev)
                            .isAvailable(true)
                            .build(),
                    Product.builder()
                            .name("Fresh Strawberry Lemonade")
                            .description("Tangy lemonade blended with fresh strawberries and mint leaves.")
                            .price(4.25)
                            .rating(4.5)
                            .imageUrl("https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80")
                            .category(coldBev)
                            .isAvailable(true)
                            .build(),

                    // Snacks
                    Product.builder()
                            .name("Avocado Toast")
                            .description("Sourdough bread topped with mashed avocado, cherry tomatoes, and chili flakes.")
                            .price(6.50)
                            .rating(4.7)
                            .imageUrl("https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=500&q=80")
                            .category(snacks)
                            .isAvailable(true)
                            .build(),
                    Product.builder()
                            .name("Grilled Chicken Panini")
                            .description("Sourdough bread filled with grilled chicken, mozzarella, pesto, and spinach.")
                            .price(7.95)
                            .rating(4.8)
                            .imageUrl("https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80")
                            .category(snacks)
                            .isAvailable(true)
                            .build(),

                    // Desserts
                    Product.builder()
                            .name("Blueberry Cheesecake")
                            .description("Creamy cheesecake on a graham crust, topped with fresh blueberry compote.")
                            .price(5.50)
                            .rating(4.9)
                            .imageUrl("https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80")
                            .category(desserts)
                            .isAvailable(true)
                            .build(),
                    Product.builder()
                            .name("Double Chocolate Muffin")
                            .description("Moist chocolate muffin packed with rich semisweet chocolate chips.")
                            .price(3.75)
                            .rating(4.6)
                            .imageUrl("https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&q=80")
                            .category(desserts)
                            .isAvailable(true)
                            .build(),

                    // Combos
                    Product.builder()
                            .name("Morning Starter Deal")
                            .description("Your choice of Vanilla Latte paired with Avocado Toast for a perfect start.")
                            .price(9.50)
                            .rating(4.9)
                            .imageUrl("https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80")
                            .category(combos)
                            .isAvailable(true)
                            .build()
            );

            productRepository.saveAll(products);
            System.out.println("[DB SEEDER] Seeded Products.");
        }

        // 4. Seed Inventory stock
        if (inventoryRepository.count() == 0) {
            List<Inventory> stock = Arrays.asList(
                    Inventory.builder().itemName("Coffee Beans").quantity(50.0).unit("kg").lowStockThreshold(10.0).build(),
                    Inventory.builder().itemName("Milk").quantity(100.0).unit("liters").lowStockThreshold(20.0).build(),
                    Inventory.builder().itemName("Sugar").quantity(30.0).unit("kg").lowStockThreshold(5.0).build(),
                    Inventory.builder().itemName("Tea Leaves").quantity(15.0).unit("kg").lowStockThreshold(3.0).build(),
                    Inventory.builder().itemName("Baking Flour").quantity(40.0).unit("kg").lowStockThreshold(8.0).build(),
                    Inventory.builder().itemName("Butter & Cheese").quantity(25.0).unit("kg").lowStockThreshold(5.0).build(),
                    Inventory.builder().itemName("Cream & Sugar").quantity(20.0).unit("kg").lowStockThreshold(4.0).build(),
                    Inventory.builder().itemName("Syrup & Flavourings").quantity(30.0).unit("liters").lowStockThreshold(5.0).build(),
                    Inventory.builder().itemName("Milk/Soda base").quantity(80.0).unit("liters").lowStockThreshold(15.0).build(),
                    Inventory.builder().itemName("Pastry Base").quantity(50.0).unit("units").lowStockThreshold(10.0).build()
            );

            inventoryRepository.saveAll(stock);
            System.out.println("[DB SEEDER] Seeded Inventory Stock.");
        }
    }
}
