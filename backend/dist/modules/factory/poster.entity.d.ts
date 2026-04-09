export declare class Poster {
    id: number;
    posterId: string;
    templateId: number;
    merchantId: string;
    tenantId: string;
    imageUrl: string;
    customizations: {
        text?: string;
        image?: string;
        background?: string;
        [key: string]: any;
    };
    status: string;
    createdAt: Date;
}
