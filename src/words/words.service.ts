import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/typeorm/User';
import Word from 'src/typeorm/Word';
import WordDto from './dto/WordDto';
import { getMetadataArgsStorage, Repository } from 'typeorm';
import WordTag from 'src/typeorm/WordTag';
import { TagsToWord } from 'src/typeorm/TagsToWord';
import DefinitionDto from './dto/DefinitionDto';
import Definition from 'src/typeorm/Definition';
import ExampleDto from './dto/ExampleDto';
import Example from 'src/typeorm/Example';
import WordTagCreateDto from './dto/WordTagCreateDto';
import WordTagDto from './dto/WordTagDto';

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

  async createWord(user: User, wordDto: WordDto) {
    const wordEntity = new Word();
    wordEntity.title = wordDto.title;
    wordEntity.user = user;

    const word = await this.wordsRepository.save(wordEntity);
    wordDto.id = word.id;

    return this.updateWord(wordDto);
  }

  async updateWord(wordDto: WordDto) {
    const { tags, definitions } = wordDto;

    const prevWord = await this.getWordByID(wordDto.id);
    await this.updateWordContent(prevWord, wordDto);

    const prevDefinitions = prevWord.definitions;
    await this.updateDefinitions(prevWord, prevDefinitions, definitions);
    const updatedDefinitions = (await this.getWordByID(wordDto.id)).definitions;

    if (updatedDefinitions.length !== 0)
      await this.updateExamples(definitions, updatedDefinitions);

    return this.getWordByID(wordDto.id);
  }

  private async updateWordContent(word: Word, wordDto: WordDto) {
    word.title = wordDto.title;
    word.lang = wordDto.lang;
    word.pronunciation = wordDto.pronunciation;
    word.description = wordDto.description;
    word.etymology = wordDto.etymology;

    return await this.wordsRepository.save(word);
  }

  private async updateDefinitions(
    word: Word,
    prevDefinitions: Definition[],
    definitionsDto: DefinitionDto[],
  ) {
    const definitionEntities = definitionsDto
      ? definitionsDto.map((definitionDto: DefinitionDto) =>
          'id' in definitionDto
            ? (definitionDto as unknown as Definition)
            : this.createNewDefinition(word, definitionDto),
        )
      : [];

    await this.definitionsRepository.save(definitionEntities);

    const existingDefinitionIDs = definitionEntities
      .map((def) => def?.id)
      .filter((def) => def !== undefined);

    const deletedDefinitions = prevDefinitions.filter(
      (prevDef) => !existingDefinitionIDs.includes(prevDef.id),
    );
    const deletedExamples = deletedDefinitions.flatMap(
      (prevDef) => prevDef.examples,
    );

    await this.examplesRepository.remove(deletedExamples);
    await this.definitionsRepository.remove(deletedDefinitions);
  }

  private createNewDefinition(
    word: Word,
    definitionDto: DefinitionDto,
  ): Definition {
    const definition = new Definition();
    definition.text = definitionDto.text;
    definition.description = definitionDto.description;
    definition.part_of_speech = definitionDto.part_of_speech;
    definition.word = word;
    return definition;
  }

  private async updateExamples(
    definitionsDtos: DefinitionDto[],
    prevDefinitions: Definition[],
  ) {
    const examplesToDelete: Example[] = [];
    const examplesToSave: Example[] = [];

    definitionsDtos.forEach((definition) => {
      const prevExamples = prevDefinitions.find(
        (def) => def.text === definition.text,
      ).examples;

      const exampleEntities: Example[] = definition?.examples
        ? definition.examples.map((exampleDto: ExampleDto) =>
            exampleDto?.id
              ? (exampleDto as unknown as Example)
              : this.createNewExample(
                  definition as unknown as Definition,
                  exampleDto,
                ),
          )
        : [];

      const existingExamplesIDs = exampleEntities
        .map((ex) => ex?.id)
        .filter((ex) => ex !== undefined);

      const deletedExamples = prevExamples.filter(
        (ex) => !existingExamplesIDs.includes(ex.id),
      );

      examplesToDelete.push(...deletedExamples);
      examplesToSave.push(...exampleEntities);
    });

    await this.examplesRepository.save(examplesToSave);
    await this.examplesRepository.remove(examplesToDelete);
  }

  private createNewExample(definition: Definition, exampleDto: ExampleDto) {
    const example = new Example();
    example.content = exampleDto.content;
    example.definition = definition;
    return example;
  }

  // TAGS

  async getAllWordTagsByUserID(userID: number) {
    const wordTags = await this.wordsTagsRepository
      .createQueryBuilder('tag')
      .where('tag.user = :userID', { userID })
      .getMany();

    return wordTags;
  }

  async createWordTag(user: User, wordTagCreateDto: WordTagCreateDto) {
    const wordTag = this.wordsTagsRepository.create({
      ...wordTagCreateDto,
      user,
    });

    return await this.saveWordTagAndExtract(wordTag);
  }

  async updateWordTag(wordTagDto: WordTagDto) {
    return await this.saveWordTagAndExtract(wordTagDto);
  }

  async deleteWordTagByID(id: number) {
    const wordTag = await this.wordsTagsRepository.find({
      where: {
        id,
      },
    });

    if (wordTag) {
      await this.wordsTagsRepository.delete(id);
    } else {
      throw new Error(`WordTag with ID ${id} not fund.`);
    }
  }

  // SELECTION

  async saveWordTagAndExtract(wordTag: WordTagDto) {
    const {
      user: u,
      tagsToWord,
      ...tag
    } = await this.wordsTagsRepository.save(wordTag);

    return tag;
  }

  async selectAllWordTags(user: User) {
    const tags = await this.wordsTagsRepository
      .createQueryBuilder('tags')
      .where('tags.user = :userID', { userID: user.id })
      .getMany();

    return tags;
  }

  async getWordByID(wordID: number) {
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
}
