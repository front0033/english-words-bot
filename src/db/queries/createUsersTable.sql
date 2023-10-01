CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `rating` int(2) NOT NULL,
  `last_usage_data` date NULL,
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
