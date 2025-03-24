import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from 'src/users/schemas/user.schema';
import { UserModule } from 'src/users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  exports:[AuthModule],
  controllers: [AuthController,],//AÑADIMOS EL USERMODULE-----
  providers: [AuthService],//USERSERVICE PODRÍA NO IR AQUÍ-----
  imports: [MongooseModule.forFeature([
        { name: UserModel.name, schema: UserSchema }//PARA MANEJAR NUESTRA BASE DE DATOS-----
      ]),
      JwtModule.register({
        global: true,
        secret: jwtConstants.secret,
        signOptions: { expiresIn: '60s' },
      }),UserModule]//LO IMPORTAMOS DE MANERA GLOBAL EN NUESTRA APLICACIÓN
      
})
export class AuthModule {}
