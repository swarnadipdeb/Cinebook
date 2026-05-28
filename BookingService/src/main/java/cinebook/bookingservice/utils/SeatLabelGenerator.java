package cinebook.bookingservice.utils;

public class SeatLabelGenerator {

    public static String generate(int rowIndex, int colIndex) {
        char rowChar = (char) ('A' + rowIndex);
        int colNumber = colIndex + 1;
        return String.valueOf(rowChar) + colNumber;
    }
}
