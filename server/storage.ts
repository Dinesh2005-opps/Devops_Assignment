import { db } from "./db";
import { users, needs, donations, type User, type InsertUser, type Need, type InsertNeed, type Donation, type InsertDonation } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getOrphanages(): Promise<User[]>;

  // Needs
  getNeeds(search?: string, location?: string): Promise<(Need & { orphanage: { name: string, location: string | null } })[]>;
  getNeed(id: number): Promise<Need | undefined>;
  createNeed(need: InsertNeed & { orphanageId: number }): Promise<Need>;
  updateNeedStatus(id: number, status: string): Promise<Need>;

  // Donations
  createDonation(donation: InsertDonation & { donorId: number }): Promise<Donation>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getOrphanages(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, 'orphanage'));
  }

  async getNeeds(search?: string, location?: string) {
    const allNeeds = await db.select({
      need: needs,
      orphanage: {
        name: users.name,
        location: users.location
      }
    })
    .from(needs)
    .innerJoin(users, eq(needs.orphanageId, users.id))
    .orderBy(desc(needs.createdAt));

    let filtered = allNeeds.map(n => ({
      ...n.need,
      orphanage: n.orphanage
    }));

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(n => n.item.toLowerCase().includes(lowerSearch) || n.description.toLowerCase().includes(lowerSearch));
    }

    if (location) {
      const lowerLoc = location.toLowerCase();
      filtered = filtered.filter(n => n.orphanage.location?.toLowerCase().includes(lowerLoc));
    }

    return filtered;
  }

  async getNeed(id: number): Promise<Need | undefined> {
    const [need] = await db.select().from(needs).where(eq(needs.id, id));
    return need;
  }

  async createNeed(need: InsertNeed & { orphanageId: number }): Promise<Need> {
    const [newNeed] = await db.insert(needs).values(need).returning();
    return newNeed;
  }

  async updateNeedStatus(id: number, status: string): Promise<Need> {
    const [updatedNeed] = await db.update(needs)
      .set({ status })
      .where(eq(needs.id, id))
      .returning();
    return updatedNeed;
  }

  async createDonation(donation: InsertDonation & { donorId: number }): Promise<Donation> {
    const [newDonation] = await db.insert(donations).values(donation).returning();
    return newDonation;
  }
}

export const storage = new DatabaseStorage();