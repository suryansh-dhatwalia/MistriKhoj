-- CreateTable
CREATE TABLE `mistri_ratings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mistri_id` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `mistri_ratings_mistri_id_status_idx`(`mistri_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
