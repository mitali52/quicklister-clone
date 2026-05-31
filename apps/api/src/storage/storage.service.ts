import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { STORAGE_ADAPTER, type IStorageAdapter, type UploadResult } from './adapters/storage-adapter.interface';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_ADAPTER)
    private readonly adapter: IStorageAdapter,
  ) {}

  validateImage(file: Express.Multer.File): void {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type "${file.mimetype}". Allowed types: JPEG, PNG, WebP.`,
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is 10 MB.`,
      );
    }
  }

  async upload(file: Express.Multer.File): Promise<UploadResult> {
    this.validateImage(file);
    return this.adapter.upload(file);
  }

  async delete(filename: string): Promise<void> {
    return this.adapter.delete(filename);
  }
}
