import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { type Pool } from 'pg';
import { AppModule } from '../src/app.module';
import { DATABASE_POOL } from '../src/database/database.providers';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function createApp(): Promise<{ app: INestApplication<App>; pool: Pool }> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  await app.init();

  const pool = moduleFixture.get<Pool>(DATABASE_POOL);
  return { app, pool };
}

let userToken: string;
let moderatorToken: string;
let userId: string;

async function registerAndLogin(
  app: INestApplication<App>,
  email: string,
  roleName: string,
  pool: Pool,
): Promise<{ token: string; id: string }> {
  // Register user
  const registerRes = await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      email,
      password: 'Password123!',
      fullName: 'Test User',
    });

  const id = registerRes.body.user?.id as string;

  // If moderator role needed, update directly in DB
  if (roleName !== 'user') {
    const roleRes = await pool.query<{ id: string }>(
      'SELECT id FROM roles WHERE name = $1',
      [roleName],
    );
    const roleId = roleRes.rows[0]?.id;
    if (roleId) {
      await pool.query('UPDATE users SET role_id = $1 WHERE id = $2', [roleId, id]);
    }
  }

  // Login to get a fresh token after potential role update
  const loginRes = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password: 'Password123!' });

  return { token: loginRes.body.accessToken as string, id };
}

