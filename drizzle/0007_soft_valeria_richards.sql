CREATE TABLE `content_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int NOT NULL,
	`content` text,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `content_history` ADD CONSTRAINT `content_history_contentId_page_content_id_fk` FOREIGN KEY (`contentId`) REFERENCES `page_content`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_history` ADD CONSTRAINT `content_history_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;