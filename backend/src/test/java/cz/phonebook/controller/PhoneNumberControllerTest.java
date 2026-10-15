package cz.phonebook.controller;

import cz.phonebook.config.SecurityConfig;
import cz.phonebook.config.SecurityProperties;
import cz.phonebook.service.PhoneNumberService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PhoneNumberController.class)
@Import(SecurityConfig.class)
@EnableConfigurationProperties(SecurityProperties.class)
class PhoneNumberControllerTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    PhoneNumberService service;

    @Test
    void requestWithoutTokenIsRejected() throws Exception {
        mvc.perform(get("/api/phones"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void numbersCannotBeEditedOrDeleted() throws Exception {
        mvc.perform(put("/api/phones").with(jwt())
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isMethodNotAllowed());
        mvc.perform(delete("/api/phones").with(jwt()))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void invalidNumberIsRejectedWithFieldErrors() throws Exception {
        mvc.perform(post("/api/phones").with(jwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"number": "not a number"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.number").exists())
                .andExpect(jsonPath("$.errors.visibility").exists());

        verifyNoInteractions(service);
    }
}
