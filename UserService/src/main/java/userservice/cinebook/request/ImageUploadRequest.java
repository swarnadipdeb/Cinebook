package userservice.cinebook.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageUploadRequest {
    private String base64Image;
    private String fileName;
}
