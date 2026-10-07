-- CreateTable
CREATE TABLE `advertisement_campaigns` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `advertisement_id` INTEGER NOT NULL,
    `scope` ENUM('HOME', 'STATE', 'CITY') NOT NULL,
    `price_inr` INTEGER NOT NULL DEFAULT 0,
    `starts_at` DATETIME(3) NULL,
    `ends_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `advertisement_campaigns_advertisement_id_key`(`advertisement_id`),
    INDEX `advertisement_campaigns_scope_idx`(`scope`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ad_impressions_daily` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `advertisement_id` INTEGER NOT NULL,
    `day` DATE NOT NULL,
    `state` VARCHAR(100) NOT NULL DEFAULT '',
    `city` VARCHAR(120) NOT NULL DEFAULT '',
    `impressions` INTEGER NOT NULL DEFAULT 0,

    INDEX `ad_impressions_daily_day_idx`(`day`),
    UNIQUE INDEX `ad_impressions_daily_advertisement_id_day_state_city_key`(`advertisement_id`, `day`, `state`, `city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_views_daily` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day` DATE NOT NULL,
    `page` VARCHAR(60) NOT NULL,
    `state` VARCHAR(100) NOT NULL DEFAULT '',
    `city` VARCHAR(120) NOT NULL DEFAULT '',
    `views` INTEGER NOT NULL DEFAULT 0,

    INDEX `page_views_daily_day_idx`(`day`),
    UNIQUE INDEX `page_views_daily_day_page_state_city_key`(`day`, `page`, `state`, `city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visitors_daily` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day` DATE NOT NULL,
    `visitor_hash` CHAR(64) NOT NULL,

    UNIQUE INDEX `visitors_daily_day_visitor_hash_key`(`day`, `visitor_hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mistri_profile_views_daily` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mistri_id` INTEGER NOT NULL,
    `day` DATE NOT NULL,
    `views` INTEGER NOT NULL DEFAULT 0,

    INDEX `mistri_profile_views_daily_day_idx`(`day`),
    UNIQUE INDEX `mistri_profile_views_daily_mistri_id_day_key`(`mistri_id`, `day`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mistri_profile_viewers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mistri_id` INTEGER NOT NULL,
    `visitor_hash` CHAR(64) NOT NULL,
    `last_counted_at` DATETIME(3) NOT NULL,

    INDEX `mistri_profile_viewers_last_counted_at_idx`(`last_counted_at`),
    UNIQUE INDEX `mistri_profile_viewers_mistri_id_visitor_hash_key`(`mistri_id`, `visitor_hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
