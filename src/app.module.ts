import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import DefinitionTag from './typeorm/DefinitionTag';
import { TagsToWord } from './typeorm/TagsToWord';
import User from './typeorm/User';
import UserToken from './typeorm/UserToken';
import Word from './typeorm/Word';
import WordTag from './typeorm/WordTag';
import { UsersModule } from './users/users.module';
import { WordsModule } from './words/words.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, UserToken, Word, WordTag, TagsToWord, DefinitionTag],
      synchronize: true,
    }),
    WordsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
