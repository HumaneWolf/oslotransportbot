package com.humanewolf.tbanebot.common

import com.google.gson.Gson
import io.ktor.client.HttpClient
import io.ktor.client.engine.apache.Apache
import io.ktor.client.features.HttpTimeout
import io.ktor.client.features.UserAgent
import io.ktor.client.features.json.GsonSerializer
import io.ktor.client.features.json.JsonFeature
import io.ktor.client.features.logging.LogLevel
import io.ktor.client.features.logging.Logging

object Http {
    val client = HttpClient(Apache) {
        install(HttpTimeout) {
        }
        install(JsonFeature) {
            serializer = GsonSerializer()
        }
        install(Logging) {
            level = LogLevel.HEADERS
        }
        install(UserAgent) { agent = "TbaneBot" }
    }

    val gson = Gson()
}