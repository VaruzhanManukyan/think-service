import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule as NestRedisModule, type RedisModuleOptions } from "@nestjs-modules/ioredis";

@Global()
@Module({
  imports: [
    ConfigModule,
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      inject:  [ConfigService],
      useFactory: (config: ConfigService): RedisModuleOptions => ({
        type: 'single',
        url: `redis://${config.getOrThrow<string>('REDIS_HOST')}:${config.getOrThrow<number>('REDIS_PORT')}`,
      }),
    }),
  ],
  exports: [NestRedisModule],
})
export class RedisModule {}
