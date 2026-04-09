import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    loginByPassword(body: {
        account: string;
        password: string;
        agree_terms: boolean;
    }): Promise<{
        code: number;
        data: {
            token: string;
            company_id: string;
            company_name: string;
            balance: number;
        };
    }>;
    loginBySms(body: {
        phone: string;
        code: string;
        agree_terms: boolean;
    }): Promise<{
        code: number;
        data: {
            token: string;
            company_id: string;
            company_name: string;
            balance: number;
            is_new: boolean;
        };
    }>;
    sendSms(body: {
        phone: string;
        type: string;
    }): Promise<{
        code: number;
        message: string;
    }>;
    refresh(body: {
        refresh_token: string;
    }): Promise<void>;
    logout(): Promise<{
        code: number;
        message: string;
    }>;
}
