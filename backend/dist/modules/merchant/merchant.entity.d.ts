export declare class Merchant {
    id: number;
    merchantId: string;
    tenantId: string;
    category: string;
    name: string;
    logo: string;
    products: string[];
    features: string[];
    aiPromptExt: string;
    notePromptExt: string;
    noteTopic: string;
    noteCopy: string;
    reviewImageCount: number;
    noteImageCount: number;
    productImageCount: number;
    jumpLinks: any;
    incentive: string;
    location: any;
    balance: number;
    storageUsed: number;
    storageLimit: number;
    sortIndex: number;
    expireDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
