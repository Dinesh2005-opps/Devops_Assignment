import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Ensure SESSION_SECRET exists for JWT signing
const JWT_SECRET = process.env.SESSION_SECRET || "default_dev_secret_please_change";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string; email: string };
    }
  }
}

// Middleware to protect routes
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Authentication Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(input.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use", field: "email" });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
      });

      const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      
      res.status(201).json({ token, user });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(input.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      res.status(200).json({ token, user });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input format" });
      }
      throw err;
    }
  });

  app.get(api.auth.me.path, authenticateToken, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const user = await storage.getUser(req.user.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.status(200).json(user);
  });

  // Needs Routes
  app.get(api.needs.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const location = req.query.location as string | undefined;
    
    const needs = await storage.getNeeds(search, location);
    res.status(200).json(needs);
  });

  app.post(api.needs.create.path, authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== 'orphanage') {
        return res.status(401).json({ message: "Only orphanages can post needs" });
      }

      const input = api.needs.create.input.parse(req.body);
      const need = await storage.createNeed({
        ...input,
        orphanageId: req.user.id
      });
      
      res.status(201).json(need);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.needs.updateStatus.path, authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const need = await storage.getNeed(id);
      if (!need) {
        return res.status(404).json({ message: "Need not found" });
      }

      if (req.user?.role !== 'orphanage' || req.user.id !== need.orphanageId) {
        return res.status(401).json({ message: "Unauthorized to update this need" });
      }

      const updated = await storage.updateNeedStatus(id, status);
      res.status(200).json(updated);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Donations Routes
  app.post(api.donations.create.path, authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== 'donor') {
        return res.status(401).json({ message: "Only donors can make donations" });
      }

      const input = api.donations.create.input.parse(req.body);
      const donation = await storage.createDonation({
        ...input,
        donorId: req.user.id
      });

      res.status(201).json(donation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Orphanages Routes
  app.get(api.orphanages.list.path, async (req, res) => {
    const orphanages = await storage.getOrphanages();
    res.status(200).json(orphanages);
  });

  // Seed Database (call once at startup)
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  try {
    const existingOrphanages = await storage.getOrphanages();
    if (existingOrphanages.length === 0) {
      // Seed some dummy users
      const hashedPassword = await bcrypt.hash("password123", 10);
      
      const orphanage1 = await storage.createUser({
        email: "contact@hopehome.org",
        password: hashedPassword,
        role: "orphanage",
        name: "Hope Children's Home",
        location: "New York, NY",
        contactNumber: "123-456-7890"
      });

      const orphanage2 = await storage.createUser({
        email: "info@sunshinecare.org",
        password: hashedPassword,
        role: "orphanage",
        name: "Sunshine Orphanage",
        location: "Los Angeles, CA",
        contactNumber: "098-765-4321"
      });

      await storage.createUser({
        email: "donor@example.com",
        password: hashedPassword,
        role: "donor",
        name: "John Doe",
        location: null,
        contactNumber: null
      });

      // Seed needs
      await storage.createNeed({
        orphanageId: orphanage1.id,
        item: "Winter Coats",
        quantity: 50,
        description: "We need warm winter coats for children aged 5-12.",
        urgency: "High"
      });

      await storage.createNeed({
        orphanageId: orphanage1.id,
        item: "School Books",
        quantity: 100,
        description: "Math and Science textbooks for primary school students.",
        urgency: "Medium"
      });

      await storage.createNeed({
        orphanageId: orphanage2.id,
        item: "Rice and Beans",
        quantity: 200,
        description: "Staple food items for the upcoming month.",
        urgency: "Critical"
      });
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}