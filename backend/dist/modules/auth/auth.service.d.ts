import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
export declare class AuthService {
    private tenantRepository;
    private jwtService;
    constructor(tenantRepository: Repository<Tenant>, jwtService: JwtService);
    loginByPassword(account: string, password: string): Promise<{
        token: string;
        company_id: string;
        company_name: string;
        balance: number;
    }>;
    loginBySms(phone: string, code: string, isNew?: boolean): Promise<{
        token: string;
        company_id: string;
        company_name: string;
        balance: number;
        is_new: boolean;
    }>;
    sendSms(phone: string, type: string): Promise<{
        message: string;
    }>;
    refresh(refreshToken: string): Promise<void>;
    logout(): Promise<{
        message: string;
    }>;
    validateToken(payload: any): Promise<{
        id: number;
        tenantId: string;
        name: string;
        role: string;
        isAdmin: boolean;
    }>;
}
