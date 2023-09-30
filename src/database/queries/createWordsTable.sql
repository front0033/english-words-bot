CREATE TABLE `WORDS` (
  `user_id` int(11) NOT NULL,
  `word` varchar(50) NOT NULL,
  `resolve` int(0) NOT NULL,
  `last_time_to_revise` date NULL,
  `translate` varchar(50) NOT NULL,
)
