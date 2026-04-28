package cinebook.movieService.config;

import com.mongodb.MongoTimeoutException;
import com.mongodb.client.MongoCollection;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.data.mongodb.core.MongoTemplate;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class MongoDBConfig {

    private static final Logger log = LoggerFactory.getLogger(MongoDBConfig.class);
    private final MongoTemplate mongoTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void createIndexes() {
        try {
            MongoCollection<Document> showtimes = mongoTemplate.getCollection("showtimes");

            showtimes.createIndex(new Document("movieId", 1));
            showtimes.createIndex(new Document("theaterId", 1));
            showtimes.createIndex(new Document("date", 1));
            showtimes.createIndex(new Document("movieId", 1).append("date", 1));
            showtimes.createIndex(new Document("theaterId", 1).append("date", 1));
            log.info("MongoDB indexes created successfully");
        } catch (MongoTimeoutException e) {
            log.warn("MongoDB connection timed out while creating indexes: {}. Indexes will not be created.", e.getMessage());
        } catch (Exception e) {
            log.warn("Failed to create MongoDB indexes: {}. Continuing startup.", e.getMessage());
        }
    }
}
