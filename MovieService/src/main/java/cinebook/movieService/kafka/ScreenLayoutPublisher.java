package cinebook.movieService.kafka;

import cinebook.movieService.dto.event.ScreenLayoutEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScreenLayoutPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.kafka.topic.screen-layout-create-update}")
    private String topic;

    @Value("${app.kafka.group-id}")
    private String groupId;

    public void publish(ScreenLayoutEvent event) {
        log.info("Publishing screen layout event to topic '{}' for screen '{}'", topic, event.getScreenId());
        kafkaTemplate.send(topic, event.getScreenId(), event);
    }
}
