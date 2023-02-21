import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { CookieAuthGuard } from 'src/auth/strategies/cookie-auth.guard';
import CreationWordTag from './dto/CreationWordTag';
import WordDto from './dto/WordDto';
import { WordsService } from './words.service';

@Controller()
export class WordsController {
  constructor(private wordsService: WordsService) {}

  @Get('/test')
  async getWord() {
    await this.wordsService.selectWordByID(1);
  }

  @Post('/create')
  async createWord(@Body() wordDto: WordDto) {
    return this.wordsService.createWord(wordDto);
  }

  @UseGuards(CookieAuthGuard)
  @Get('/wordTags')
  async getAllTags(@Request() req) {
    return this.wordsService.selectAllWordTags(req.user);
  }

  @UseGuards(CookieAuthGuard)
  @Post('/wordTags')
  async createWordTag(
    @Body() creationWordTag: CreationWordTag,
    @Request() req,
  ) {
    return this.wordsService.createWordTag(req.user, creationWordTag);
  }

  @Get(':wordID')
  async getWordById(@Param('wordID', ParseIntPipe) wordID: number) {
    const word = this.wordsService.getWordById(wordID);
    return word;
  }
}
