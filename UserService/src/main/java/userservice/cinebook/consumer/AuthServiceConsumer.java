package userservice.cinebook.consumer;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import userservice.cinebook.entities.UserInfoDto;
import userservice.cinebook.service.UserService;

@Service
@AllArgsConstructor
public class AuthServiceConsumer
{

    @Autowired
    private UserService userService;


    @KafkaListener(topics = "${spring.kafka.topic-json.name}", groupId = "${spring.kafka.consumer.group-id}")
    public void listen(UserInfoDto eventData) {
        try{
            // Todo: Make it transactional, to handle idempotency and validate email, phoneNumber etc
            userService.createOrUpdateUser(eventData);
        }catch(Exception ex){
            ex.printStackTrace();
            System.out.println("AuthServiceConsumer: Exception is thrown while consuming kafka event");
        }
    }

}
