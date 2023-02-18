import { Controller, Get, Request, UseGuards, Res, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { CookieAuthGuard } from './strategies/cookie-auth.guard';
import { CookieStrategy } from './strategies/cookie.strategy';
import { LocalAuthGuard } from './strategies/local-auth.guars';
import { LocalStrategy } from './strategies/local.strategy';

@Controller('auth')
export class AuthController {
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req, @Res({ passthrough: true }) response: Response) {
    const token = req.user;
    response.cookie('token', token);
  }

  @UseGuards(CookieAuthGuard)
  @Get('/user')
  async getUser(@Request() req) {
    return req.user;
  }
}
