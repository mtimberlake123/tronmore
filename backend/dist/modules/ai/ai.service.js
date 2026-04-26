"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = __importDefault(require("axios"));
const typeorm_2 = require("typeorm");
const system_setting_entity_1 = require("../admin/system-setting.entity");
let AiService = class AiService {
    constructor(settingRepository) {
        this.settingRepository = settingRepository;
    }
    async generate(prompt, maxTokens = 1000) {
        const config = await this.getRuntimeConfig();
        if (!config.appKey) {
            throw new Error('AI_API_KEY 未配置');
        }
        try {
            const response = await axios_1.default.post(`${config.baseURL}/chat/completions`, {
                model: config.model,
                messages: [{ role: 'user', content: prompt }],
                stream: true,
                temperature: config.temperature,
                max_tokens: maxTokens,
            }, {
                headers: {
                    Authorization: `Bearer ${config.appKey}`,
                    'Content-Type': 'application/json',
                },
                responseType: 'stream',
                timeout: 60000,
            });
            const text = await this.readStreamContent(response.data);
            if (!text.trim()) {
                throw new Error('AI 返回内容为空');
            }
            return text.trim();
        }
        catch (error) {
            console.error('AI服务调用失败:', error.response?.data || error.message);
            throw new Error(`AI服务异常: ${error.response?.data?.error?.message || error.message}`);
        }
    }
    async generateImage(prompt, size = '1x1', image) {
        const config = await this.getRuntimeConfig();
        if (!config.appKey) {
            throw new Error('AI_API_KEY 未配置');
        }
        try {
            const body = {
                model: config.imageModel,
                prompt,
                size,
            };
            if (image) {
                body.image = image;
            }
            const response = await axios_1.default.post(`${config.baseURL}/images/generations`, body, {
                headers: {
                    Authorization: `Bearer ${config.appKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 300000,
            });
            const item = response.data?.data?.[0] || response.data?.images?.[0] || response.data?.[0];
            const imageUrl = item?.url || item?.image_url;
            if (imageUrl)
                return imageUrl;
            const base64 = item?.b64_json || item?.base64 || item?.image_base64;
            if (base64)
                return `data:image/png;base64,${base64}`;
            throw new Error('图片生成接口未返回图片');
        }
        catch (error) {
            console.error('图片生成服务调用失败:', error.response?.data || error.message);
            throw new Error(`图片生成服务异常: ${error.response?.data?.error?.message || error.message}`);
        }
    }
    async *generateStream(prompt, maxTokens = 1000) {
        const config = await this.getRuntimeConfig();
        if (!config.appKey) {
            throw new Error('AI_API_KEY 未配置');
        }
        const response = await axios_1.default.post(`${config.baseURL}/chat/completions`, {
            model: config.model,
            messages: [{ role: 'user', content: prompt }],
            stream: true,
            temperature: config.temperature,
            max_tokens: maxTokens,
        }, {
            headers: {
                Authorization: `Bearer ${config.appKey}`,
                'Content-Type': 'application/json',
            },
            responseType: 'stream',
            timeout: 60000,
        });
        const decoder = new TextDecoder();
        let buffer = '';
        for await (const chunk of response.data) {
            buffer += decoder.decode(chunk, { stream: true });
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
    async getRuntimeConfig() {
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
    readStreamContent(stream) {
        return new Promise((resolve, reject) => {
            const decoder = new TextDecoder();
            let buffer = '';
            let result = '';
            stream.on('data', (chunk) => {
                buffer += decoder.decode(chunk, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    const content = this.parseStreamLine(line);
                    if (content === null)
                        continue;
                    result += content;
                }
            });
            stream.on('end', () => {
                if (buffer.trim()) {
                    const content = this.parseStreamLine(buffer);
                    if (content)
                        result += content;
                }
                resolve(result);
            });
            stream.on('error', reject);
        });
    }
    parseStreamLine(line) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: '))
            return null;
        const data = trimmed.slice(6);
        if (!data || data === '[DONE]')
            return null;
        try {
            const json = JSON.parse(data);
            return json.choices?.[0]?.delta?.content || json.choices?.[0]?.message?.content || '';
        }
        catch {
            return null;
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(system_setting_entity_1.SystemSetting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AiService);
//# sourceMappingURL=ai.service.js.map