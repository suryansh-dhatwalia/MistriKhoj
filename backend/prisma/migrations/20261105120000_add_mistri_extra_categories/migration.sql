-- CreateTable
CREATE TABLE `mistri_extra_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mistri_id` INTEGER NOT NULL,
    `category` VARCHAR(120) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `mistri_extra_categories_category_idx`(`category`),
    UNIQUE INDEX `mistri_extra_categories_mistri_id_category_key`(`mistri_id`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
