"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let AiService = class AiService {
    constructor() {
        this.baseURL = 'http://120.24.86.32:3000/anthropic';
        this.model = 'MiniMax2.7';
        this.appKey = 'sk-cp-38a5df3580732874b6f5795b130084d48e44c074528da7caab1cd3c862032ec6';
    }
    async generate(prompt, maxTokens = 1024) {
        try {
            const response = await axios_1.default.post(`${this.baseURL}/v1/messages`, {
                model: this.model,
                max_tokens: maxTokens,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.appKey,
                    'anthropic-version': '2023-06-01',
                },
                timeout: 30000,
            });
            return response.data.content[0].text;
        }
        catch (error) {
            console.error('AI服务调用失败:', error.response?.data || error.message);
            throw new Error(`AI服务异常: ${error.response?.data?.error?.message || error.message}`);
        }
    }
    async *generateStream(prompt, maxTokens = 1024) {
        const text = await this.generate(prompt, maxTokens);
        yield text;
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map