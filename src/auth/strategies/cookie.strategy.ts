import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-cookie';
import { AuthService } from '../auth.service';

@Injectable()
export class CookieStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      cookieName: 'token',
      signed: false,
      passReqToCallback: false,
    });
  }

  async validate(token: string): Promise<any> {
    const user = await this.authService.validateUser(token);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
