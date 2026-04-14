package userservice.cinebook.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class UserServiceConfig
{
    @Value("${aws.region}")
    private String region;

    @Bean
    public ObjectMapper objectMapperInit(){
        return new ObjectMapper();
    }

    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
                .region(software.amazon.awssdk.regions.Region.of(region))
                .build();
    }
}
