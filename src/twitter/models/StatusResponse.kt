package com.humanewolf.tbanebot.twitter.models

import com.google.gson.annotations.SerializedName

data class StatusResponse(
    @SerializedName("id_str") val id: String,
    val text: String,

    @SerializedName("in_reply_to_user_id_str") val replyToUserId: String?,

    val user: UserResponse
)
