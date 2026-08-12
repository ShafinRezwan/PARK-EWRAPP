/*
  Warnings:

  - You are about to drop the column `Amount` on the `EWRLabourRow` table. All the data in the column will be lost.
  - You are about to drop the column `Rate` on the `EWRLabourRow` table. All the data in the column will be lost.
  - Added the required column `amount` to the `EWRLabourRow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rate` to the `EWRLabourRow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EWRLabourRow" DROP COLUMN "Amount",
DROP COLUMN "Rate",
ADD COLUMN     "amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "rate" DECIMAL(10,2) NOT NULL;
