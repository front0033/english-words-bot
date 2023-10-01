CREATE TABLE IF NOT EXISTS `words` (
  `user_id` int(11) NOT NULL,
  `word` varchar(100) NOT NULL,
  `resolve` int(1) NOT NULL,
  `last_time_to_revise` date NULL,
  `translate` varchar(50) NOT NULL,
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
