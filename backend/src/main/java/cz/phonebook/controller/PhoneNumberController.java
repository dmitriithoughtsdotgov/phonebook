package cz.phonebook.controller;

import cz.phonebook.dto.CreatePhoneNumberRequest;
import cz.phonebook.dto.PhoneNumberResponse;
import cz.phonebook.security.CurrentUser;
import cz.phonebook.service.PhoneNumberService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Phone numbers can only be listed and added. There are intentionally no PUT/PATCH/DELETE
 * handlers, so such requests are rejected with 405 Method Not Allowed.
 */
@RestController
@RequestMapping("/api/phones")
public class PhoneNumberController {

    private final PhoneNumberService service;

    public PhoneNumberController(PhoneNumberService service) {
        this.service = service;
    }

    @GetMapping
    public List<PhoneNumberResponse> list(@AuthenticationPrincipal Jwt jwt) {
        CurrentUser user = CurrentUser.from(jwt);
        return service.findVisibleTo(user).stream()
                .map(p -> PhoneNumberResponse.of(p, user))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PhoneNumberResponse create(@Valid @RequestBody CreatePhoneNumberRequest request,
                                      @AuthenticationPrincipal Jwt jwt) {
        CurrentUser user = CurrentUser.from(jwt);
        return PhoneNumberResponse.of(service.create(request, user), user);
    }
}
