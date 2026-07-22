CREATE TABLE `build_pals` (
	`id` text PRIMARY KEY NOT NULL,
	`build_id` text NOT NULL,
	`slot` integer NOT NULL,
	`pal_slug` text NOT NULL,
	`pal_name` text NOT NULL,
	`image_url` text NOT NULL,
	`role` text DEFAULT '' NOT NULL,
	`partner_skill` text DEFAULT '' NOT NULL,
	`stack_note` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`build_id`) REFERENCES `builds`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `build_pals_build_id_idx` ON `build_pals` (`build_id`);--> statement-breakpoint
CREATE TABLE `builds` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`summary` text NOT NULL,
	`strategy` text NOT NULL,
	`passives` text DEFAULT '' NOT NULL,
	`base_support` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`game_version` text DEFAULT '1.0' NOT NULL,
	`base_likes` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `builds_slug_idx` ON `builds` (`slug`);--> statement-breakpoint
CREATE INDEX `builds_category_idx` ON `builds` (`category`);--> statement-breakpoint
CREATE INDEX `builds_created_at_idx` ON `builds` (`created_at`);--> statement-breakpoint
CREATE TABLE `likes` (
	`build_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`build_id`, `user_id`),
	FOREIGN KEY (`build_id`) REFERENCES `builds`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `likes_build_id_idx` ON `likes` (`build_id`);--> statement-breakpoint
CREATE INDEX `likes_user_id_idx` ON `likes` (`user_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expires_at_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`discord_id` text NOT NULL,
	`username` text NOT NULL,
	`display_name` text NOT NULL,
	`avatar_url` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_discord_id_idx` ON `users` (`discord_id`);