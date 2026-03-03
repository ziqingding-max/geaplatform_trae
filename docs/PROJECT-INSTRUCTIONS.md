# Recommended Project Instructions

> **Purpose**: Copy the content below into the Manus project's "Project Instructions" field. This ensures every new task automatically loads the knowledge base.

---

## Content to Copy

```
GEA EOR SaaS 系统的技术背景信息：
项目使用 Manus 的 web-db-user 脚手架创建，托管在 Manus 服务器上（AWS 新加坡节点）
代码仓库地址：https://github.com/ziqingding1122-max/geaplatform_trae.git
部署方式：使用 Manus 自带的发布功能进行部署，不需要额外的服务器配置
正式环境地址：admin.geahr.com（管理后台）/ app.geahr.com（客户门户）
所有生产环境变更必须遵循 hotfix-governance Skill 的规范

【AI Agent 必读规范】
1. 新任务开始时，必须先阅读项目根目录的 AGENTS.md，按照其中的阅读顺序了解系统架构、编码规范和业务规则
2. 如果已安装 gea-eor-knowledge Skill，按照 Skill 中的指引加载对应的参考文档
3. 所有代码变更必须包含 Vitest 测试，测试必须使用 TestCleanup 清理数据
4. 保存 checkpoint 前必须运行 post-test audit（见 docs/TESTING.md Section 10），确保数据库无测试数据残留
5. 所有用户界面文本必须添加中英文双语翻译（client/src/lib/i18n.ts）
6. 重大功能变更后，必须同步更新 AGENTS.md 和相关文档（见 docs/DOC-UPDATE-GUIDE.md）
```

---

## How to Set

1. Open the Manus project "Best GEA 系统"
2. Go to project Settings
3. Replace the current "Project Instructions" with the content above
4. Save
