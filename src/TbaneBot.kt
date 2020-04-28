package com.humanewolf.tbanebot

import com.humanewolf.tbanebot.config.AppConfigLoader
import com.humanewolf.tbanebot.telegram.TelegramBot
import com.humanewolf.tbanebot.twitter.TwitterApi

fun main() {
    AppConfigLoader.getConfig()

    TwitterApi.run()
    TelegramBot.run()
}
