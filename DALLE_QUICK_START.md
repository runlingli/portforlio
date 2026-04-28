# DALL-E 集成 - 快速设置（3分钟）

## ⚠️ 第一步：处理泄露的 API Key（5分钟）

你在聊天中粘贴了 OpenAI key，现在已经暴露。**必须立即处理**：

### 删除旧 Key
1. 进入 https://platform.openai.com/api-keys
2. 找到 `sk-proj-MKVQFzETs4...` 这个 key
3. 点击删除按钮（垃圾桶图标）

### 创建新 Key
1. 点击 "Create new secret key"
2. 复制整个 key（包括 `sk-proj-` 前缀）
3. 粘贴到 `.env` 文件中

## 📋 第二步：更新环境变量

编辑 `.env` 文件：

```env
VITE_DEEPSEEK_API_KEY=sk-a2f76707bacc47e19979c83a7a06e413
VITE_OPENAI_API_KEY=sk-proj-你的新key在这里粘贴
```

**不要**：
- ❌ 提交到 git
- ❌ 在代码中硬编码
- ❌ 分享给他人

**要**：
- ✅ 保存在 `.env` 本地文件
- ✅ `.env` 已在 `.gitignore` 中

## 🎨 第三步：测试生成

```bash
npm run dev
```

然后：
1. 访问 `http://localhost:5173/linkedin-post`
2. 点击一个预设或手动填表
3. 点击 "Generate Fake Post"
4. 等待帖子生成 + 图片加载

### 你会看到什么

```
✅ 帖子内容显示
✅ 标题和提示卡片
✅ 图片卡片（下方）
   - 显示 "Generating AI artwork..."
   - 旋转加载动画
✅ 1-2 分钟后，图片出现
```

## 💰 成本预估

- **每张图片**: $0.08 USD (~¥0.57)
- **月度用量**: 取决于使用频率
- **例如**: 100 张图片 = 约 ¥57

### 如何省钱

1. **用户自选**: 只在用户想要时生成
2. **缓存**: 相同职位的帖子共用图片
3. **定时**: 限制每天最多生成 N 张
4. **监控**: 定期检查 OpenAI 账户

## 🚀 就这样！

现在你有了：

✅ 自动生成相关的 AI 图片  
✅ 无人脸设计（抽象 + 几何）  
✅ 后台异步生成（不卡顿）  
✅ 优雅降级（key 缺失自动禁用）  
✅ 成本可控  

## 🔍 验证工作正常

在浏览器控制台检查：

```javascript
// 应该看到
"Generating AI artwork..."  // 加载中

// 不应该看到错误
// 如果有错误，检查 .env 中的 key 是否正确
```

## 📞 如果出问题

### "Generating AI artwork..." 一直显示

- [ ] 检查 `.env` 中的 key 是否存在
- [ ] 检查 key 是否有效（OpenAI 控制面板验证）
- [ ] 检查是否有 API 额度（可能用完了）
- [ ] 查看浏览器控制台看详细错误

### 生成失败但有错误信息

在控制台会看到 `console.warn` 的信息：

```
Image generation error: Invalid API key
// → 检查 .env 中的 key

Image generation failed: 429
// → API 请求过多，稍等一下

Image generation error: network
// → 网络问题，检查连接
```

## 📊 监控和成本

### OpenAI 控制面板

访问 https://platform.openai.com/account/billing/overview

- 当前月度使用和成本
- 历史使用情况
- 设置使用上限（防止意外费用）

### 建议

1. 设置 Usage Limit = $10/month（保险起见）
2. 定期检查（每周）
3. 考虑成本 vs 用户价值

## ✨ 现在可以用了

图片生成完全集成，自动：
- 生成无人脸的抽象图片
- 与帖子内容相关
- 后台异步处理
- 显示在结果页面下方

尽情生成搞笑的 LinkedIn 帖子 + AI 艺术吧！🎨

---

**下一步?** 查看 [DALLE_INTEGRATION.md](./DALLE_INTEGRATION.md) 了解更多技术细节。
