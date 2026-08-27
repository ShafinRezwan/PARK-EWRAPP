/*
  Warnings:

  - Added the required column `name` to the `EWRInvoiceMarkupRow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EWRInvoiceMarkupRow" ADD COLUMN     "name" TEXT NOT NULL;
