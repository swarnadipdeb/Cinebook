package cinebook.movieService.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScreenLayoutDeletePublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.kafka.topic.screen-layout-delete}")
    private String topic;

    @Value("${app.kafka.group-id}")
    private String groupId;

    public void publish(List<String> screenIds) {
        log.info("Publishing screen layout delete event to topic '{}' for {} screens", topic, screenIds.size());
        kafkaTemplate.send(topic, null, screenIds);
    }
}
