package com.cafe.controller;

import com.cafe.config.UserDetailsImpl;
import com.cafe.dto.ProductDto;
import com.cafe.dto.ReviewRequest;
import com.cafe.entity.Category;
import com.cafe.entity.Product;
import com.cafe.entity.Review;
import com.cafe.entity.User;
import com.cafe.repository.ProductRepository;
import com.cafe.repository.ReviewRepository;
import com.cafe.repository.UserRepository;
import com.cafe.service.AiService;
import com.cafe.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AiService aiService;

    // --- Category Endpoints ---
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.ok(productService.createCategory(category));
    }

    // --- Product Endpoints ---
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts(@RequestParam(required = false) Long categoryId) {
        if (categoryId != null) {
            return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
        }
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> createProduct(@RequestBody ProductDto dto) {
        return ResponseEntity.ok(productService.createProduct(dto));
    }

    @PutMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody ProductDto dto) {
        return ResponseEntity.ok(productService.updateProduct(id, dto));
    }

    @DeleteMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    // --- Product Review Endpoints (Sentiment Integrated) ---
    @GetMapping("/products/{id}/reviews")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewRepository.findByProductIdOrderByCreatedAtDesc(id));
    }

    @PostMapping("/products/{id}/reviews")
    public ResponseEntity<?> addProductReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody ReviewRequest request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // AI Sentiment Analysis
        String sentiment = aiService.analyzeSentiment(request.getComment());

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .sentiment(sentiment)
                .build();

        reviewRepository.save(review);

        // Update Product Average Rating
        List<Review> reviews = reviewRepository.findByProductId(id);
        double avgRating = reviews.stream()
                .mapToDouble(Review::getRating)
                .average()
                .orElse(5.0);
        
        product.setRating(Math.round(avgRating * 10.0) / 10.0);
        productRepository.save(product);

        return ResponseEntity.ok(review);
    }
}
