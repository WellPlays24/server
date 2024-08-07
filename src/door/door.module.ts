import { Module } from '@nestjs/common';
import { DoorService } from './door.service';
import { DoorController } from './door.controller';
import { HttpModule } from '@nestjs/axios';
import { DoorHistory } from './entities/historial.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [DoorController],
  imports: [HttpModule, TypeOrmModule.forFeature([DoorHistory]) ],
  providers: [DoorService],
})
export class DoorModule {}
