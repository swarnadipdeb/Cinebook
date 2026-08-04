package imageService.cinebook.controller;

import imageService.cinebook.request.ImageUploadRequest;
import imageService.cinebook.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final S3Service s3Service;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestBody ImageUploadRequest request) {
        if (request.getBase64Image() == null || request.getBase64Image().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "base64Image is required"));
        }

        if (!isValidBase64(request.getBase64Image())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid base64 image data"));
        }

        try {
            String s3Key = s3Service.uploadImage(request.getBase64Image(), request.getFileName());
            return ResponseEntity.ok(Map.of("key", s3Key));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }

    @GetMapping("/view")
    public ResponseEntity<?> viewImage(@RequestParam String key) {
        return streamImage(key, "inline");
    }

    @GetMapping("/download")
    public ResponseEntity<?> downloadImage(@RequestParam String key) {
        return streamImage(key, "attachment");
    }

    private ResponseEntity<?> streamImage(String key, String dispositionType) {
        if (key == null || key.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "key is required"));
        }

        try {
            GetObjectResponse metadata = s3Service.getImageMetadata(key);
            InputStreamResource resource = s3Service.getImage(key);

            String contentType = metadata.contentType();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDisposition(ContentDisposition.builder(dispositionType).build());
            headers.setContentLength(metadata.contentLength());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);

        } catch (software.amazon.awssdk.services.s3.model.NoSuchKeyException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve image: " + e.getMessage()));
        }
    }

    private boolean isValidBase64(String base64) {
        try {
            String data = extractBase64Data(base64);
            Base64.getDecoder().decode(data);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private String extractBase64Data(String base64Image) {
        if (base64Image.contains(",")) {
            return base64Image.split(",")[1];
        }
        return base64Image;
    }
}
