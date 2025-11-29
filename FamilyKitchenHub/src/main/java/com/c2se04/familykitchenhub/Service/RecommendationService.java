package com.c2se04.familykitchenhub.Service;
import com.c2se04.familykitchenhub.DTO.Request.RecommendationRequest;
import com.c2se04.familykitchenhub.DTO.Response.RecommendationResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;


import java.util.List;

@Service
public class RecommendationService {

    private final RestTemplate restTemplate;
    @Value("${ai.service.url}")
    private String pythonApiUrl;

    public RecommendationService() {
        this.restTemplate = new RestTemplate();
    }

    public List<Long> getRecommendedRecipeIds(List<Long> inventoryIds, List<Object> profiles, List<Object> recipes) {
        try {
            // 1. Tạo Header (báo cho Python biết mình gửi JSON)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // 2. Tạo Body (Dữ liệu gửi đi)
            RecommendationRequest requestPayload = new RecommendationRequest(inventoryIds, profiles, recipes);

            // 3. Đóng gói Header và Body
            HttpEntity<RecommendationRequest> requestEntity = new HttpEntity<>(requestPayload, headers);

            // 4. Gửi yêu cầu POST sang Python
            // postForEntity(URL, Request, Kiểu dữ liệu nhận về)
            ResponseEntity<RecommendationResponse> responseEntity = restTemplate.postForEntity(
                    pythonApiUrl,
                    requestEntity,
                    RecommendationResponse.class
            );

            // 5. Xử lý kết quả trả về
            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
                RecommendationResponse response = responseEntity.getBody();

                // Chỉ lấy ra list ID công thức để trả về cho Controller
                return response.getRecommendations().stream()
                        .map(RecommendationResponse.RecommendationItem::getRecipeId)
                        .toList();
            }

        } catch (Exception e) {
            System.err.println("Lỗi khi gọi AI Service: " + e.getMessage());
            e.printStackTrace();
        }

        return List.of(); // Trả về rỗng nếu lỗi
    }
}
