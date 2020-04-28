package com.humanewolf.tbanebot.config

data class AppConfig(
    val twitter: TwitterConfig,
    val telegram: TelegramConfig
)

data class TwitterConfig(
    val key: String,
    val secret: String
)

data class TelegramConfig(
    val channelId: Long,
    val token: String
)


fun defaultConfig(): AppConfig {
    return AppConfig(
        telegram = TelegramConfig(
            channelId = 0L,
            token = "secret:token"
        ),
        twitter = TwitterConfig(
            key = "key",
            secret = "secret"
        )
    )
}
