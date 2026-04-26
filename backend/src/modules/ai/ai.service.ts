import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Readable } from 'stream';
import { Repository } from 'typeorm';
import { SystemSetting } from '../admin/system-setting.entity';

type AiRuntimeConfig = {
  baseURL: string;
  model: string;
  imageModel: string;
  appKey: string;
  temperature: number;
};

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(SystemSetting)
    private settingRepository: Repository<SystemSetting>,
  ) {}

  async generate(prompt: string, maxTokens: number = 1000): Promise<string> {
    const config = await this.getRuntimeConfig();
    if (!config.appKey) {
      throw new Error('AI_API_KEY 未配置');
    }

    try {
      const response = await axios.post(
        `${config.baseURL}/chat/completions`,
        {
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          stream: true,
          temperature: config.temperature,
          max_tokens: maxTokens,
        },
        {
          headers: {
            Authorization: `Bearer ${config.appKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
          timeout: 60000,
        },
      );

      const text = await this.readStreamContent(response.data);
      if (!text.trim()) {
        throw new Error('AI 返回内容为空');
      }

      return text.trim();
    } catch (error) {
      console.error('AI服务调用失败:', error.response?.data || error.message);
      throw new Error(`AI服务异常: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async generateImage(prompt: string, size: string = '1x1', image?: string): Promise<string> {
    const config = await this.getRuntimeConfig();
    if (!config.appKey) {
      throw new Error('AI_API_KEY 未配置');
    }

    try {
      const body: any = {
        model: config.imageModel,
        prompt,
        size,
      };
      if (image) {
        body.image = image;
      }

      const response = await axios.post(
        `${config.baseURL}/images/generations`,
        body,
        {
          headers: {
            Authorization: `Bearer ${config.appKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 300000,
        },
      );

      const item = response.data?.data?.[0] || response.data?.images?.[0] || response.data?.[0];
      const imageUrl = item?.url || item?.image_url;
      if (imageUrl) return imageUrl;

      const base64 = item?.b64_json || item?.base64 || item?.image_base64;
      if (base64) return `data:image/png;base64,${base64}`;

      throw new Error('图片生成接口未返回图片');
    } catch (error) {
      console.error('图片生成服务调用失败:', error.response?.data || error.message);
      throw new Error(`图片生成服务异常: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async *generateStream(prompt: string, maxTokens: number = 1000): AsyncGenerator<string> {
    const config = await this.getRuntimeConfig();
    if (!config.appKey) {
      throw new Error('AI_API_KEY 未配置');
    }

    const response = await axios.post(
      `${config.baseURL}/chat/completions`,
      {
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        temperature: config.temperature,
        max_tokens: maxTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${config.appKey}`,
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
        timeout: 60000,
      },
    );

    const decoder = new TextDecoder();
    let buffer = '';

    for await (const chunk of response.data as Readable) {
      buffer += decoder.decode(chunk as Buffer, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const content = this.parseStreamLine(line);
        if (content) {
          yield content;
        }
      }
    }

    if (buffer.trim()) {
      const content = this.parseStreamLine(buffer);
      if (content) {
        yield content;
      }
    }
  }

  private async getRuntimeConfig(): Promise<AiRuntimeConfig> {
    const rows = await this.settingRepository.find({
      where: [
        { key: 'ai.base_url' },
        { key: 'ai.model' },
        { key: 'ai.image_model' },
        { key: 'ai.api_key' },
        { key: 'ai.temperature' },
      ],
    });
    const map = new Map(rows.map(item => [item.key, item.value]));

    return {
      baseURL: map.get('ai.base_url') || process.env.AI_BASE_URL || 'https://api.chatfire.site/v1',
      model: map.get('ai.model') || process.env.AI_MODEL || 'gpt-5.4',
      imageModel: map.get('ai.image_model') || process.env.AI_IMAGE_MODEL || 'gpt-image-2',
      appKey: map.get('ai.api_key') || process.env.AI_API_KEY || '',
      temperature: Number(map.get('ai.temperature') || process.env.AI_TEMPERATURE || 0.7),
    };
  }

  private readStreamContent(stream: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
      const decoder = new TextDecoder();
      let buffer = '';
      let result = '';

      stream.on('data', (chunk: Buffer) => {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const content = this.parseStreamLine(line);
          if (content === null) continue;
          result += content;
        }
      });

      stream.on('end', () => {
        if (buffer.trim()) {
          const content = this.parseStreamLine(buffer);
          if (content) result += content;
        }
        resolve(result);
      });

      stream.on('error', reject);
    });
  }

  private parseStreamLine(line: string): string | null {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data: ')) return null;

    const data = trimmed.slice(6);
    if (!data || data === '[DONE]') return null;

    try {
      const json = JSON.parse(data);
      return json.choices?.[0]?.delta?.content || json.choices?.[0]?.message?.content || '';
    } catch {
      return null;
    }
  }
}
