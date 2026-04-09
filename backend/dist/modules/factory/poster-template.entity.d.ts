export declare class PosterTemplate {
    id: number;
    name: string;
    category: string;
    scene: string;
    thumbnailUrl: string;
    templateUrl: string;
    config: {
        width: number;
        height: number;
        elements: any[];
    };
    isActive: boolean;
    createdAt: Date;
}
