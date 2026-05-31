import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './categories.repository';
import { CATEGORIES_REPOSITORY } from './interfaces/categories-repository.interface';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoriesController],
  providers: [
    { provide: CATEGORIES_REPOSITORY, useClass: CategoriesRepository },
    CategoriesService,
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}
