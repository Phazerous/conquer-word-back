import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import User from 'src/typeorm/User';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async login(email: string, pass: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (user && user.password === pass) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      console.log('here');
      return await this.assignToken(user);
    }

    return null;
  }

  async validateUser(token: string) {
    const user = await this.usersService.findOneByToken(token);

    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, tokens, ...result } = user;
      return result;
    }

    return null;
  }

  async assignToken(user: User): Promise<string> {
    const token = this.generateToken();

    return await this.usersService.assignToken(user, token);
  }

  generateToken() {
    return nanoid(27);
  }
}
