import {
    Controller,
    Post,
    Get,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Res,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { existsSync } from 'fs';

@ApiTags('Files')
@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({ summary: 'Upload a file for messages' })
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No se recibió ningún archivo');
        }
        return this.filesService.uploadFile(file);
    }

    @Get(':filename')
    @ApiOperation({ summary: 'Get uploaded file' })
    async getFile(@Param('filename') filename: string, @Res() res: Response) {
        const filePath = this.filesService.getFilePath(filename);

        if (!existsSync(filePath)) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
        }

        return res.sendFile(filePath);
    }
}
