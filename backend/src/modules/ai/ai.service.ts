import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly baseURL = 'http://120.24.86.32:3000/anthropic';
  private readonly model = 'MiniMax2.7';
  private readonly appKey = 'sk-cp-38a5df3580732874b6f5795b130084d48e44c074528da7caab1cd3c862032ec6';

  /**
   * 调用AI生成内容
   */
  async generate(prompt: string, maxTokens: number = 1024): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseURL}/v1/messages`,
        {
          model: this.model,
          max_tokens: maxTokens,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.appKey,
            'anthropic-version': '2023-06-01',
          },
          timeout: 30000,
        },
      );

      return response.data.content[0].text;
    } catch (error) {
      console.error('AI服务调用失败:', error.response?.data || error.message);
      throw new Error(`AI服务异常: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 流式调用AI（如果API支持）
   */
  async *generateStream(prompt: string, maxTokens: number = 1024): AsyncGenerator<string> {
    // 注意：MiniMax API可能不支持流式输出，此处为占位实现
    const text = await this.generate(prompt, maxTokens);
    yield text;
  }
}
