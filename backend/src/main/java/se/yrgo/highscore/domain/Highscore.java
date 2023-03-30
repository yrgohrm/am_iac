package se.yrgo.highscore.domain;

import java.util.*;

public class Highscore {
    private String game;
    private List<HighscoreEntry> entries;

    public Highscore(String game, List<HighscoreEntry> entries) {
        this.game = game;
        this.entries = List.copyOf(entries);
    }

    public String getGame() {
        return game;
    }

    public List<HighscoreEntry> getEntries() {
        return entries;
    }   
}
