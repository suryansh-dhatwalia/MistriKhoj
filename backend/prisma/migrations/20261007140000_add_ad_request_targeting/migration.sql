-- CreateTable
CREATE TABLE `ad_request_targeting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ad_request_id` INTEGER NOT NULL,
    `scope` ENUM('HOME', 'STATE', 'CITY') NOT NULL,
    `state` VARCHAR(100) NULL,
    `city` VARCHAR(120) NULL,
    `price_inr` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ad_request_targeting_ad_request_id_key`(`ad_request_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
