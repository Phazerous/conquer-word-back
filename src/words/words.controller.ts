import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes';
import WordDto from './dto/WordDto';
import { WordsService } from './words.service';

@Controller('/word')
export class WordsController {
  constructor(private wordsService: WordsService) {}

  // @Get('/magic')
  // async smth() {
  //   await this.wordsService.getWordById(1);
  //   return 'Done';
  // }

  @Post('/create')
  async createWord(@Body() wordDto: WordDto) {
    return this.wordsService.createWord(wordDto);
  }

  @Get(':wordID')
  async getWordById(@Param('wordID', ParseIntPipe) wordID: number) {
    const word = this.wordsService.getWordById(wordID);
    return word;
  }

  // async createWord(user: User, wordDto: WordDto) {
  //   const word = this.wordsRepository.create(wordDto);
  //   word.user = user;

  // }
}
