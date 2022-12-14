package lab.ds.controllers;

import lombok.Data;

import java.util.List;

@Data
public class JwtAuthenticationResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String username;
    private List<String> authorities;

    public JwtAuthenticationResponse(String accessToken, String username, List<String> authorities) {
        this.accessToken = accessToken;
        this.username = username;
        this.authorities = authorities;
    }
}
