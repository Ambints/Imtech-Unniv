import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagerieController } from './messagerie.controller';
import { MessagerieService } from './messagerie.service';
import { MessageEnseignant } from './entities/message-enseignant.entity';
import { MessageDestinataire } from './entities/message-destinataire.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessageEnseignant,
      MessageDestinataire
    ])
  ],
  controllers: [MessagerieController],
  providers: [MessagerieService],
  exports: [MessagerieService]
})
export class MessagerieModule {}

// Made with Bob
