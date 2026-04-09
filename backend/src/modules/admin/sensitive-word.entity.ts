import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('sensitive_words')
export class SensitiveWord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  word: string;

  @Column()
  category: string; // politics, pornography, ads, custom

  @Column({ default: 1 })
  level: number; // 1: low, 2: medium, 3: high

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
