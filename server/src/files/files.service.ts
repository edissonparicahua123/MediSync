import { Injectable, BadRequestException } from '@nestjs/common';
import { join, extname } from 'path';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
    private readonly uploadDir = join(process.cwd(), 'uploads', 'messages');

    // Allowed file types for messages
    private readonly allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
    ];

    private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

    constructor() {
        // Create upload directory if it doesn't exist
        if (!existsSync(this.uploadDir)) {
            mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<{
        url: string;
        name: string;
        type: string;
        size: number;
    }> {
        // Validate file type
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `Tipo de archivo no permitido. Tipos permitidos: imágenes, PDF, Word, Excel, texto`
            );
        }

        // Validate file size
        if (file.size > this.maxFileSize) {
            throw new BadRequestException(
                `El archivo excede el tamaño máximo permitido de ${this.maxFileSize / (1024 * 1024)}MB`
            );
        }

        // Generate unique filename
        const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
        const filePath = join(this.uploadDir, uniqueName);

        // Save file to disk
        writeFileSync(filePath, file.buffer);

        return {
            url: `/api/v1/files/${uniqueName}`,
            name: file.originalname,
            type: file.mimetype,
            size: file.size,
        };
    }

    async deleteFile(fileUrl: string): Promise<void> {
        if (!fileUrl) return;

        const filename = fileUrl.split('/').pop();
        if (!filename) return;

        const filePath = join(this.uploadDir, filename);

        if (existsSync(filePath)) {
            unlinkSync(filePath);
        }
    }

    getFilePath(filename: string): string {
        return join(this.uploadDir, filename);
    }

    isImage(mimeType: string): boolean {
        return mimeType.startsWith('image/');
    }
}
