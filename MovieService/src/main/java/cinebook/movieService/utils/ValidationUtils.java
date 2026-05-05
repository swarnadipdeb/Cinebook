package cinebook.movieService.utils;

import cinebook.movieService.exceptions.ValidationException;
import cinebook.movieService.models.ShowtimeSlot;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.LocalTime;
import java.util.List;

public class ValidationUtils {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    public static void validateDate(String date) {
        if (date == null || date.isBlank()) {
            throw new ValidationException("Date is required");
        }
        try {
            LocalDate.parse(date, DATE_FORMATTER);
        } catch (DateTimeParseException e) {
            throw new ValidationException("Invalid date format. Expected YYYY-MM-DD");
        }
    }

    public static void validateSlots(List<ShowtimeSlot> slots) {
        if (slots == null || slots.isEmpty()) {
            throw new ValidationException("At least one slot is required");
        }
        for (ShowtimeSlot slot : slots) {
            if (slot.getDate() == null || slot.getDate().isBlank()) {
                throw new ValidationException("Date is required for each slot");
            }
            if (slot.getTime() == null || slot.getTime().isBlank()) {
                throw new ValidationException("Time is required for each slot");
            }
            try {
                LocalDate.parse(slot.getDate(), DATE_FORMATTER);
            } catch (DateTimeParseException e) {
                throw new ValidationException("Invalid date format: " + slot.getDate() + ". Expected YYYY-MM-DD");
            }
            try {
                LocalTime.parse(slot.getTime(), TIME_FORMATTER);
            } catch (DateTimeParseException e) {
                throw new ValidationException("Invalid time format: " + slot.getTime() + ". Expected HH:mm");
            }
        }
    }

    public static void validateUrl(String url, String fieldName) {
        if (url == null || url.isBlank()) {
            throw new ValidationException(fieldName + " URL is required");
        }
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            throw new ValidationException(fieldName + " must be a valid URL starting with http:// or https://");
        }
    }

    public static void validateRating(Double rating) {
        if (rating == null || rating < 0.0 || rating > 10.0) {
            throw new ValidationException("Rating must be between 0.0 and 10.0");
        }
    }

    public static void validateDuration(Integer duration) {
        if (duration == null || duration <= 0) {
            throw new ValidationException("Duration must be greater than 0");
        }
    }

    public static void validatePrice(Double price, String fieldName) {
        if (price == null || price <= 0) {
            throw new ValidationException(fieldName + " must be greater than 0");
        }
    }

    public static void validateScreens(Integer screens) {
        if (screens == null || screens <= 0) {
            throw new ValidationException("Screens must be greater than 0");
        }
    }
}
