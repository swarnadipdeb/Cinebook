package cinebook.bookingservice.listeners;

import cinebook.bookingservice.dto.request.ScreenLayoutRequestDTO;
import cinebook.bookingservice.models.ScreenLayout;
import cinebook.bookingservice.repositories.ScreenLayoutRepository;
import cinebook.bookingservice.services.ScreenLayoutService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ScreenLayoutListener {

    private static final Logger log = LoggerFactory.getLogger(ScreenLayoutListener.class);
    private final ScreenLayoutService screenLayoutService;
    private final ScreenLayoutRepository screenLayoutRepository;
    private final ObjectMapper objectMapper;

    public ScreenLayoutListener(ScreenLayoutService screenLayoutService,
                                ScreenLayoutRepository screenLayoutRepository,
                                ObjectMapper objectMapper) {
        this.screenLayoutService = screenLayoutService;
        this.screenLayoutRepository = screenLayoutRepository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "screen-layout-create-update", groupId = "booking-service-group")
    public void handleScreenLayoutCreate(String message) {
        try {
            ScreenLayoutRequestDTO dto = objectMapper.readValue(message, ScreenLayoutRequestDTO.class);

            ScreenLayout existing = screenLayoutRepository
                    .findByMovieIdAndScreenIdAndTheaterId(
                            dto.getMovieId(), dto.getScreenId(), dto.getTheaterId());

            if (existing != null) {
                screenLayoutService.updateLayout(existing.getId(), dto);
                log.info("Screen layout updated via Kafka for movieId={}, screenId={}",
                        dto.getMovieId(), dto.getScreenId());
            } else {
                screenLayoutService.createLayout(dto);
                log.info("Screen layout created via Kafka for movieId={}, screenId={}",
                        dto.getMovieId(), dto.getScreenId());
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to parse Kafka message for screen-layout-create-update: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Error processing screen-layout-create-update message: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "screen-layout-delete", groupId = "booking-service-group")
    public void handleScreenLayoutDelete(String message) {
        try {
            List<String> screenIds = objectMapper.readValue(message, new TypeReference<List<String>>() {});
            screenLayoutService.deleteLayoutsByScreenIds(screenIds);
            log.info("Deleted screen layouts via Kafka for screenIds={}", screenIds);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse Kafka message for screen-layout-delete: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Error processing screen-layout-delete message: {}", e.getMessage(), e);
        }
    }
}
