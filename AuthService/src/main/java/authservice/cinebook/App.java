package authservice.cinebook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
@EnableJpaRepositories(basePackages = {"authservice.cinebook.repository"})
public class App {
    public static void main(String[] args) {
        try {
            TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
            SpringApplication.run(App.class, args);
        }catch (Exception e) {
            e.printStackTrace();
        }
    }
}
