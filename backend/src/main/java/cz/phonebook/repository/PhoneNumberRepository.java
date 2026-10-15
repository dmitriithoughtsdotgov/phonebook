package cz.phonebook.repository;

import cz.phonebook.entity.PhoneNumber;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Deliberately extends the bare {@link Repository} instead of JpaRepository so that
 * no update or delete operations are available anywhere in the application.
 */
public interface PhoneNumberRepository extends Repository<PhoneNumber, Long> {

    PhoneNumber save(PhoneNumber phoneNumber);

    /** All numbers the given user may see: their own private ones plus every shared one. */
    @Query("""
            select p from PhoneNumber p
            where p.visibility = cz.phonebook.entity.Visibility.SHARED
               or p.ownerId = :ownerId
            order by p.createdAt desc, p.id desc
            """)
    List<PhoneNumber> findVisibleTo(@Param("ownerId") String ownerId);
}
