import { Module } from '@nestjs/common';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Word from 'src/typeorm/Word';
import WordTag from 'src/typeorm/WordTag';
import { TagsToWord } from 'src/typeorm/TagsToWord';
import DefinitionTag from 'src/typeorm/DefinitionTag';
import Example from 'src/typeorm/Example';
import Definition from 'src/typeorm/Definition';
import { TagsToDefinition } from 'src/typeorm/TagsToDefinition';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Word,
      WordTag,
      TagsToWord,
      DefinitionTag,
      Example,
      Definition,
      TagsToDefinition,
    ]),
  ],
  providers: [WordsService],
  controllers: [WordsController],
})
export class WordsModule {}
