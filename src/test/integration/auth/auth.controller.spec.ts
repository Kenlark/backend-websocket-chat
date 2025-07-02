import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthService } from '../../../auth/auth.service';
import { AuthController } from '../../../auth/auth.controller';

jest.mock('bcrypt');

// Tests pour le contrôleur d'authentification
describe('AuthController', () => {
  let app: INestApplication;
  // On mock le service d'authentification pour isoler le contrôleur
  let authService = {
    login: jest.fn().mockImplementation((user) => {
      return { access_token: 'fakeAccessToken' };
    }),
    register: jest.fn().mockImplementation((email, password, username) => {
      return { _id: 'userId', email, username };
    }),
    validateUser: jest.fn().mockImplementation((email, password) => {
      if (email === 'test@email.com' && password === 'testpass') {
        return { _id: 'userId', email, username: 'testuser' };
      }
      throw new Error('Unauthorized');
    }),
  };

  // Initialisation de l'application NestJS pour les tests
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  // Fermeture de l'application après les tests
  afterAll(async () => {
    await app.close();
  });

  // Test de la route /auth/login
  it('/auth/login (POST) should return JWT token', () => {
    const loginDto = { email: 'test@email.com', password: 'testpass' };
    return request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
        expect(res.body.access_token).toBe('fakeAccessToken');
      });
  });

  // Test de la route /auth/register
  it('/auth/register (POST) should create a user', async () => {
    const registerDto = {
      email: 'new@email.com',
      password: 'newpass',
      username: 'newuser',
    };
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('message', 'Utilisateur créer');
        expect(res.body.user).toMatchObject({
          _id: 'userId',
          email: 'new@email.com',
          username: 'newuser',
        });
      });
  });
});
