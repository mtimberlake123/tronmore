import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'merchant_id', unique: true })
  merchantId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column()
  category: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  logo: string;

  @Column('json', { nullable: true })
  products: string[];

  @Column('json', { nullable: true })
  features: string[];

  @Column({ name: 'ai_prompt_ext', nullable: true, type: 'text' })
  aiPromptExt: string;

  @Column({ name: 'note_prompt_ext', nullable: true, type: 'text' })
  notePromptExt: string;

  @Column({ name: 'note_topic', nullable: true, type: 'text' })
  noteTopic: string;

  @Column({ name: 'note_copy', nullable: true, type: 'text' })
  noteCopy: string;

  @Column({ name: 'review_image_count', default: 9 })
  reviewImageCount: number;

  @Column({ name: 'note_image_count', default: 9 })
  noteImageCount: number;

  @Column({ name: 'product_image_count', default: 9 })
  productImageCount: number;

  @Column({ name: 'jump_links', nullable: true, type: 'json' })
  jumpLinks: any;

  @Column({ nullable: true })
  incentive: string;

  @Column({ nullable: true, type: 'json' })
  location: any;

  @Column({ default: 0 })
  balance: number;

  @Column({ name: 'storage_used', default: 0 })
  storageUsed: number;

  @Column({ name: 'storage_limit', default: 200 })
  storageLimit: number;

  @Column({ name: 'sort_index', default: 0 })
  sortIndex: number;

  @Column({ name: 'expire_date', nullable: true })
  expireDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}