import { Controller, Get, Request, UseGuards, Res, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  @UseGuards(LocalAuthGuard)
  @Get()
  async bam(@Request() req) {
    console.log('Tired...');
    console.log(req.user);
  }
}
