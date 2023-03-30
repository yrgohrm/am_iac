package se.yrgo.highscore.dto;

import com.fasterxml.jackson.annotation.*;

public class HighscoreDto {
    private String name;
    private int score;
    
    public HighscoreDto(@JsonProperty(value = "score", required = true) int score, 
                        @JsonProperty(value = "name", required = true) String name) {
        this.name = name;
        this.score = score;
    }

    public String getName() {
        return name;
    }

    public int getScore() {
        return score;
    }   
}
