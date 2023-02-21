import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/typeorm/User';
import Word from 'src/typeorm/Word';
import WordDto from './dto/WordDto';
import { getMetadataArgsStorage, Repository } from 'typeorm';
import WordTag from 'src/typeorm/WordTag';
import { TagsToWord } from 'src/typeorm/TagsToWord';
import CreationWordTag from './dto/CreationWordTag';
import DefinitionDto from './dto/DefinitionDto';
import Definition from 'src/typeorm/Definition';
import ExampleDto from './dto/ExampleDto';
import Example from 'src/typeorm/Example';

@Injectable()
export class WordsService {
  constructor(
    @InjectRepository(Word) private wordsRepository: Repository<Word>,
    @InjectRepository(WordTag) private wordsTagsRepository: Repository<WordTag>,
    @InjectRepository(Definition)
    private definitionsRepository: Repository<Definition>,
    @InjectRepository(Example) private examplesRepository: Repository<Example>,
    @InjectRepository(TagsToWord)
    private tagsToWordRepository: Repository<TagsToWord>,
  ) {}

  async createWord(wordDto: WordDto) {
    const { tags, definitions, ...rest } = wordDto;

    const word = await this.wordsRepository.save(rest);
    await this.handleDefinitions(word, definitions);
    // await this.assignWordTags(word, tags);

    return await this.getWordById(word.id);
  }

  async assignWordTags(word: Word, tags: WordTag[]) {
    const tagsToWord = tags.map((tag) =>
      this.tagsToWordRepository.create({ tag, word }),
    );

    await this.tagsToWordRepository.save(tagsToWord);
  }

  async handleDefinitions(word: Word, definitionsDto: DefinitionDto[]) {
    const definitionsEntities: Definition[] = definitionsDto
      ? definitionsDto.map((definitionDto: DefinitionDto) => {
          const { tags, examples, ...def } = definitionDto;

          const definitionEntity = this.definitionsRepository.create({
            ...def,
            word,
          });

          return definitionEntity;
        })
      : [];

    if (definitionsEntities.length !== 0) {
      const definitions = await this.definitionsRepository.save(
        definitionsEntities,
      );

      const examplesEntities: Example[] = [];

      definitions.map((definition) => {
        const def = definitionsDto.find((def) => def.text === definition.text);

        if (def && def.examples) {
          const examples = this.prepareDefinitionExamples(
            definition,
            def.examples,
          );
          if (examples.length !== 0) examplesEntities.push(...examples);
        }
      });

      if (examplesEntities.length !== 0) {
        await this.examplesRepository.save(examplesEntities);
      }
    }
  }

  prepareDefinitionExamples(
    definition: Definition,
    examplesDto: ExampleDto[],
  ): Example[] {
    const examples: Example[] = examplesDto
      ? examplesDto.map((example: ExampleDto) => {
          const { content } = example;

          const exampleEntity = this.examplesRepository.create({
            content,
            definition,
          });

          return exampleEntity;
        })
      : [];

    return examples;
  }

  // async updateWord(wordDto: WordDto) {
  //   const { tags, definitions, id, ...word } = wordDto;
  //   const prevWord = this.wordsRepository()

  // }

  async getWordById(wordID: number) {
    const word = await this.wordsRepository
      .createQueryBuilder('word')
      .leftJoinAndSelect('word.definitions', 'definitions')
      .leftJoinAndSelect('definitions.examples', 'examples')
      .where('word.id = :wordID', { wordID })
      .getOne();

    // const tags = await this.tagsToWordRepository
    //   .createQueryBuilder('tagsToWord')
    //   .leftJoin('tagsToWord.tag', 'tag')
    //   .leftJoin('tagsToWord.word', 'word')
    //   .where('word.id = :wordID', { wordID })
    //   .select('tag.title', 'title')
    //   .getRawMany();

    // const tagTitles = tags.map((tag) => tag.title);

    // const preparedWord = {
    //   ...word,
    //   tags: tagTitles,
    // };

    return word;
  }

  async createWordTag(user: User, creationWordTag: CreationWordTag) {
    const wordTag = this.wordsTagsRepository.create(creationWordTag);
    wordTag.user = user;

    const { user: u, ...tag } = await this.wordsTagsRepository.save(wordTag);

    return tag;
  }

  async selectAllWordTags(user: User) {
    const tags = await this.wordsTagsRepository
      .createQueryBuilder('tags')
      .where('tags.user = :userID', { userID: user.id })
      .getMany();

    return tags;
  }
}
