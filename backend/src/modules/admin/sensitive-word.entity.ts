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

  @Column({ type: 'text', nullable: true })
  rule: string; // 规则内容，用于注入Prompt

  @Column({ default: true })
  active: boolean; // 是否启用

  @Column({ nullable: true })
  paramName: string; // 入参名称，如 prohibited_content, style_constraints

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
