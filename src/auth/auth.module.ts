import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import User from 'src/typeorm/User';
import UserToken from 'src/typeorm/UserToken';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalStrategy } from './strategies/local.strategy';
import { CookieStrategy } from './strategies/cookie.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([User, UserToken]),
  ],
  providers: [AuthService, LocalStrategy, CookieStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
