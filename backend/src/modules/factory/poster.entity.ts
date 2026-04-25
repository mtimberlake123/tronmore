import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('posters')
export class Poster {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'poster_id', unique: true })
  posterId: string;

  @Column({ name: 'template_id', nullable: true })
  templateId: number;

  @Column({ name: 'merchant_id' })
  merchantId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'image_url', nullable: true, type: 'text' })
  imageUrl: string;

  @Column({ type: 'json' })
  customizations: {
    text?: string;
    image?: string;
    background?: string;
    [key: string]: any;
  };

  @Column({ default: 'pending' })
  status: string; // pending, generating, completed, failed

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
