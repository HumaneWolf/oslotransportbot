package com.humanewolf.tbanebot.twitter

import com.google.gson.GsonBuilder
import kotlinx.atomicfu.locks.withLock
import java.io.File
import java.util.concurrent.locks.ReentrantLock

object TwitterDataStore {
    var lastTweet = ""

    private val lock = ReentrantLock()
    private const val fileName = "twitterdata.json"

    fun loadFromFile() = lock.withLock {
        val gson = GsonBuilder().setPrettyPrinting().create()
        val file = File(fileName)

        if (file.exists()) {
            val content = file.readText()
            val data = gson.fromJson(content, DataModel::class.java) ?: throw RuntimeException("Twitter data read as null.")
            lastTweet = data.lastTweet
        } else {
            lastTweet = "1254979997305057281"
            file.writeText(gson.toJson(DataModel(lastTweet = lastTweet)))
            logger.info { "Twitter data file does not exist, writing new." }
        }
    }

    fun updateLastTweet(newId: String) = lock.withLock {
        this.lastTweet = newId

        val gson = GsonBuilder().setPrettyPrinting().create()
        val file = File(fileName)
        file.writeText(gson.toJson(DataModel(lastTweet = newId)))
        logger.info { "Set last tweet: $newId" }
    }
}