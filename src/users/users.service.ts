import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const user = this.repo.create(createUserDto);
    const savedUser = await this.repo.save(user);

    return plainToInstance(UserDto, savedUser, {
      excludeExtraneousValues: true,
    });
  }
}
