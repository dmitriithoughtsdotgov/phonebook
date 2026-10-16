package cz.phonebook.service;

import cz.phonebook.dto.CreatePhoneNumberRequest;
import cz.phonebook.entity.PhoneNumber;
import cz.phonebook.repository.PhoneNumberRepository;
import cz.phonebook.security.CurrentUser;
import cz.phonebook.validation.PhoneNumbers;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PhoneNumberService {

    private final PhoneNumberRepository repository;

    public PhoneNumberService(PhoneNumberRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<PhoneNumber> findVisibleTo(CurrentUser user) {
        return repository.findVisibleTo(user.id());
    }

    @Transactional
    public PhoneNumber create(CreatePhoneNumberRequest request, CurrentUser user) {
        String label = request.label() == null || request.label().isBlank() ? null : request.label().trim();
        // Already validated by @ValidPhoneNumber; stored in E.164 so equal numbers look the same.
        PhoneNumber phoneNumber = new PhoneNumber(
                PhoneNumbers.toE164(request.number()), label, request.visibility(), user.id(), user.username());
        return repository.save(phoneNumber);
    }
}
