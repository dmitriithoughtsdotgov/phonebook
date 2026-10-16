plugins {
    // Downloads the JDK requested by the toolchain in build.gradle.kts when it is not installed.
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.9.0"
}

rootProject.name = "phonebook-backend"
