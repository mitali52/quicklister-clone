import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  USERS_REPOSITORY,
  type IUsersRepository,
} from './interfaces/users-repository.interface';
import { type User } from './domain/user';
import * as cryptoHelper from '../common/helpers/crypto.helper';

// ── Builders ──────────────────────────────────────────────────────────────────

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-uuid-1',
    roleId: 'role-uuid-1',
    email: 'jane@example.com',
    passwordHash: 'salt:hash',
    fullName: 'Jane Smith',
    phoneNumber: null,
    avatarUrl: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    county: null,
    postcode: null,
    emailVerified: false,
    nrlaMember: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    ...overrides,
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<IUsersRepository>;

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateAvatar: jest.fn(),
      updatePassword: jest.fn(),
      softDelete: jest.fn(),
    };

    // Bind the symbol so NestJS DI is not needed in unit tests
    const providers = new Map([[USERS_REPOSITORY, repo]]);
    service = new UsersService(providers.get(USERS_REPOSITORY) as IUsersRepository);
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns paginated users', async () => {
      const user = buildUser();
      repo.findAll.mockResolvedValue({ data: [user], total: 1, page: 1, limit: 20 });

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findAll.mockRejectedValue(new Error('db down'));

      await expect(service.findAll({ page: 1, limit: 20 })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('returns a user when found', async () => {
      const user = buildUser();
      repo.findById.mockResolvedValue(user);

      const result = await service.findById(user.id);

      expect(result).toEqual(user);
    });

    it('throws NotFoundException when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── findByEmail ───────────────────────────────────────────────────────────

  describe('findByEmail', () => {
    it('returns null when email is not registered', async () => {
      repo.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('nobody@example.com');

      expect(result).toBeNull();
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findByEmail.mockRejectedValue(new Error('db error'));

      await expect(service.findByEmail('jane@example.com')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates and returns a user when the email is not taken', async () => {
      repo.findByEmail.mockResolvedValue(null);
      const user = buildUser();
      repo.create.mockResolvedValue(user);
      jest.spyOn(cryptoHelper, 'hashPassword').mockResolvedValue('salt:newhash');

      const result = await service.create({
        roleId: 'role-uuid-1',
        email: 'jane@example.com',
        password: 'secret123',
        fullName: 'Jane Smith',
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'jane@example.com', passwordHash: 'salt:newhash' }),
      );
      expect(result).toEqual(user);
    });

    it('throws ConflictException when email is already registered', async () => {
      repo.findByEmail.mockResolvedValue(buildUser());

      await expect(
        service.create({
          roleId: 'role-uuid-1',
          email: 'jane@example.com',
          password: 'secret123',
          fullName: 'Jane Smith',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── update (admin) ────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates and returns the user', async () => {
      const user = buildUser();
      const updated = buildUser({ fullName: 'Jane Updated' });
      repo.findById.mockResolvedValue(user);
      repo.update.mockResolvedValue(updated);

      const result = await service.update(user.id, { fullName: 'Jane Updated' });

      expect(repo.update).toHaveBeenCalledWith(user.id, expect.objectContaining({ fullName: 'Jane Updated' }));
      expect(result.fullName).toBe('Jane Updated');
    });

    it('throws NotFoundException when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update('missing', {})).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove (admin) ────────────────────────────────────────────────────────

  describe('remove', () => {
    it('soft-deletes the user', async () => {
      repo.findById.mockResolvedValue(buildUser());
      repo.softDelete.mockResolvedValue(undefined);

      await service.remove('user-uuid-1');

      expect(repo.softDelete).toHaveBeenCalledWith('user-uuid-1');
    });

    it('throws NotFoundException when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getProfile ────────────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('returns the authenticated user\'s profile', async () => {
      const user = buildUser();
      repo.findById.mockResolvedValue(user);

      const result = await service.getProfile(user.id);

      expect(result).toEqual(user);
    });

    it('throws NotFoundException when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getProfile('missing')).rejects.toThrow(NotFoundException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findById.mockRejectedValue(new Error('db error'));

      await expect(service.getProfile('user-uuid-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── updateProfile ─────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('updates and returns the updated profile', async () => {
      const user = buildUser();
      const updated = buildUser({ city: 'London', postcode: 'SW1A 1AA' });
      repo.findById.mockResolvedValue(user);
      repo.update.mockResolvedValue(updated);

      const result = await service.updateProfile(user.id, { city: 'London', postcode: 'SW1A 1AA' });

      expect(repo.update).toHaveBeenCalledWith(
        user.id,
        expect.objectContaining({ city: 'London', postcode: 'SW1A 1AA' }),
      );
      expect(result.city).toBe('London');
    });

    it('throws NotFoundException when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.updateProfile('missing', {})).rejects.toThrow(NotFoundException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findById.mockResolvedValue(buildUser());
      repo.update.mockRejectedValue(new Error('db error'));

      await expect(service.updateProfile('user-uuid-1', { city: 'London' })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── updateAvatar ──────────────────────────────────────────────────────────

  describe('updateAvatar', () => {
    const avatarUrl = 'https://s3.example.com/avatars/user-uuid-1.jpg';

    it('updates and returns the user with the new avatar URL', async () => {
      const user = buildUser();
      const updated = buildUser({ avatarUrl });
      repo.findById.mockResolvedValue(user);
      repo.updateAvatar.mockResolvedValue(updated);

      const result = await service.updateAvatar(user.id, avatarUrl);

      expect(repo.updateAvatar).toHaveBeenCalledWith(user.id, avatarUrl);
      expect(result.avatarUrl).toBe(avatarUrl);
    });

    it('throws NotFoundException when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.updateAvatar('missing', avatarUrl)).rejects.toThrow(NotFoundException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findById.mockResolvedValue(buildUser());
      repo.updateAvatar.mockRejectedValue(new Error('db error'));

      await expect(service.updateAvatar('user-uuid-1', avatarUrl)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ── changePassword ────────────────────────────────────────────────────────

  describe('changePassword', () => {
    it('updates the password when current password is correct', async () => {
      const user = buildUser({ passwordHash: 'salt:oldhash' });
      repo.findById.mockResolvedValue(user);
      jest.spyOn(cryptoHelper, 'verifyPassword').mockResolvedValue(true);
      jest.spyOn(cryptoHelper, 'hashPassword').mockResolvedValue('salt:newhash');
      repo.updatePassword.mockResolvedValue(undefined);

      await service.changePassword(user.id, {
        currentPassword: 'OldPass1!',
        newPassword: 'NewPass2@',
      });

      expect(repo.updatePassword).toHaveBeenCalledWith(user.id, 'salt:newhash');
    });

    it('throws UnauthorizedException when current password is wrong', async () => {
      repo.findById.mockResolvedValue(buildUser());
      jest.spyOn(cryptoHelper, 'verifyPassword').mockResolvedValue(false);

      await expect(
        service.changePassword('user-uuid-1', {
          currentPassword: 'WrongPass!',
          newPassword: 'NewPass2@',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws BadRequestException when new password equals current password', async () => {
      repo.findById.mockResolvedValue(buildUser());
      jest.spyOn(cryptoHelper, 'verifyPassword').mockResolvedValue(true);

      await expect(
        service.changePassword('user-uuid-1', {
          currentPassword: 'SamePass1!',
          newPassword: 'SamePass1!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.changePassword('missing', { currentPassword: 'x', newPassword: 'y' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── deleteAccount ─────────────────────────────────────────────────────────

  describe('deleteAccount', () => {
    it('soft-deletes the authenticated user\'s account', async () => {
      repo.findById.mockResolvedValue(buildUser());
      repo.softDelete.mockResolvedValue(undefined);

      await service.deleteAccount('user-uuid-1');

      expect(repo.softDelete).toHaveBeenCalledWith('user-uuid-1');
    });

    it('throws NotFoundException when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.deleteAccount('missing')).rejects.toThrow(NotFoundException);
    });

    it('wraps unexpected errors in InternalServerErrorException', async () => {
      repo.findById.mockResolvedValue(buildUser());
      repo.softDelete.mockRejectedValue(new Error('db error'));

      await expect(service.deleteAccount('user-uuid-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
