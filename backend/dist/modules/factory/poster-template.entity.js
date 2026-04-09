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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PosterTemplate = void 0;
const typeorm_1 = require("typeorm");
let PosterTemplate = class PosterTemplate {
};
exports.PosterTemplate = PosterTemplate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PosterTemplate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PosterTemplate.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PosterTemplate.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PosterTemplate.prototype, "scene", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'thumbnail_url' }),
    __metadata("design:type", String)
], PosterTemplate.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'template_url' }),
    __metadata("design:type", String)
], PosterTemplate.prototype, "templateUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Object)
], PosterTemplate.prototype, "config", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], PosterTemplate.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PosterTemplate.prototype, "createdAt", void 0);
exports.PosterTemplate = PosterTemplate = __decorate([
    (0, typeorm_1.Entity)('poster_templates')
], PosterTemplate);
//# sourceMappingURL=poster-template.entity.js.map