function buildCreateListingPayload() {
  return {
    title: 'Bright 2-bed flat in Islington',
    listingType: 'residential_let',
    propertyType: 'flat',
    monthlyRent: 200000,
    addressLine1: '12 Baker Street',
    city: 'London',
    postcode: 'NW1 6XE',
    bedrooms: 2,
    bathrooms: 1,
  };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('ListingsController (e2e)', () => {
  let app: INestApplication<App>;
  let pool: Pool;

  beforeAll(async () => {
    ({ app, pool } = await createApp());
    ({ token: userToken, id: userId } = await registerAndLogin(
      app,
      `user-${Date.now()}@test.com`,
      'user',
      pool,
    ));
    ({ token: moderatorToken } = await registerAndLogin(
      app,
      `mod-${Date.now()}@test.com`,
      'moderator',
      pool,
    ));
  });

  afterEach(async () => {
    await pool.query('DELETE FROM listings WHERE user_id = $1', [userId]);
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['%@test.com']);
    await app.close();
  });

  // ── POST /listings ─────────────────────────────────────────────────────────

  describe('POST /listings', () => {
    it('returns 201 and creates a draft listing', async () => {
      const res = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(buildCreateListingPayload());

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        status: 'draft',
        title: 'Bright 2-bed flat in Islington',
        listingType: 'residential_let',
      });
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app.getHttpServer())
        .post('/listings')
        .send(buildCreateListingPayload());

      expect(res.status).toBe(401);
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Missing fields' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when postcode is not a valid UK postcode', async () => {
      const res = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...buildCreateListingPayload(), postcode: '12345' });

      expect(res.status).toBe(400);
    });
  });

  // ── GET /listings/me ───────────────────────────────────────────────────────

  describe('GET /listings/me', () => {
    it('returns only listings owned by the authenticated user', async () => {
      // Create a listing
      await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(buildCreateListingPayload());

      const res = await request(app.getHttpServer())
        .get('/listings/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].userId).toBe(userId);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app.getHttpServer()).get('/listings/me');
      expect(res.status).toBe(401);
    });
  });

  // ── GET /listings (admin only) ─────────────────────────────────────────────

  describe('GET /listings', () => {
    it('returns 403 when called by a regular user', async () => {
      const res = await request(app.getHttpServer())
        .get('/listings')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('returns all listings for moderator', async () => {
      await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(buildCreateListingPayload());

      const res = await request(app.getHttpServer())
        .get('/listings')
        .set('Authorization', `Bearer ${moderatorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ── GET /listings/:id ──────────────────────────────────────────────────────

  describe('GET /listings/:id', () => {
    it('returns 200 for the owner', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(buildCreateListingPayload());
      const listingId = createRes.body.id as string;

      const res = await request(app.getHttpServer())
        .get(`/listings/${listingId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(listingId);
    });

    it('returns 404 for non-existent listing', async () => {
      const res = await request(app.getHttpServer())
        .get('/listings/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ── PATCH /listings/:id ────────────────────────────────────────────────────

  describe('PATCH /listings/:id', () => {
    it('returns 200 and updates the draft listing', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(buildCreateListingPayload());
      const listingId = createRes.body.id as string;

      const res = await request(app.getHttpServer())
        .patch(`/listings/${listingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Title for the flat' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Title for the flat');
    });

    it('returns 400 when listing is not in draft status', async () => {
      // Create and submit listing
      const createRes = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(buildCreateListingPayload());
      const listingId = createRes.body.id as string;

      await request(app.getHttpServer())
        .post(`/listings/${listingId}/submit`)
        .set('Authorization', `Bearer ${userToken}`);

      const res = await request(app.getHttpServer())
        .patch(`/listings/${listingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Try to update after submit' });

      expect(res.status).toBe(400);
    });
  });

  // ── POST /listings/:id/submit ──────────────────────────────────────────────

  describe('POST /listings/:id/submit', () => {
    it('transitions draft to pending_review', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(buildCreateListingPayload());
      const listingId = createRes.body.id as string;

      const res = await request(app.getHttpServer())
        .post(`/listings/${listingId}/submit`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('pending_review');
    });

    it('returns 400 when listing is already submitted', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(buildCreateListingPayload());
      const listingId = createRes.body.id as string;

      await request(app.getHttpServer())
        .post(`/listings/${listingId}/submit`)
        .set('Authorization', `Bearer ${userToken}`);

      const res = await request(app.getHttpServer())
        .post(`/listings/${listingId}/submit`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
    });
  });

  // ── POST /listings/:id/publish ─────────────────────────────────────────────

  describe('POST /listings/:id/publish', () => {
    it('transitions pending_review to published by moderator', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(buildCreateListingPayload());
      const listingId = createRes.body.id as string;

      await request(app.getHttpServer())
        .post(`/listings/${listingId}/submit`)
        .set('Authorization', `Bearer ${userToken}`);

      const res = await request(app.getHttpServer())
        .post(`/listings/${listingId}/publish`)
        .set('Authorization', `Bearer ${moderatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('published');
    });

    it('returns 403 when called by a regular user', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(buildCreateListingPayload());
      const listingId = createRes.body.id as string;

      const res = await request(app.getHttpServer())
        .post(`/listings/${listingId}/publish`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ── POST /listings/:id/archive ─────────────────────────────────────────────

  describe('POST /listings/:id/archive', () => {
    it('archives a listing when owner requests', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(buildCreateListingPayload());
      const listingId = createRes.body.id as string;

      const res = await request(app.getHttpServer())
        .post(`/listings/${listingId}/archive`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('archived');
    });
  });

  // ── DELETE /listings/:id ───────────────────────────────────────────────────

  describe('DELETE /listings/:id', () => {
    it('returns 204 and soft-deletes listing when owner requests', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(buildCreateListingPayload());
      const listingId = createRes.body.id as string;

      const res = await request(app.getHttpServer())
        .delete(`/listings/${listingId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(204);

      // Verify it's gone from the API
      const getRes = await request(app.getHttpServer())
        .get(`/listings/${listingId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(getRes.status).toBe(404);
    });

    it('returns 404 for non-existent listing', async () => {
      const res = await request(app.getHttpServer())
        .delete('/listings/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ── GET /listings/pending-review ───────────────────────────────────────────

  describe('GET /listings/pending-review', () => {
    it('returns pending_review listings for moderator', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(buildCreateListingPayload());
      const listingId = createRes.body.id as string;

      await request(app.getHttpServer())
        .post(`/listings/${listingId}/submit`)
        .set('Authorization', `Bearer ${userToken}`);

      const res = await request(app.getHttpServer())
        .get('/listings/pending-review')
        .set('Authorization', `Bearer ${moderatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some((l: { id: string }) => l.id === listingId)).toBe(true);
    });

    it('returns 403 when called by a regular user', async () => {
      const res = await request(app.getHttpServer())
        .get('/listings/pending-review')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });
});
