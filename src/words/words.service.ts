import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/typeorm/User';
import Word from 'src/typeorm/Word';
import WordDto from './dto/WordDto';
import { getMetadataArgsStorage, Repository } from 'typeorm';
import WordTag from 'src/typeorm/WordTag';
import { TagsToWord } from 'src/typeorm/TagsToWord';
import TagDto from './dto/TagDto';

@Injectable()
export class WordsService {
  constructor(
    @InjectRepository(Word) private wordsRepository: Repository<Word>,
    @InjectRepository(WordTag) private wordsTagsRepository: Repository<WordTag>,
    @InjectRepository(TagsToWord)
    private tagsToWordRepository: Repository<TagsToWord>,
  ) {}

  async createWord(wordDto: WordDto) {
    const { tags, ...rest } = wordDto;

    const word = await this.wordsRepository.save(rest);
    await this.assignWordTags(word, tags);

    return await this.getWordById(word.id);
  }

  async assignWordTags(word: Word, tags: TagDto[]) {
    const tagsToWord = tags.map((tag) =>
      this.tagsToWordRepository.create({ tag, word }),
    );

    await this.tagsToWordRepository.save(tagsToWord);
  }

  async getWordById(wordID: number) {
    const word = await this.wordsRepository.findOne({ where: { id: wordID } });

    const tags = await this.tagsToWordRepository
      .createQueryBuilder('tagsToWord')
      .leftJoin('tagsToWord.tag', 'tag')
      .leftJoin('tagsToWord.word', 'word')
      .where('word.id = :wordID', { wordID })
      .select('tag.title', 'title')
      .getRawMany();

    const tagTitles = tags.map((tag) => tag.title);

    const preparedWord = {
      ...word,
      tags: tagTitles,
    };

    return preparedWord;
  }
}
