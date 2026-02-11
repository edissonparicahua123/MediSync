import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../../audit/audit.service';
import { AUDIT_KEY } from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditInterceptor.name);

    constructor(
        private reflector: Reflector,
        private auditService: AuditService,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const auditMetadata = this.reflector.get<{ action: string; resource: string }>(
            AUDIT_KEY,
            context.getHandler(),
        );

        if (!auditMetadata) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest();
        const { user, ip, method, body, params, query } = request;
        const userAgent = request.get('user-agent') || '';

        return next.handle().pipe(
            tap(async (data) => {
                try {
                    if (!user || !user.id) {
                        return; // Cannot log without user
                    }

                    // Calculate details/changes
                    let resourceId = params.id || (data && data.id) || null;
                    let details = {
                        method,
                        query,
                        body: method !== 'GET' ? body : undefined, // Don't log body for GET usually
                        // We could potentially diff 'data' (response) with 'body' if we wanted strictly 'changes'
                        // For now, logging the payload as 'changes'
                    };

                    await this.auditService.createLog({
                        userId: user.id,
                        action: auditMetadata.action,
                        resource: auditMetadata.resource,
                        resourceId: resourceId,
                        changes: details,
                        ipAddress: ip,
                        userAgent: userAgent,
                    });

                } catch (error) {
                    this.logger.error(`Failed to create audit log: ${error.message}`);
                    // Don't throw error to not disrupt flow
                }
            }),
        );
    }
}
