CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`date` timestamp NOT NULL,
	`location` varchar(255),
	`type` varchar(100),
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gallery_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text NOT NULL,
	`category` varchar(100),
	`uploadedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gallery_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gallery_photos` ADD CONSTRAINT `gallery_photos_uploadedBy_users_id_fk` FOREIGN KEY (`uploadedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;