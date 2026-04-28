package cinebook.movieService.config;

import cinebook.movieService.models.Movie;
import cinebook.movieService.models.Theater;
import cinebook.movieService.repositories.MovieRepository;
import cinebook.movieService.repositories.TheaterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;

    @Override
    public void run(String... args) {
        try {
            // Backfill null createdAt/updatedAt for existing docs
            backfillTimestamps();

            if (movieRepository.count() > 0 || theaterRepository.count() > 0) {
                return;
            }

        List<Movie> movies = List.of(
                Movie.builder()
                        .title("Dune: Part Three")
                        .tagline("The desert awakens once more")
                        .poster("https://image.tmdb.org/t/p/w500/dune3.jpg")
                        .backdrop("https://image.tmdb.org/t/p/original/dune3_backdrop.jpg")
                        .rating(8.7)
                        .duration(175)
                        .genre(List.of("Sci-Fi", "Adventure", "Drama"))
                        .language("English")
                        .releaseDate("2026-03-15")
                        .director("Denis Villeneuve")
                        .cast(List.of("Timothée Chalamet", "Zendaya", "Javier Bardem"))
                        .description("Paul Atreides unites with Chani and the Fremen in a quest for revenge while trying to prevent a terrible but foreseeable future.")
                        .premiumPrice(24.99)
                        .regularPrice(14.99)
                        .build(),
                Movie.builder()
                        .title("The Midnight Express")
                        .tagline("Nothing runs like the night")
                        .poster("https://image.tmdb.org/t/p/w500/midnight.jpg")
                        .backdrop("https://image.tmdb.org/t/p/original/midnight_backdrop.jpg")
                        .rating(7.9)
                        .duration(142)
                        .genre(List.of("Thriller", "Mystery"))
                        .language("English")
                        .releaseDate("2026-02-20")
                        .director("Rachel Morrison")
                        .cast(List.of("Oscar Isaac", "Florence Pugh", "LaKeith Stanfield"))
                        .description("A long-distance train conductor uncovers a conspiracy that stretches across continents.")
                        .premiumPrice(22.99)
                        .regularPrice(12.99)
                        .build(),
                Movie.builder()
                        .title("Neon Samurai")
                        .tagline("Honor in a digital world")
                        .poster("https://image.tmdb.org/t/p/w500/neon.jpg")
                        .backdrop("https://image.tmdb.org/t/p/original/neon_backdrop.jpg")
                        .rating(8.3)
                        .duration(158)
                        .genre(List.of("Action", "Sci-Fi", "Cyberpunk"))
                        .language("Japanese")
                        .releaseDate("2026-01-10")
                        .director("Shinji Aramaki")
                        .cast(List.of("Ken Watanabe", "Rinko Kikuchi", "Hiroyuki Sanada"))
                        .description("In a cyberpunk future, a samurai fights to protect the soul of humanity against corporate overlords.")
                        .premiumPrice(23.99)
                        .regularPrice(13.99)
                        .build(),
                Movie.builder()
                        .title("Whispers in the Rain")
                        .tagline("Love finds a way through the storm")
                        .poster("https://image.tmdb.org/t/p/w500/whispers.jpg")
                        .backdrop("https://image.tmdb.org/t/p/original/whispers_backdrop.jpg")
                        .rating(8.1)
                        .duration(128)
                        .genre(List.of("Romance", "Drama"))
                        .language("English")
                        .releaseDate("2026-02-14")
                        .director("Céline Sciamma")
                        .cast(List.of("Anya Taylor-Joy", "Timothée Chalamet"))
                        .description("Two strangers meet during a relentless rainy season in Paris and discover love in the most unexpected moments.")
                        .premiumPrice(19.99)
                        .regularPrice(11.99)
                        .build(),
                Movie.builder()
                        .title("Gravity Well")
                        .tagline("Beyond the edge of space")
                        .poster("https://image.tmdb.org/t/p/w500/gravity.jpg")
                        .backdrop("https://image.tmdb.org/t/p/original/gravity_backdrop.jpg")
                        .rating(9.1)
                        .duration(192)
                        .genre(List.of("Sci-Fi", "Space", "Epic"))
                        .language("English")
                        .releaseDate("2026-04-01")
                        .director("Christopher Nolan")
                        .cast(List.of("Cillian Murphy", "Anne Hathaway", "Matt Damon"))
                        .description("A team of astronauts ventures into a mysterious gravitational anomaly at the edge of known space.")
                        .premiumPrice(26.99)
                        .regularPrice(15.99)
                        .build(),
                Movie.builder()
                        .title("The Last Kingdom")
                        .tagline("One last stand")
                        .poster("https://image.tmdb.org/t/p/w500/kingdom.jpg")
                        .backdrop("https://image.tmdb.org/t/p/original/kingdom_backdrop.jpg")
                        .rating(7.6)
                        .duration(168)
                        .genre(List.of("History", "War", "Drama"))
                        .language("English")
                        .releaseDate("2026-03-22")
                        .director("Ridley Scott")
                        .cast(List.of("Alexander Skarsgård", "Rosamund Pike", "Jared Harris"))
                        .description("A warrior king leads his people in a final battle to preserve their homeland against an invading empire.")
                        .premiumPrice(21.99)
                        .regularPrice(12.99)
                        .build()
        );

        List<Theater> theaters = List.of(
                Theater.builder()
                        .name("IMAX Downtown")
                        .address("123 Main St, Downtown")
                        .screens(8)
                        .amenities(List.of("IMAX", "Dolby Atmos", "Recliner Seats", "VIP Lounge"))
                        .build(),
                Theater.builder()
                        .name("Cineplex Central")
                        .address("456 Broadway Ave, Central")
                        .screens(12)
                        .amenities(List.of("4DX", "Dolby Cinema", "Gold Class", "Play Area"))
                        .build(),
                Theater.builder()
                        .name("Starlite Megaplex")
                        .address("789 Park Blvd, Westside")
                        .screens(15)
                        .amenities(List.of("ScreenX", "RealD 3D", "Beanbags", "Bar"))
                        .build()
        );

        movieRepository.saveAll(movies);
        theaterRepository.saveAll(theaters);
            log.info("Seed data inserted successfully");
        } catch (Exception e) {
            log.warn("Could not seed data (database may be empty or unreachable): {}", e.getMessage());
        }
    }

    private void backfillTimestamps() {
        LocalDateTime now = LocalDateTime.now();
        int movieUpdated = 0;
        for (Movie m : movieRepository.findAll()) {
            if (m.getCreatedAt() == null) {
                m.setCreatedAt(now);
                m.setUpdatedAt(now);
                movieRepository.save(m);
                movieUpdated++;
            }
        }
        if (movieUpdated > 0) {
            log.info("Backfilled timestamps for {} movies", movieUpdated);
        }

        int theaterUpdated = 0;
        for (Theater t : theaterRepository.findAll()) {
            if (t.getCreatedAt() == null) {
                t.setCreatedAt(now);
                t.setUpdatedAt(now);
                theaterRepository.save(t);
                theaterUpdated++;
            }
        }
        if (theaterUpdated > 0) {
            log.info("Backfilled timestamps for {} theaters", theaterUpdated);
        }
    }
}
