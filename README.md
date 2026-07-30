# 个人作品网站

这是个人作品网站的源码与版本备份。

网站通过 GitHub Pages 自动部署。每次向 `main` 分支推送较大改动后，GitHub Actions 会自动更新线上网站。

## 版本备份

完成一次较大改动后，提交并推送：

```bash
git add -A
git commit -m "说明本次改动"
git push
```

如需回档，先通过 `git log --oneline` 找到目标版本，再从该版本恢复。
