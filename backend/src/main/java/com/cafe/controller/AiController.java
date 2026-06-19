package com.cafe.controller;

import com.cafe.config.UserDetailsImpl;
import com.cafe.dto.ChatRequest;
import com.cafe.dto.ChatResponse;
import com.cafe.entity.Product;
import com.cafe.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @GetMapping("/recommendations")
    public ResponseEntity<List<Product>> getRecommendations(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(aiService.getRecommendations(userDetails.getId()));
    }

    @GetMapping("/sales-insights")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSalesInsights() {
        return ResponseEntity.ok(aiService.getSalesInsights());
    }

    @PostMapping("/chatbot")
    public ResponseEntity<ChatResponse> chatbot(@RequestBody ChatRequest request) {
        String reply = aiService.getChatbotReply(request.getMessage());
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}
