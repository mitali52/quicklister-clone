import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import type { IStorageAdapter, UploadResult } from './storage-adapter.interface';

@Injectable()
export class LocalStorageAdapter implements IStorageAdapter {
  private readonly uploadDir: string;
  private readonly urlPrefix: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads', 'listing-media');
    this.urlPrefix = '/uploads/listing-media';
    fs.mkdirSync(this.uploadDir, { recursive: true });
  }

  async upload(file: Express.Multer.File): Promise<UploadResult> {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${crypto.randomUUID()}${ext}`;
    const dest = path.join(this.uploadDir, filename);
    await fs.promises.writeFile(dest, file.buffer);
    return { url: `${this.urlPrefix}/${filename}`, filename };
  }

  async delete(filename: string): Promise<void> {
    const filePath = path.join(this.uploadDir, filename);
    await fs.promises.unlink(filePath).catch(() => {
      // File already gone — not an error
    });
  }
}
