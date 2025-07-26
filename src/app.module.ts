import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { VehicesModule } from './vehices/vehices.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    RolesModule,
    UsersModule,
    AuthModule,
    VehicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
