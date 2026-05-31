import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';
import { STORAGE_ADAPTER } from './adapters/storage-adapter.interface';

@Module({
  providers: [
    { provide: STORAGE_ADAPTER, useClass: LocalStorageAdapter },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
