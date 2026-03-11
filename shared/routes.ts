import { z } from 'zod';
import { insertUserSchema, insertNeedSchema, users, needs, donations } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  unauthorized: z.object({ message: z.string() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.object({ token: z.string(), user: z.custom<typeof users.$inferSelect>() }),
        400: errorSchemas.validation,
      }
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ email: z.string(), password: z.string() }),
      responses: {
        200: z.object({ token: z.string(), user: z.custom<typeof users.$inferSelect>() }),
        401: errorSchemas.unauthorized,
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  needs: {
    list: {
      method: 'GET' as const,
      path: '/api/needs' as const,
      input: z.object({
        search: z.string().optional(),
        location: z.string().optional()
      }).optional(),
      responses: {
        200: z.array(z.custom<any>()), // NeedWithOrphanage
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/needs' as const,
      input: insertNeedSchema,
      responses: {
        201: z.custom<typeof needs.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/needs/:id/status' as const,
      input: z.object({ status: z.string() }),
      responses: {
        200: z.custom<typeof needs.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      }
    }
  },
  donations: {
    create: {
      method: 'POST' as const,
      path: '/api/donations' as const,
      input: z.object({
        needId: z.coerce.number().optional(),
        orphanageId: z.coerce.number(),
        type: z.string(),
        quantity: z.coerce.number().optional(),
        amount: z.string().optional(),
        message: z.string().optional()
      }),
      responses: {
        201: z.custom<typeof donations.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    }
  },
  orphanages: {
    list: {
      method: 'GET' as const,
      path: '/api/orphanages' as const,
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
