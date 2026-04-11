package authservice.cinebook.repository;

import authservice.cinebook.entities.UserInfo;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends CrudRepository<UserInfo, String>
{
    public UserInfo findByUserName(String username);
    public UserInfo findByUserId(String userId);
    public UserInfo findByEmail(String userId);

}