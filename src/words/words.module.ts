import { Module } from '@nestjs/common';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Word from 'src/typeorm/Word';
import WordTag from 'src/typeorm/WordTag';
import { TagsToWord } from 'src/typeorm/TagsToWord';

@Module({
  imports: [TypeOrmModule.forFeature([Word, WordTag, TagsToWord])],
  providers: [WordsService],
  controllers: [WordsController],
})
export class WordsModule {}
