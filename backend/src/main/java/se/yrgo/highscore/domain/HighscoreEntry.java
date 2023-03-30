package se.yrgo.highscore.domain;

public class HighscoreEntry {
    private int id;
    private String name;
    private int score;
    
    public HighscoreEntry(int id, int score, String name) {
        this.id = id;
        this.name = name;
        this.score = score;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getScore() {
        return score;
    }   
}
