import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from 'src/users/schemas/user.schema';
import { UserModule } from 'src/users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  exports:[AuthModule],
  controllers: [AuthController,],//AÑADIMOS EL USERMODULE-----
  providers: [AuthService,AccessTokenStrategy,RefreshTokenStrategy],//USERSERVICE PODRÍA NO IR AQUÍ-----
  imports: [
      JwtModule.register({}),
      UserModule,
      PassportModule]//LO IMPORTAMOS DE MANERA GLOBAL EN NUESTRA APLICACIÓN
      
})
export class AuthModule {}
