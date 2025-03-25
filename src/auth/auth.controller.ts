import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { RefreshTokenGuard } from 'src/common-guards/refreshToken.guard';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from 'src/common-guards/accessToken.guard';
import { CreateUserDto, LoginDto, VerifyUserDto } from 'src/users/dto/user.dto';
import { UserModel } from 'src/users/schemas/user.schema';
import { User } from 'src/users/interfaces/user.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('signin')
  signin(@Body() data: LoginDto) {
    return this.authService.signIn(data);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logout(@Req() req: Request) {
    this.authService.logout(req.user['sub']);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: Request) {
    const userEmail = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userEmail, refreshToken);
  }

  @Post('verifyUser') 
  @HttpCode(HttpStatus.OK)
  async consult(@Body() verifyUserDto:VerifyUserDto):Promise<any>{
      return await this.authService.verifyUser(verifyUserDto)
  } 



  
}
