import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TaskModule } from './task/task.module';
import { databaseConfig } from './config/database.config';
import { UserModule } from './users/user.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Obtener la URI del ConfigService pero usar las opciones de databaseConfig
        const uri = configService.get('MONGODB_URI');
        return {
          uri,
          ...databaseConfig.options,
        };
      },
    }),
    TaskModule,UserModule, EmailModule, AuthModule
  ],
})
export class AppModule {}
