import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { CookieAuthGuard } from 'src/auth/strategies/cookie-auth.guard';
import DefinitionTagCreateDto from './dto/DefinitionTagCreateDto';
import DefinitionTagDto from './dto/DefinitionTagDto';
import WordDto from './dto/WordDto';
import WordTagCreateDto from './dto/WordTagCreateDto';
import WordTagDto from './dto/WordTagDto';
import { WordsService } from './words.service';

@Controller()
export class WordsController {
  constructor(private wordsService: WordsService) {}

  @UseGuards(CookieAuthGuard)
  @Get('wordTag')
  async getAllWordTags(@Request() req) {
    console.log(req.user);
    return await this.wordsService.getAllWordTagsByUserID(req.user.id);
  }

  @UseGuards(CookieAuthGuard)
  @Post('wordTag')
  async createWordTag(
    @Body() wordTagCreateDto: WordTagCreateDto,
    @Request() req,
  ) {
    return await this.wordsService.createWordTag(req.user, wordTagCreateDto);
  }

  @UseGuards(CookieAuthGuard)
  @Patch('wordTag')
  async updateWordTag(@Body() wordTagDto: WordTagDto) {
    return await this.wordsService.updateWordTag(wordTagDto);
  }

  @UseGuards(CookieAuthGuard)
  @Delete('wordTag/:id')
  async deleteWordTagByID(@Param('id', ParseIntPipe) id: number) {
    await this.wordsService.deleteWordTagByID(id);
  }

  @UseGuards(CookieAuthGuard)
  @Post('/create')
  async createWord(@Body() wordDto: WordDto, @Request() req) {
    return this.wordsService.createWord(req.user, wordDto);
  }

  @Post('/update')
  async updateWord(@Body() wordDto: WordDto) {
    return await this.wordsService.updateWord(wordDto);
  }

  @UseGuards(CookieAuthGuard)
  @Get('/wordTags')
  async getAllTags(@Request() req) {
    return this.wordsService.selectAllWordTags(req.user);
  }

  // DEFINITION TAG

  @UseGuards(CookieAuthGuard)
  @Get('definitionTag')
  async getAllDefinitionTags(@Request() req) {
    console.log(req.user);
    return await this.wordsService.getAllDefinitionTagsByUserID(req.user.id);
  }

  @UseGuards(CookieAuthGuard)
  @Post('definitionTag')
  async createDefinitionTag(
    @Body() definitionTag: DefinitionTagCreateDto,
    @Request() req,
  ) {
    return await this.wordsService.createDefinitionTag(req.user, definitionTag);
  }

  @UseGuards(CookieAuthGuard)
  @Patch('definitionTag')
  async updateDefinitionTag(@Body() definitionTag: DefinitionTagDto) {
    return await this.wordsService.updateDefinitionTag(definitionTag);
  }

  @UseGuards(CookieAuthGuard)
  @Delete('definitionTag/:id')
  async deleteDefinitionTagByID(@Param('id', ParseIntPipe) id: number) {
    await this.wordsService.deleteDefinitionTagByID(id);
  }

  // @UseGuards(CookieAuthGuard)
  // @Post('/wordTags')
  // async createWordTag(
  //   @Body() creationWordTag: CreationWordTag,
  //   @Request() req,
  // ) {
  //   return this.wordsService.createWordTag(req.user, creationWordTag);
  // }

  @Get(':wordID')
  async getWordById(@Param('wordID', ParseIntPipe) wordID: number) {
    const word = this.wordsService.getFullWord(wordID);
    return word;
  }
}
