package cinebook.movieService.services;

import cinebook.movieService.exceptions.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.region}")
    private String region;

    public String uploadImage(String base64Data, String type) {
        byte[] bytes = decodeBase64(base64Data, type);
        String key = generateKey(bytes, type);

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(detectContentType(bytes))
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(bytes));
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, key);
    }

    private byte[] decodeBase64(String data, String type) {
        String cleaned = data;
        if (data.contains(",")) {
            cleaned = data.substring(data.indexOf(',') + 1);
        }
        try {
            return Base64.getDecoder().decode(cleaned.trim());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid base64 data for " + type);
        }
    }

    private String generateKey(byte[] bytes, String type) {
        String extension = extensionFromType(bytes, type);
        return type + "/" + UUID.randomUUID() + extension;
    }

    private String extensionFromType(byte[] bytes, String type) {
        String contentType = detectContentType(bytes);
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }

    private String detectContentType(byte[] bytes) {
        if (bytes.length >= 4 &&
                (bytes[0] == (byte) 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47)) {
            return "image/png";
        }
        if (bytes.length >= 12) {
            String header = new String(bytes, 0, 12);
            if (header.startsWith("RIFF") && new String(bytes, 8, 4).equals("WEBP")) {
                return "image/webp";
            }
        }
        if (bytes.length >= 2 && bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8) {
            return "image/jpeg";
        }
        return "image/jpeg";
    }
}
