import { Injectable } from '@nestjs/common';
import UserDto from './dto/UserDto';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/typeorm/User';
import { Repository } from 'typeorm';
import UserToken from 'src/typeorm/UserToken';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(UserToken)
    private tokensRepository: Repository<UserToken>,
  ) {}

  // CHECK IF EMAIL DOESN'T EXIST
  async createUser(userDto: UserDto) {
    const { email, password } = userDto;

    const user = new User();
    user.email = email;
    user.password = password;

    return await this.usersRepository.save(user);
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });

    return user;
  }

  async findOneByToken(token: string) {
    const tokenEntity = await this.tokensRepository
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token })
      .getOne();

    return tokenEntity?.user;
  }

  async assignToken(user: User, token: string): Promise<string> {
    const tokenEntity = new UserToken();
    tokenEntity.token = token;
    tokenEntity.user = user;

    return (await this.tokensRepository.save(tokenEntity)).token;
  }
}
