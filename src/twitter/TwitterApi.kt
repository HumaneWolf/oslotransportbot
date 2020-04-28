package com.humanewolf.tbanebot.twitter

import com.humanewolf.tbanebot.common.Http
import com.humanewolf.tbanebot.config.AppConfigLoader
import com.humanewolf.tbanebot.telegram.UpdateNotifier
import com.humanewolf.tbanebot.twitter.models.StatusResponse
import com.humanewolf.tbanebot.twitter.models.TokenResponse
import io.ktor.client.request.*
import kotlinx.coroutines.runBlocking
import mu.KotlinLogging
import java.net.URLEncoder
import java.nio.charset.Charset
import java.util.*
import kotlin.concurrent.schedule

val logger = KotlinLogging.logger {  }

object TwitterApi {
    private val config = AppConfigLoader.getConfig()
    private var bearerToken: String = ""
    private var userId: String = "44597892"

    fun authenticate() = runBlocking {
        val b64Encoder = Base64.getEncoder()

        val encodedKey = URLEncoder.encode(config.twitter.key, Charset.forName("utf-8"))
        val encodedSecret = URLEncoder.encode(config.twitter.secret, Charset.forName("utf-8"))
        val basicToken = b64Encoder.encode("$encodedKey:$encodedSecret".toByteArray(Charset.forName("utf-8"))).toString(
            Charset.forName("utf-8"))

        val response = Http.client.post<TokenResponse> {
            url("https://api.twitter.com/oauth2/token")
            header("Authorization", "Basic $basicToken")
            header("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
            body = "grant_type=client_credentials"
        }
        bearerToken = response.accessToken
        logger.info { "Authenticated with Twitter." }
    }

    fun getUpdates() = runBlocking {
        var lastTweet = TwitterDataStore.lastTweet

        try {
            val response = Http.client.get<List<StatusResponse>> {
                url {
                    url("https://api.twitter.com/1.1/statuses/user_timeline.json")
                    parameter("user_id", userId)
                    parameter("since_id", lastTweet)
                    parameter("exclude_replies", "false")
                }
                header("Authorization", "Bearer $bearerToken")
            }

            for (t in response.reversed()) {
                lastTweet = t.id // Include reply to other account when counting last seen tweet.

                if (t.replyToUserId != null && t.replyToUserId != userId) { // Ignore replies to other accounts before sending.
                    logger.info { "Ignored reply to other user, tweet: ${t.id}" }
                    continue
                }

                // Send relevant tweets to the bot-part of the app.
                UpdateNotifier.sendUpdate(t.text, "Twitter")
                logger.info { "Queued tweet ${t.id}" }
            }
            TwitterDataStore.updateLastTweet(lastTweet)

        } catch (e: Throwable) {
            logger.error { "Failed to get tweets:\n" }
            e.printStackTrace()
        }
    }

    fun run() {
        TwitterDataStore.loadFromFile()

        authenticate()
        val timer = Timer()

        timer.schedule(1000L, 30000L) {
            getUpdates()
        }
    }
}
