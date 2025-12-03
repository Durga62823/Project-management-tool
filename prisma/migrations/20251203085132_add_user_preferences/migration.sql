-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notificationSettings" JSONB DEFAULT '{"emailNotifications":true,"projectUpdates":true,"teamActivity":true,"loginAlerts":true}',
ADD COLUMN     "preferences" JSONB DEFAULT '{"theme":"light","language":"English","timezone":"UTC"}';
