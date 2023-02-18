import { Module } from '@nestjs/common';
import User from 'src/typeorm/User';
import UserToken from 'src/typeorm/UserToken';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserToken])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
