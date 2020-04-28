package com.humanewolf.tbanebot.config

import com.google.gson.GsonBuilder
import java.io.File

object AppConfigLoader {
    private var configCache: AppConfig? = null

    fun getConfig(): AppConfig {
        val cache = configCache
        if (cache != null) {
            return cache
        }

        val gson = GsonBuilder().setPrettyPrinting().create()
        val file = File("appconfig.json")

        if (file.exists()) {
            val content = file.readText()
            val config = gson.fromJson(content, AppConfig::class.java) ?: throw RuntimeException("Config read as null.")
            configCache = config
            return config
        } else {
            file.writeText(gson.toJson(defaultConfig()))
            throw RuntimeException("The config file does not exist - Creating a new one and quitting.")
        }
    }
}