import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('merchant_images')
export class MerchantImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'merchant_id' })
  merchantId: string;

  @Column()
  url: string;

  @Column()
  tab: string; // product, environment, other, used

  @Column({ name: 'product_tag', nullable: true })
  productTag: string;

  @Column({ name: 'is_used', default: 0 })
  isUsed: number;

  @Column({ name: 'used_at', nullable: true })
  usedAt: Date;

  @Column({ name: 'is_deleted', default: 0 })
  isDeleted: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}