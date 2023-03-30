package se.yrgo.highscore.dao;

import static se.yrgo.highscore.generated.Tables.*;
import java.util.*;
import java.util.stream.*;
import javax.sql.*;
import org.jooq.*;
import org.jooq.impl.*;
import se.yrgo.highscore.domain.*;
import se.yrgo.highscore.generated.tables.records.*;

public class HighscoreDao {
    private DataSource ds;

    public HighscoreDao(DataSource ds) {
        this.ds = ds;
    }

    public boolean validGameName(String game) {
        return game.length() <= HIGHSCORE.GAME.getDataType().length();
    }

    public boolean validPlayerName(String name) {
        return name.length() <= HIGHSCORE.NAME.getDataType().length();
    }

    public Highscore getHighscore(String game) {
        DSLContext context = DSL.using(ds, SQLDialect.MYSQL);

        var scores = context.selectFrom(HIGHSCORE)
                         .where(HIGHSCORE.GAME.eq(game))
                         .orderBy(HIGHSCORE.SCORE.desc())
                         .fetch();

        var entries = scores.stream().map(HighscoreDao::toHighscoreEntry).collect(Collectors.toList());

        return new Highscore(game, entries);
    }

    public List<String> getGameNames() {
        DSLContext context = DSL.using(ds, SQLDialect.MYSQL);

        var names = context.selectDistinct(HIGHSCORE.GAME).from(HIGHSCORE).fetch();
        return names.stream().map(r -> r.getValue(HIGHSCORE.GAME)).collect(Collectors.toList());
    }

    public void insertHighscore(String game, String name, int score) {
        DSLContext context = DSL.using(ds, SQLDialect.MYSQL);

        context.insertInto(HIGHSCORE, HIGHSCORE.GAME, HIGHSCORE.NAME, HIGHSCORE.SCORE)
               .values(game, name, score)
               .execute();
    }

    private static HighscoreEntry toHighscoreEntry(HighscoreRecord hs) {
        return new HighscoreEntry(hs.getId(), hs.getScore(), hs.getName());
    }
}
