package com.humanewolf.tbanebot.telegram

import com.humanewolf.tbanebot.config.AppConfigLoader
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import me.ivmg.telegram.Bot
import me.ivmg.telegram.bot
import me.ivmg.telegram.dispatch
import me.ivmg.telegram.dispatcher.command
import me.ivmg.telegram.entities.ParseMode
import mu.KotlinLogging

val logger = KotlinLogging.logger {  }

object TelegramBot {
    val config = AppConfigLoader.getConfig()
    lateinit var bot: Bot

    fun run() {
        bot = bot {
            token = config.telegram.token

            dispatch {
                command("dump") { _, update ->
                    val channelName = update.message?.chat?.title ?: "<No title>"
                    val channelId = update.message?.chat?.id ?: 0L
                    val username = update.message?.from?.username ?: "<No username>"

                    logger.info { "Dump: Channel '$channelName' ($channelId), by '@$username'" }
                }
            }
        }
        sendUpdates()
        bot.startPolling()
    }

    private fun sendUpdates() {
        GlobalScope.launch {
            delay(1000) // Slight delay before we start working.

            for (update in UpdateNotifier.sendUpdateChannel) {
                if (config.telegram.channelId == 0L) continue // If it hasn't been set

                bot.sendMessage(
                    chatId = config.telegram.channelId,
                    text = "**#TBANEN OPPDATERING:**\n${update.content}",
                    parseMode = ParseMode.MARKDOWN
                )
                logger.info { "Forwarded from ${update.source}: ${update.content}" }
            }
        }
    }
}