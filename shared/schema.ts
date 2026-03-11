import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'orphanage' or 'donor'
  name: text("name").notNull(),
  location: text("location"),
  contactNumber: text("contact_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const needs = pgTable("needs", {
  id: serial("id").primaryKey(),
  orphanageId: integer("orphanage_id").notNull(),
  item: text("item").notNull(),
  quantity: integer("quantity").notNull(),
  description: text("description").notNull(),
  urgency: text("urgency").notNull(), // 'Low', 'Medium', 'High', 'Critical'
  status: text("status").notNull().default("Pending"), // 'Pending', 'Fulfilled'
  createdAt: timestamp("created_at").defaultNow(),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  needId: integer("need_id"), 
  donorId: integer("donor_id").notNull(),
  orphanageId: integer("orphanage_id").notNull(),
  type: text("type").notNull(), // 'Item', 'Money'
  quantity: integer("quantity"), 
  amount: numeric("amount"), 
  message: text("message"),
  status: text("status").notNull().default("Pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertNeedSchema = createInsertSchema(needs).omit({ id: true, createdAt: true, orphanageId: true, status: true });
export const insertDonationSchema = createInsertSchema(donations).omit({ id: true, createdAt: true, donorId: true, status: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Need = typeof needs.$inferSelect;
export type InsertNeed = z.infer<typeof insertNeedSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;

export type NeedWithOrphanage = Need & {
  orphanage: {
    name: string;
    location: string | null;
  }
};
