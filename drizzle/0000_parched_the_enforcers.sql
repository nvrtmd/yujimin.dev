CREATE TABLE `guestbook` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`nickname` text NOT NULL,
	`location` text,
	`website` text,
	`message` text NOT NULL
);
