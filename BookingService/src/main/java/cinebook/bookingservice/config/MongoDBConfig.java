package cinebook.bookingservice.config;

import com.mongodb.MongoTimeoutException;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.IndexOptions;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.util.concurrent.TimeUnit;

@Configuration
public class MongoDBConfig {

    private static final Logger log = LoggerFactory.getLogger(MongoDBConfig.class);
    private MongoTemplate mongoTemplate;

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Value("${spring.data.mongodb.database:cinebook}")
    private String database;

    @Bean
    public MongoClient mongoClient() {
        log.info("Creating MongoClient with URI: {}", mongoUri);
        return MongoClients.create(mongoUri);
    }

    @Bean
    public MongoTemplate mongoTemplate() throws Exception {
        this.mongoTemplate = new MongoTemplate(mongoClient(), database);
        return this.mongoTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void createIndexes() {
        try {
            MongoCollection<Document> screenLayouts = mongoTemplate.getCollection("screenLayouts");
            screenLayouts.createIndex(new Document("movieId", 1));
            screenLayouts.createIndex(
                    new Document("movieId", 1).append("screenId", 1).append("theaterId", 1),
                    new IndexOptions().unique(true)
            );

            MongoCollection<Document> reservations = mongoTemplate.getCollection("reservations");
            reservations.createIndex(new Document("expiresAt", 1),
                    new IndexOptions().expireAfter(0L, TimeUnit.SECONDS)
            );
            reservations.createIndex(
                    new Document("showtimeId", 1).append("seats", 1)
            );

            MongoCollection<Document> bookings = mongoTemplate.getCollection("bookings");
            bookings.createIndex(new Document("bookingId", 1),
                    new IndexOptions().unique(true)
            );
            bookings.createIndex(new Document("userId", 1));
            bookings.createIndex(new Document("userId", 1).append("createdAt", -1));

            log.info("MongoDB indexes created successfully");
        } catch (MongoTimeoutException e) {
            log.warn("MongoDB connection timed out while creating indexes: {}. Indexes will not be created.", e.getMessage());
        } catch (Exception e) {
            log.warn("Failed to create MongoDB indexes: {}. Continuing startup.", e.getMessage());
        }
    }
}
