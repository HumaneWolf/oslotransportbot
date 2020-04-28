package com.humanewolf.tbanebot.twitter.models

import com.google.gson.annotations.SerializedName

data class UserResponse(
    @SerializedName("id_str") val id: String,
    val name: String,
    @SerializedName("screen_name") val screenName: String
)
