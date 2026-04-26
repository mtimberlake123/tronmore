"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingVideoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const marketing_video_controller_1 = require("./marketing-video.controller");
const marketing_video_service_1 = require("./marketing-video.service");
const marketing_video_project_entity_1 = require("./marketing-video-project.entity");
const marketing_video_step_entity_1 = require("./marketing-video-step.entity");
let MarketingVideoModule = class MarketingVideoModule {
};
exports.MarketingVideoModule = MarketingVideoModule;
exports.MarketingVideoModule = MarketingVideoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([marketing_video_project_entity_1.MarketingVideoProject, marketing_video_step_entity_1.MarketingVideoStep])],
        controllers: [marketing_video_controller_1.MarketingVideoController],
        providers: [marketing_video_service_1.MarketingVideoService],
        exports: [marketing_video_service_1.MarketingVideoService],
    })
], MarketingVideoModule);
//# sourceMappingURL=marketing-video.module.js.map