import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
    private readonly uploadPath = join(process.cwd(), 'public', 'uploads', 'laboratory');

    constructor() {
        this.ensureUploadDirExists();
    }

    private ensureUploadDirExists() {
        if (!existsSync(this.uploadPath)) {
            mkdirSync(this.uploadPath, { recursive: true });
        }
    }

    async handleFileUpload(file: Express.Multer.File) {
        if (!file) {
            throw new Error('No file provided');
        }

        // Return the relative URL for frontend access
        // Assuming 'public' is served statically
        return {
            fileName: file.filename,
            originalName: file.originalname,
            url: `/uploads/laboratory/${file.filename}`,
            size: file.size,
            mimetype: file.mimetype,
        };
    }
}
