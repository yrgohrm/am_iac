package se.yrgo.highscore;

import static spark.Spark.*;
import java.util.*;
import org.flywaydb.core.*;
import com.fasterxml.jackson.annotation.JsonInclude.*;
import com.fasterxml.jackson.databind.*;
import com.zaxxer.hikari.*;
import se.yrgo.highscore.dao.*;
import se.yrgo.highscore.dto.*;

public class App {
    private static ObjectWriter jsonWriter;
    private static ObjectReader jsonReader;

    static {
        final ObjectMapper mapper = new ObjectMapper();
        mapper.setDefaultPropertyInclusion(Include.NON_NULL);
        jsonWriter = mapper.writer();
        jsonReader = mapper.reader();
    }

    private static HikariDataSource ds;
    
    static {
        final String username = System.getenv("DB_USERNAME");
        final String password = System.getenv("DB_PASSWORD");
        final String host = System.getenv("DB_HOST");
        final String url = String.format("jdbc:mysql://%s/hsdb", host);
        
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        ds = new HikariDataSource(config);
    }

    private static HighscoreDao highscoreDao = new HighscoreDao(ds);

    public static void main(String[] args) {
        // Get rid of JOOQs quite annoying logo and tips
        System.getProperties().setProperty("org.jooq.no-logo", "true");
        System.setProperty("org.jooq.no-tips", "true");

        Flyway flyway = Flyway.configure()
              .dataSource(ds.getJdbcUrl(), ds.getUsername(), ds.getPassword())
              .load();

        flyway.migrate();

        defaultResponseTransformer(jsonWriter::writeValueAsString);

        before((request, response) -> response.type("application/json"));

        get("/", (request, response) -> highscoreDao.getGameNames());

        get("/:name", (request, response) -> {
            final String gameName = request.params(":name");
            
            if (!highscoreDao.validGameName(gameName)) {
                halt(400, error("invalid game name"));
            }

            return highscoreDao.getHighscore(gameName);
        });

        post("/:name", "application/json", (request, response) -> {
            final String gameName = request.params(":name");
            final String body = request.body();
            final var optScore = readValue(body, HighscoreDto.class);

            if (optScore.isEmpty()) {
                halt(400, error("invalid request body"));
            }

            final var score = optScore.get();

            if (!highscoreDao.validGameName(gameName)) {
                halt(400, error("invalid game name"));
            }

            if (!highscoreDao.validPlayerName(score.getName())) {
                halt(400, error("invalid player name"));
            }

            highscoreDao.insertHighscore(gameName, score.getName(), score.getScore());
            return null;
        });
    }

    private static <T> Optional<T> readValue(String text, Class<T> type) {
        try {
            return Optional.of(jsonReader.readValue(text, type));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private static String error(String message) {
        return String.format("{\"error\": \"%s\"}", message);
    }
}
