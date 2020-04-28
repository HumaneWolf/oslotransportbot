import org.jetbrains.kotlin.gradle.dsl.Coroutines
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar

val ktor_version: String by project
val kotlin_version: String by project
val logback_version: String by project
val exposed_version: String by project

plugins {
    application
    kotlin("jvm") version "1.3.70"
    id("com.github.johnrengelman.shadow") version "4.0.4"
}

group = "com.humanewolf.tbanebot"
version = "2.0.0"

application {
    mainClassName = "com.humanewolf.tbanebot.TbaneBotKt"
}

tasks {
    "shadowJar"(ShadowJar::class) {
        baseName = "tbanebot"
        classifier = ""
        version = ""
    }
}

repositories {
    mavenLocal()
    jcenter()
    maven { url = uri("https://kotlin.bintray.com/ktor") }
    maven { url = uri("https://dl.bintray.com/kotlin/kotlinx") }
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    // Kotlin
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8:$kotlin_version")

    // Logging
    implementation("ch.qos.logback:logback-classic:$logback_version")
    implementation("io.github.microutils:kotlin-logging:1.7.9")

    // Ktor
    implementation("io.ktor:ktor-client-core:$ktor_version")
    implementation("io.ktor:ktor-client-core-jvm:$ktor_version")
    implementation("io.ktor:ktor-client-apache:$ktor_version")
    implementation("io.ktor:ktor-client-json-jvm:$ktor_version")
    implementation("io.ktor:ktor-client-gson:$ktor_version")
    implementation("io.ktor:ktor-client-logging-jvm:$ktor_version")

    // Telegram
    implementation("io.github.kotlin-telegram-bot.kotlin-telegram-bot:telegram:4.6.0")
}

kotlin.sourceSets["main"].kotlin.srcDirs("src")
kotlin.sourceSets["test"].kotlin.srcDirs("test")

sourceSets["main"].resources.srcDirs("resources")
sourceSets["test"].resources.srcDirs("testresources")
