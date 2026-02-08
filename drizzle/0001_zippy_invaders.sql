CREATE TABLE `analytics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`path` text NOT NULL,
	`user_agent` text,
	`referer` text,
	`country` text
);
