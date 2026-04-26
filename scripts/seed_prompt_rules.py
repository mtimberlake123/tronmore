# -*- coding: utf-8 -*-
"""Seed default prompt rules for local development.

The script is idempotent: it updates the first matching rule for each
industry/style pair and disables duplicate rules with the same pair.
"""

from __future__ import annotations

import sqlite3
import uuid
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "tronmore.db"


RULES = {
    ("general", "common"): """你是本地生活内容助手，目标是帮真实消费者写出自然、短、可信的中文内容。
写作原则：
- 只基于商家名、特色宣传点、商家个性化要求和用户当前任务写作，不虚构价格、地址、营业时间、获奖信息、销量、排名、明星同款等未提供事实。
- 语气像普通用户真实分享，不要像官方广告、招商文案、新闻稿、客服回复或AI作文。
- 避免绝对化表达，例如“第一”“最好”“必吃榜第一”“全网最火”“百分百”“闭眼冲”。
- 可以有轻微真实感表达，例如“个人觉得”“还挺”“这点加分”“会更适合...”，但不要恶意差评。
- 内容要有一个具体感受就够了，不要面面俱到，不要堆形容词。
- 短句优先，少用排比句和“首先/其次/最后”。
- 如果是笔记生成，必须带一句温和的小保留或轻微负面评价，让内容更像真实体验。
- 笔记里尽量少用第一人称“我”，可以换成“这家”“整体”“个人感觉”“朋友会喜欢这种”。""",
    ("general", "review"): """点评生成规则：
- 写成大众点评/美团平台里的真实顾客评价，不要写成商家自夸。
- 结构建议：到店/使用场景 + 1-2个具体亮点 + 一点真实感受 + 适合人群或复购意愿。
- 口吻自然克制，可以稍微口语化，但不要过度网红腔。
- 不要出现“小红书”“种草”“姐妹们”“冲冲冲”等明显笔记平台表达。
- 不要编造消费金额、排队情况、服务人员名字、停车信息、包间信息，除非商家信息明确提供。
- 如果信息较少，就围绕已给的特色宣传点写，不要硬编细节。""",
    ("general", "note"): """小红书笔记生成规则：
- 写成像真人刚发的小红书短笔记，不要像完整作文、营销稿或AI总结。
- 允许有一点“不完美”的口语感，例如“还挺”“我会更喜欢”“个人觉得”，不要每句话都很精致。
- 只抓一个核心点写：环境、口味、产品、服务、拍照或适合人群里选1-2个，不要全都写。
- 开头要轻，不要喊口号。可以像“今天顺路试了下...”“这家我还挺有好感的...”“附近想找个简单吃的可以看看...”。
- 不要生成虚假的具体价格、地址、营业时间、排名、折扣力度、排队时长。
- 标签0-3个即可，能不加就不加；不要为了像小红书而硬堆标签。
- 每条笔记都要有一句轻微负面或保留意见，例如“就是...稍微...”“如果...会更好”“不是特别...但...”，不能全篇只夸。
- 可以自然带1个网络热门词或轻梗，例如“松弛感”“有点东西”“稳稳的”“拿捏”“适合懒人”，但不要堆梗。
- 少用“宝子”“家人们”“绝绝子”“YYDS”“闭眼冲”“狠狠爱住”“氛围感拉满”等廉价网感词，除非特别适合语境。""",
    ("catering", "review"): """餐饮点评行业规则：
- 优先围绕口味、分量、食材新鲜度、出餐速度、环境、服务、适合聚餐、工作餐、家庭用餐等维度写。
- 可以写真实的小缺点或中性细节，例如“口味会更适合喜欢清淡/重口的人”“饭点可能会比较热闹”，但不要恶意攻击。
- 不要虚构菜价、套餐内容、招牌菜名称；如果商家产品信息为空，就用“菜品”“小吃”“套餐”等泛称。
- 评价要像吃过之后的感受，不要写成菜单介绍。""",
    ("catering", "note"): """餐饮小红书笔记行业规则：
- 像吃完后随手发的短分享，重点写一个口味记忆点或用餐场景，不要写成长篇探店攻略。
- 如果商家没有提供菜名，不要编造具体菜品；可以写“主打产品”“店里的几款产品”。
- 少写“值得收藏”“一定要来”，多写“适合附近顺路试试”“想吃这口的时候会想到”。
- 轻微负面可以写口味偏甜/偏淡、饭点可能热闹、选择不算多、包装/环境不是特别惊艳等，但不要恶意差评。
- 避免“全城必打卡”“爆款出圈”“销量第一”等夸张表达。""",
    ("beauty", "note"): """美业小红书笔记行业规则：
- 围绕服务体验、环境氛围、沟通感、效果预期、适合人群来写，不夸大功效。
- 不要承诺医疗、美白、祛斑、瘦身等确定效果，不写“永久”“立刻见效”“无风险”。
- 语气真实克制，像个人体验分享。""",
    ("retail", "note"): """零售小红书笔记行业规则：
- 围绕产品质感、使用场景、陈列体验、适合送礼、自用、日常补货等角度写。
- 不虚构品牌授权、价格优势、销量排名和限时活动。
- 重点突出可感知的特点，不要堆砌空泛形容词。""",
}


def seed() -> None:
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    for (industry, style), content in RULES.items():
        cur.execute(
            """
            select id from prompt_templates
            where industry = ? and style = ?
            order by id
            limit 1
            """,
            (industry, style),
        )
        row = cur.fetchone()

        if row:
            cur.execute(
                """
                update prompt_templates
                set content = ?, is_active = 1, version = version + 1, updated_at = ?
                where id = ?
                """,
                (content, now, row[0]),
            )
            cur.execute(
                """
                update prompt_templates
                set is_active = 0, updated_at = ?
                where industry = ? and style = ? and id <> ?
                """,
                (now, industry, style, row[0]),
            )
        else:
            cur.execute(
                """
                insert into prompt_templates
                    (template_id, industry, style, content, version, is_active, created_at, updated_at)
                values (?, ?, ?, ?, 1, 1, ?, ?)
                """,
                (str(uuid.uuid4()), industry, style, content, now, now),
            )

    conn.commit()
    for row in cur.execute(
        """
        select id, industry, style, is_active, version, substr(content, 1, 40)
        from prompt_templates
        order by id
        """
    ):
        print(row)
    conn.close()


if __name__ == "__main__":
    seed()
