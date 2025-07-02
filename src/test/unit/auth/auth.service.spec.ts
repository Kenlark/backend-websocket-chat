import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../auth/auth.service';
import { UsersService } from '../../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;

  // Avant chaque test, on mock le UsersService et le JwtService
  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('token') },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  // Test : l'utilisateur n'existe pas
  it('should throw if user not found', async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
    await expect(authService.validateUser('a@a.com', 'pass')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  // Test : le mot de passe est invalide
  it('should throw if password is invalid', async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValue({
      password: 'hash',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(authService.validateUser('a@a.com', 'pass')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  // Test : l'utilisateur est valide, on ne retourne pas le mot de passe
  it('should return user without password if valid', async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValue({
      password: 'hash',
      email: 'a@a.com',
      _id: 'id',
      username: 'user',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const result = await authService.validateUser('a@a.com', 'pass');
    expect(result).toEqual({ email: 'a@a.com', _id: 'id', username: 'user' });
  });
});
