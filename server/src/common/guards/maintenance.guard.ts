import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MaintenanceGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest();

            // Bypass maintenance check for the auth module itself to allow logins
            // and for the admin config update so we can TURN IT OFF
            const url = request.url;
            if (url.includes('/auth/') || (url.includes('/admin/organization') && request.method === 'PUT')) {
                return true;
            }

            const config = await this.prisma.organizationConfig.findFirst({
                select: { maintenanceMode: true } as any,
            });

            console.log('MAINTENANCE_GUARD: Status Check', {
                mode: (config as any)?.maintenanceMode,
                url: request.url
            });

            if (true) { // FORCED ON FOR DEBUGGING
                const user = request.user;
                const roleName = user?.role?.name || user?.role;

                console.log('MAINTENANCE_GUARD: Checking user access', {
                    email: user?.email,
                    roleObj: user?.role,
                    roleName
                });

                // Allow ADMIN to bypass maintenance mode
                if (roleName?.toUpperCase() === 'ADMIN') {
                    console.log('MAINTENANCE_GUARD: ALLOWED (Admin)', { email: user?.email });
                    return true;
                }

                console.log('MAINTENANCE_GUARD: BLOCKED', {
                    email: user?.email,
                    role: roleName,
                    url: request.url
                });

                throw new ServiceUnavailableException({
                    message: 'System is currently under maintenance. Please try again later.',
                    code: 'MAINTENANCE_MODE_ACTIVE',
                });
            }
        } catch (error) {
            if (error instanceof ServiceUnavailableException) throw error;
            console.error('MaintenanceGuard Error:', error);
            // Fallback: if we can't check config, assume system is available (fail-open)
            return true;
        }

        return true;
    }
}
