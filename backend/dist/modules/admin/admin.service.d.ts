import { Repository } from 'typeorm';
import { Tenant } from '../auth/tenant.entity';
import { PromptTemplate } from './prompt-template.entity';
import { SensitiveWord } from './sensitive-word.entity';
export declare class AdminService {
    private tenantRepository;
    private promptRepository;
    private sensitiveRepository;
    constructor(tenantRepository: Repository<Tenant>, promptRepository: Repository<PromptTemplate>, sensitiveRepository: Repository<SensitiveWord>);
    getCompanies(params: {
        page?: number;
        page_size?: number;
        keyword?: string;
    }): Promise<{
        list: {
            company_id: string;
            name: string;
            phone: string;
            balance: number;
            total_quota: number;
            used_quota: number;
            status: number;
            created_at: Date;
        }[];
        total: number;
    }>;
    createCompany(data: {
        name: string;
        phone: string;
        password?: string;
    }): Promise<{
        company_id: string;
        name: string;
    }>;
    recharge(companyId: string, data: {
        amount: number;
        package?: string;
        package_name?: string;
    }): Promise<{
        company_id: string;
        before: number;
        after: number;
        amount: number;
        package: string;
    }>;
    getPromptTemplates(params: {
        industry?: string;
        style?: string;
        page?: number;
        page_size?: number;
    }): Promise<{
        list: {
            id: string;
            industry: string;
            style: string;
            content: string;
            version: number;
            is_active: boolean;
        }[];
        total: number;
    }>;
    createPromptTemplate(data: {
        industry: string;
        style: string;
        content: string;
    }): Promise<{
        id: string;
        industry: string;
        style: string;
        content: string;
        version: number;
    }>;
    updatePromptTemplate(templateId: string, data: {
        content?: string;
        is_active?: boolean;
    }): Promise<{
        id: string;
        content: string;
        version: number;
        is_active: boolean;
    }>;
    getSensitiveWords(params: {
        category?: string;
        level?: number;
        page?: number;
        page_size?: number;
    }): Promise<{
        list: {
            id: number;
            word: string;
            category: string;
            level: number;
            created_at: Date;
        }[];
        total: number;
    }>;
    createSensitiveWord(data: {
        word: string;
        category: string;
        level?: number;
    }): Promise<{
        id: number;
        word: string;
        category: string;
        level: number;
    }>;
    deleteSensitiveWord(id: number): Promise<{
        message: string;
    }>;
    createSubAccount(companyId: string, data: {
        username: string;
        role: string;
        password?: string;
    }): Promise<{
        message: string;
        company_id: string;
        username: string;
        role: string;
    }>;
}
