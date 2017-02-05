SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `chats` (
  `chat_id` bigint(20) NOT NULL,
  `admin_id` bigint(20) NOT NULL,
  `join_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tbane_updates` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE `stops` (
  `stop_id` bigint(20) NOT NULL,
  `stop_name` varchar(35) CHARACTER SET latin1 NOT NULL,
  `stop_shortname` varchar(3) CHARACTER SET latin1 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE `tweets` (
  `tweet_id` varchar(20) COLLATE utf8_bin NOT NULL,
  `loaded_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tweet_author` bigint(20) NOT NULL,
  `tweet_text` text CHARACTER SET latin1 NOT NULL,
  `notified_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;


ALTER TABLE `chats`
  ADD PRIMARY KEY (`chat_id`);

ALTER TABLE `stops`
  ADD PRIMARY KEY (`stop_id`),
  ADD KEY `stop_name` (`stop_name`),
  ADD KEY `stop_shortname` (`stop_shortname`);

ALTER TABLE `tweets`
  ADD PRIMARY KEY (`tweet_id`),
  ADD KEY `notified_datetime` (`notified_datetime`),
  ADD KEY `tweet_author` (`tweet_author`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
