package userservice.cinebook.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    private static final String PROFILE_PREFIX = "profile-pics/";

    public String uploadProfilePic(String base64Image, String fileName) {
        String base64Data = extractBase64Data(base64Image);
        byte[] imageBytes = Base64.getDecoder().decode(base64Data);

        String extension = extractExtension(fileName);
        String uniqueKey = PROFILE_PREFIX + UUID.randomUUID().toString() + "." + extension;
        String contentType = getContentType(extension);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(uniqueKey)
                .contentType(contentType)
                .contentLength((long) imageBytes.length)
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(imageBytes));
        return buildPublicUrl(uniqueKey);
    }

    public String buildPublicUrl(String key) {
        return "https://" + bucketName + ".s3.amazonaws.com/" + key;
    }

    public void deleteObject(String key) {
        s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(key).build());
    }

    public void deleteProfilePic(String url) {
        String key = extractKeyFromUrl(url);
        if (key != null) {
            deleteObject(key);
        }
    }

    private String extractKeyFromUrl(String url) {
        int index = url.indexOf(bucketName);
        if (index == -1) {
            index = url.indexOf("/profile-pics/");
            if (index != -1) {
                return url.substring(index + 1);
            }
        }
        if (index != -1) {
            return url.substring(index + bucketName.length() + 1);
        }
        return url;
    }

    public InputStreamResource getImage(String key) throws IOException {
        GetObjectRequest request = GetObjectRequest.builder().bucket(bucketName).key(key).build();
        ResponseInputStream<GetObjectResponse> response = s3Client.getObject(request);
        return new InputStreamResource(response);
    }

    public GetObjectResponse getImageMetadata(String key) throws IOException {
        GetObjectRequest request = GetObjectRequest.builder().bucket(bucketName).key(key).build();
        return s3Client.getObject(request).response();
    }

    private String extractBase64Data(String base64Image) {
        if (base64Image.contains(",")) {
            return base64Image.split(",")[1];
        }
        return base64Image;
    }

    private String extractExtension(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return "jpg";
        }
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < fileName.length() - 1) {
            String ext = fileName.substring(dotIndex + 1).toLowerCase();
            if (isValidExtension(ext)) {
                return ext;
            }
        }
        return "jpg";
    }

    private boolean isValidExtension(String ext) {
        return ext.matches("^(jpg|jpeg|png|gif|webp|bmp|tiff)$");
    }

    private String getContentType(String extension) {
        return switch (extension.toLowerCase()) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "bmp" -> "image/bmp";
            case "tiff" -> "image/tiff";
            default -> "application/octet-stream";
        };
    }
}
