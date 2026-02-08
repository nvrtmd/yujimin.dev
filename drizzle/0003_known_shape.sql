CREATE TABLE `resume_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cache_key` text NOT NULL,
	`content` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`doc_id` text,
	`status` text DEFAULT 'success' NOT NULL,
	`error_message` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `resume_cache_cache_key_unique` ON `resume_cache` (`cache_key`);