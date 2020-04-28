package com.humanewolf.tbanebot.telegram

import kotlinx.coroutines.channels.Channel

object UpdateNotifier {
    // Not using a channel, since we're mostly using two synchronous threats, not coroutines.
    val sendUpdateChannel = Channel<SendUpdate>()

    suspend fun sendUpdate(content: String, source: String) = sendUpdateChannel.send(SendUpdate(content, source))
}