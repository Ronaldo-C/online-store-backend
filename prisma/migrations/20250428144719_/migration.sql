-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'unusual', 'locked', 'deleted');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('superAdmin', 'admin', 'server');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "userRole" "UserRole" NOT NULL DEFAULT 'server',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "operated_by" BIGINT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
