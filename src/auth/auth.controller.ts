import {
  Controller,
  Request,
  UseGuards,
  Res,
  Post,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import UserDto from 'src/users/dto/UserDto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './strategies/local-auth.guars';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req, @Res({ passthrough: true }) response: Response) {
    const token = req.user;
    response.cookie('token', token);
  }

  @Post('/register')
  async register(
    @Body() userDto: UserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.register(userDto);

    response.cookie('token', token);
    return token;
  }
}
