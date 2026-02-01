CREATE TABLE `comment_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commentId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comment_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`newsId` int NOT NULL,
	`userId` int NOT NULL,
	`parentId` int,
	`content` text NOT NULL,
	`likes` int NOT NULL DEFAULT 0,
	`isEdited` boolean NOT NULL DEFAULT false,
	`isDeleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorite_news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`newsId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorite_news_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorite_players` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`playerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorite_players_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaderboard_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('goals','assists','rating') NOT NULL,
	`playerId` int NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`rank` int NOT NULL,
	`season` varchar(20) NOT NULL,
	`snapshotDate` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leaderboard_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`slug` varchar(500) NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`imageUrl` text,
	`categoryId` int NOT NULL,
	`authorId` int,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`isPremium` boolean NOT NULL DEFAULT false,
	`views` int NOT NULL DEFAULT 0,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `news_id` PRIMARY KEY(`id`),
	CONSTRAINT `news_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `news_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`color` varchar(7),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `news_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `news_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('news','goal','transfer','comment_reply','system') NOT NULL,
	`title` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`link` text,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `player_news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`newsId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `player_news_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`imageUrl` text,
	`nationality` varchar(100) DEFAULT 'Chile',
	`birthDate` timestamp,
	`age` int,
	`position` varchar(50) NOT NULL,
	`currentTeamId` int,
	`jerseyNumber` int,
	`height` int,
	`weight` int,
	`preferredFoot` varchar(20),
	`marketValue` decimal(15,2),
	`goals` int NOT NULL DEFAULT 0,
	`assists` int NOT NULL DEFAULT 0,
	`matches` int NOT NULL DEFAULT 0,
	`minutesPlayed` int NOT NULL DEFAULT 0,
	`yellowCards` int NOT NULL DEFAULT 0,
	`redCards` int NOT NULL DEFAULT 0,
	`pace` int DEFAULT 50,
	`shooting` int DEFAULT 50,
	`passing` int DEFAULT 50,
	`dribbling` int DEFAULT 50,
	`defending` int DEFAULT 50,
	`physical` int DEFAULT 50,
	`overallRating` decimal(3,1) DEFAULT '50.0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `players_id` PRIMARY KEY(`id`),
	CONSTRAINT `players_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `reading_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`newsId` int NOT NULL,
	`readAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reading_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`shortName` varchar(50),
	`logo` text,
	`country` varchar(100),
	`league` varchar(200),
	`founded` int,
	`stadium` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transfers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`fromTeamId` int,
	`toTeamId` int,
	`fee` decimal(15,2),
	`feeType` enum('paid','free','loan','undisclosed') DEFAULT 'undisclosed',
	`status` enum('confirmed','rumor','official') NOT NULL DEFAULT 'rumor',
	`contractYears` int,
	`salary` decimal(15,2),
	`announcedAt` timestamp,
	`completedAt` timestamp,
	`source` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transfers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `isPremium` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `premiumUntil` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `favoriteTeam` varchar(100);