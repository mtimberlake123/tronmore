export declare class Tenant {
    id: number;
    tenantId: string;
    name: string;
    phone: string;
    password: string;
    totalQuota: number;
    usedQuota: number;
    balance: number;
    status: number;
    isAdmin: boolean;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}
