-- CreateTable
CREATE TABLE "seoMetas" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "images" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "operated_by" BIGINT,

    CONSTRAINT "seoMetas_pkey" PRIMARY KEY ("id")
);
