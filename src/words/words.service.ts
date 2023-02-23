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
import { TagsToDefinition } from 'src/typeorm/TagsToDefinition';
import DefinitionTag from 'src/typeorm/DefinitionTag';
import DefinitionTagCreateDto from './dto/DefinitionTagCreateDto';
import DefinitionTagDto from './dto/DefinitionTagDto';

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
    @InjectRepository(DefinitionTag)
    private definitionTagsRepository: Repository<DefinitionTag>,
    @InjectRepository(TagsToDefinition)
    private tagsToDefinitionRepository: Repository<TagsToDefinition>,
  ) {}

  // WORD

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
    await this.handleWordTags(prevWord, tags);

    const prevDefinitions = prevWord.definitions;
    await this.updateDefinitions(prevWord, prevDefinitions, definitions);
    const updatedDefinitions = (await this.getWordByID(wordDto.id)).definitions;

    if (updatedDefinitions.length !== 0)
      await this.updateExamples(definitions, updatedDefinitions);

    return await this.getFullWord(wordDto.id);
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

    const updatedDefinitions = await this.definitionsRepository.save(
      definitionEntities,
    );

    await this.handleDefinitionsTag(updatedDefinitions, definitionsDto);

    const existingDefinitionIDs = definitionEntities
      .map((def) => def?.id)
      .filter((def) => def !== undefined);

    const deletedDefinitions = prevDefinitions.filter(
      (prevDef) => !existingDefinitionIDs.includes(prevDef.id),
    );
    const deletedDefinitionsTagsIDs = deletedDefinitions.flatMap((def) =>
      def.tagsToDefinition.map((tag) => tag.id),
    );
    const deletedExamples = deletedDefinitions.flatMap(
      (prevDef) => prevDef.examples,
    );

    if (deletedDefinitionsTagsIDs.length !== 0) {
      await this.tagsToDefinitionRepository.delete(deletedDefinitionsTagsIDs);
    }
    await this.examplesRepository.remove(deletedExamples);
    await this.definitionsRepository.remove(deletedDefinitions);
  }

  async handleDefinitionsTag(
    definitions: Definition[],
    definitionsDto: DefinitionDto[],
  ) {
    definitions.forEach(async (definition) => {
      const tagsToDeleteIDs = [];
      const tagsToUpdate = [];

      const prevTags = (await this.getTagsToDefinition(definition)).map(
        (tagToDefinition) => tagToDefinition.tag,
      );

      const tags =
        definitionsDto.find((def) => def.text === definition.text)?.tags || [];
      const tagsIDs = tags.map((tag) => tag?.id).filter((t) => t !== undefined);

      tagsToDeleteIDs.push(
        ...prevTags
          .filter((tag) => !tagsIDs.includes(tag.id))
          .map((tag) => tag.id),
      );

      const preparedTagsToUpdate = tags.map((tag) =>
        this.prepareDefinitionTagToUpdate(definition, tag),
      );

      tagsToUpdate.push(...preparedTagsToUpdate);

      if (tagsToDeleteIDs.length !== 0) {
        await this.tagsToDefinitionRepository.delete(tagsToDeleteIDs);
      }

      console.log(tagsToUpdate);

      if (tagsToUpdate.length !== 0) {
        await this.tagsToDefinitionRepository.save(tagsToUpdate);
      }
    });
  }

  private prepareDefinitionTagToUpdate(
    definition: Definition,
    definitionTagDto: DefinitionTagDto,
  ) {
    const tag = this.tagsToDefinitionRepository.create({
      ...definitionTagDto,
      definition,
    });

    return tag;
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

  // WORD TAGS
  async handleWordTags(word: Word, wordTagsDto: WordTagDto[]) {
    const prevTagsToWord = (await this.getTagsToWord(word)) || [];
    const prevTagsIDs = prevTagsToWord.map((tagToWord) => tagToWord.tag.id);

    const existingTagsIDs = wordTagsDto.map((tag) => tag.id);
    const tagsToDeleteIDs = prevTagsToWord
      .filter((prevTag) => !existingTagsIDs.includes(prevTag.tag.id))
      .map((t) => t.id);

    const newTags = wordTagsDto.filter((tag) => !prevTagsIDs.includes(tag.id));
    await this.assignTagsToWord(word, newTags);

    if (tagsToDeleteIDs.length !== 0) {
      await this.tagsToWordRepository.delete(tagsToDeleteIDs);
    }
  }

  async assignTagsToWord(word: Word, tagsToWordDto: WordTagDto[]) {
    const toAssign = tagsToWordDto.map((tag) =>
      this.tagsToWordRepository.create({
        tag,
        word,
      }),
    );

    await this.tagsToWordRepository.save(toAssign);
  }

  async getTagsToWord(word: Word) {
    const tagsToWord = await this.tagsToWordRepository
      .createQueryBuilder('tagsToWord')
      .leftJoinAndSelect('tagsToWord.word', 'word')
      .leftJoinAndSelect('tagsToWord.tag', 'tag')
      .where('tagsToWord.word = :wordID', { wordID: word.id })
      .getMany();

    return tagsToWord;
  }

  // WORD TAGS

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
      throw new Error(`WordTag with ID ${id} not found.`);
    }
  }

  async getTagsToDefinition(definition: Definition) {
    const tagsToDefinition = await this.tagsToDefinitionRepository
      .createQueryBuilder('tagsToDefinition')
      .leftJoinAndSelect('tagsToDefinition.definition', 'definition')
      .leftJoinAndSelect('tagsToDefinition.tag', 'tag')
      .where('tagsToDefinition.definition = :definitionID', {
        definitionID: definition.id,
      })
      .getMany();

    return tagsToDefinition;
  }

  // DEFINITION TAGS

  async getAllDefinitionTagsByUserID(userID: number) {
    const definitionTags = await this.definitionTagsRepository
      .createQueryBuilder('tag')
      .where('tag.user = :userID', { userID })
      .getMany();

    return definitionTags;
  }

  async createDefinitionTag(
    user: User,
    definitionTagCreateDto: DefinitionTagCreateDto,
  ) {
    const definitionTag = this.definitionTagsRepository.create({
      ...definitionTagCreateDto,
      user,
    });

    return await this.saveDefinitionTagAndExtract(definitionTag);
  }

  async updateDefinitionTag(defintionTagDto: DefinitionTagDto) {
    return await this.saveDefinitionTagAndExtract(defintionTagDto);
  }

  async deleteDefinitionTagByID(id: number) {
    const defintionTag = await this.definitionTagsRepository.find({
      where: {
        id,
      },
    });

    if (defintionTag) {
      await this.definitionTagsRepository.delete(id);
    } else {
      throw new Error(`WordTag with ID ${id} not found.`);
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

  async saveDefinitionTagAndExtract(definitionTagDto: DefinitionTagDto) {
    const {
      user: u,
      tagsToDefinition,
      ...tag
    } = await this.definitionTagsRepository.save(definitionTagDto);

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

    return word;
  }

  async getFullWord(wordID: number) {
    const word = await this.wordsRepository
      .createQueryBuilder('word')
      .leftJoinAndSelect('word.definitions', 'definitions')
      .leftJoinAndSelect('definitions.examples', 'examples')
      .where('word.id = :wordID', { wordID })
      .getOne();

    word.definitions = await this.assignTagsToDefinition(word.definitions);

    const wordTags = await this.getTagsToWord(word);

    return {
      ...word,
      tags: wordTags.map((w) => w.tag),
    };
  }

  async assignTagsToDefinition(definitions: Definition[]) {
    const updatedDefs = [];

    const go = async () => {
      for (let i = 0; i < definitions.length; i++) {
        const definition = definitions[i];

        const tags = (await this.getTagsToDefinition(definition)).map(
          (e) => e.tag,
        );

        updatedDefs.push({
          ...definition,
          tags,
        });
      }
    };

    await go();

    return updatedDefs;
  }
}
