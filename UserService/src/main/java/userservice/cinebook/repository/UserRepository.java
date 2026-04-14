package userservice.cinebook.repository;


import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import userservice.cinebook.entities.UserInfo;

import java.util.Optional;

@Repository
@EnableJpaRepositories
public interface UserRepository extends CrudRepository<userservice.cinebook.entities.UserInfo, String>
{

    Optional<UserInfo> findByUserId(String userId);

}
