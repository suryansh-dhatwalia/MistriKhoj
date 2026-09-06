-- CreateTable
CREATE TABLE `mistris` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `state` VARCHAR(100) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `category` VARCHAR(120) NOT NULL,
    `full_name` VARCHAR(120) NOT NULL,
    `primary_phone` VARCHAR(15) NOT NULL,
    `alternate_phone` VARCHAR(15) NULL,
    `qualification` VARCHAR(255) NOT NULL,
    `address` TEXT NOT NULL,
    `pincode` CHAR(6) NULL,
    `experience_years` INTEGER NOT NULL DEFAULT 0,
    `services_offered` JSON NOT NULL,
    `short_intro` TEXT NULL,
    `profile_photo_url` VARCHAR(500) NOT NULL,
    `profile_photo_public_id` VARCHAR(255) NULL,
    `gallery_images` JSON NULL,
    `referral_code` VARCHAR(50) NULL,
    `terms_accepted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `terms_version` VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `mistris_primary_phone_idx`(`primary_phone`),
    INDEX `mistris_state_city_category_idx`(`state`, `city`, `category`),
    INDEX `mistris_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
