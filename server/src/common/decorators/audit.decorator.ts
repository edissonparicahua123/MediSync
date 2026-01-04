import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';
export const Audit = (action: string, resource: string) => SetMetadata(AUDIT_KEY, { action, resource });
