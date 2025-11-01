# Yarn Lockfile 升级说明

## 问题描述

部署环境使用 Yarn 4.9.1，但项目的 `yarn.lock` 是 v1 格式，导致部署失败。

错误信息：`The lockfile would have been modified by this install, which is explicitly forbidden.`

## 解决方案

### 方案 1：在本地升级到 Yarn 4.x（推荐）

1. 启用 corepack（如果尚未启用）：
   ```bash
   corepack enable
   ```

2. 升级到 Yarn 4.9.1：
   ```bash
   corepack prepare yarn@4.9.1 --activate
   ```

3. 在项目根目录运行：
   ```bash
   yarn install
   ```

4. 这将自动更新 `yarn.lock` 到 Yarn 4.x 格式。

5. 提交更新的文件：
   ```bash
   git add yarn.lock package.json .gitignore
   git commit -m "Upgrade yarn.lock to Yarn 4.x format"
   git push
   ```

### 方案 2：使用 npm（如果部署环境支持）

如果部署环境可以配置使用 npm，可以删除 `yarn.lock` 并使用 `package-lock.json`。

## 注意事项

- `package.json` 已添加 `"packageManager": "yarn@4.9.1"` 字段
- `.gitignore` 已更新以支持 Yarn 4.x 的文件结构

