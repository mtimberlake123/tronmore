import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getCompanies(query: {
        page?: number;
        page_size?: number;
        keyword?: string;
    }): Promise<{
        code: number;
        data: {
            list: {
                company_id: string;
                name: string;
                phone: string;
                balance: number;
                total_quota: number;
                used_quota: number;
                status: number;
                created_at: Date;
                merchants: number;
            }[];
            total: number;
        };
    }>;
    createCompany(body: {
        name: string;
        phone: string;
        password?: string;
    }): Promise<{
        code: number;
        data: {
            company_id: string;
            name: string;
        };
    }>;
    recharge(id: string, body: {
        amount: number;
        package?: string;
        package_name?: string;
    }): Promise<{
        code: number;
        data: {
            company_id: string;
            before: number;
            after: number;
            amount: number;
            package: string;
        };
    }>;
    getPromptTemplates(query: {
        industry?: string;
        style?: string;
        page?: number;
        page_size?: number;
    }): Promise<{
        code: number;
        data: {
            list: {
                id: string;
                industry: string;
                style: string;
                content: string;
                version: number;
                is_active: boolean;
            }[];
            total: number;
        };
    }>;
    createPromptTemplate(body: {
        industry: string;
        style: string;
        content: string;
    }): Promise<{
        code: number;
        data: {
            id: string;
            industry: string;
            style: string;
            content: string;
            version: number;
        };
    }>;
    updatePromptTemplate(id: string, body: {
        content?: string;
        is_active?: boolean;
    }): Promise<{
        code: number;
        data: {
            id: string;
            content: string;
            version: number;
            is_active: boolean;
        };
    }>;
    getSensitiveWords(query: {
        category?: string;
        level?: number;
        page?: number;
        page_size?: number;
    }): Promise<{
        code: number;
        data: {
            list: {
                id: number;
                word: string;
                category: string;
                level: number;
                rule: string;
                active: boolean;
                paramName: string;
                created_at: Date;
            }[];
            total: number;
        };
    }>;
    createSensitiveWord(body: {
        word: string;
        category: string;
        level?: number;
        rule?: string;
        active?: boolean;
        paramName?: string;
    }): Promise<{
        code: number;
        data: {
            id: number;
            word: string;
            category: string;
            level: number;
            rule: string;
            active: boolean;
            paramName: string;
        };
    }>;
    deleteSensitiveWord(id: string): Promise<{
        message: string;
        code: number;
    }>;
    updateSensitiveWord(id: string, body: {
        word?: string;
        category?: string;
        level?: number;
        rule?: string;
        active?: boolean;
        paramName?: string;
    }): Promise<{
        code: number;
        data: {
            id: number;
            word: string;
            category: string;
            level: number;
            rule: string;
            active: boolean;
            paramName: string;
        };
    }>;
    getActiveRules(): Promise<{
        code: number;
        data: import("./sensitive-word.entity").SensitiveWord[];
    }>;
    createSubAccount(id: string, body: {
        username: string;
        role: string;
        password?: string;
    }): Promise<{
        code: number;
        data: {
            message: string;
            company_id: string;
            username: string;
            role: string;
        };
    }>;
    getMerchants(query: {
        tenantId?: string;
        page?: number;
        page_size?: number;
    }): Promise<{
        code: number;
        data: {
            list: {
                id: string;
                name: string;
                tenantId: string;
                companyName: string;
                balance: number;
                created_at: Date;
            }[];
            total: number;
        };
    }>;
    deleteMerchant(id: string): Promise<{
        message: string;
        code: number;
    }>;
    transferMerchant(id: string, body: {
        targetTenantId: string;
    }): Promise<{
        message: string;
        merchant_id: string;
        from_tenant: string;
        to_tenant: string;
        code: number;
    }>;
}
