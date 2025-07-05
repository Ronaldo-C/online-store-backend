-- 先添加列但允许为空
ALTER TABLE "users" ADD COLUMN "username" TEXT;

-- 更新现有记录，例如使用 name 字段的值
UPDATE "users" SET "username" = "name" WHERE "username" IS NULL;

-- 然后将列设为非空
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
