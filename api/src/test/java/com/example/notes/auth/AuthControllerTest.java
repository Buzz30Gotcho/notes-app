package com.example.notes.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Tests de l'endpoint POST /auth/register, un cas par code de réponse du contrat.
 * NB : MockMvc ne tient pas compte du context-path /api, le chemin testé est donc /auth/register.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void register_returns201_withTokenAndUser() throws Exception {
        String body = """
                {
                  "firstName": "Camille",
                  "lastName": "Martin",
                  "email": "camille.ok@example.com",
                  "password": "motdepasse123"
                }
                """;

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.id").isNotEmpty())
                .andExpect(jsonPath("$.user.firstName").value("Camille"))
                .andExpect(jsonPath("$.user.email").value("camille.ok@example.com"));
    }

    @Test
    void register_returns400_whenEmailInvalid() throws Exception {
        String body = """
                {
                  "firstName": "Camille",
                  "lastName": "Martin",
                  "email": "pas-un-email",
                  "password": "motdepasse123"
                }
                """;

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void register_returns400_whenPasswordTooShort() throws Exception {
        String body = """
                {
                  "firstName": "Camille",
                  "lastName": "Martin",
                  "email": "short.pwd@example.com",
                  "password": "123"
                }
                """;

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_returns409_whenEmailAlreadyUsed() throws Exception {
        String body = """
                {
                  "firstName": "Camille",
                  "lastName": "Martin",
                  "email": "duplicate@example.com",
                  "password": "motdepasse123"
                }
                """;

        // 1er appel : compte créé
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isCreated());

        // 2e appel avec le même e-mail : conflit
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }
}
