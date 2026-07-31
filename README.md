## Last.fm 跨语言维基跳转助手 Last.fm Cross-Language Wiki Redirect Helper

*使用前请知悉，这是一个由 Ai 完成的脚本，介意勿用。
*Please be aware before use that this is a script completed by AI; do not use if you mind.

希望大家都能跨越语言的樊篱，自由地汲取知识。
I hope everyone can cross the barriers of language and freely absorb knowledge.

---

### 它的功能 What it does

当你在 Last.fm 上访问专辑或音乐人页面且当前语言无维基时，此脚本会自动识别页面文本，并检测其余 11 种语言中是否存在相应的维基页面。若检测到存在，页面右下角将出现结果提示，并提供可跳转的链接。
This script automatically detects when you visit an album or artist page on Last.fm that has no wiki in the current language. It then checks whether any of the other 11 supported languages have a wiki for the same page. If found, a result notification appears in the bottom-right corner with clickable links to those wikis.

---

### 它解决的问题 The problem it solves

Last.fm 只会在当前界面语言下显示维基内容。如果该语言没有维基，想快速查看其他语言社区是否已编写维基就很不方便——你需要手动切换站点语言并重新访问页面。官方也似乎没有要解决此问题的意思，而此脚本可一次性自动检测多种语言。
Last.fm only shows wiki content in the interface language you're using. If the wiki is missing in that language, there's no easy way to quickly check whether other language communities have written a wiki — you'd have to manually switch the site language and re-visit the page each time. This script automates that process across many languages at once.

---

### 使用方法 How to use:

* 安装脚本
Install the script

* 访问 Last.fm 上的任意专辑或音乐人页面，例如 https://www.last.fm/music/Some+Artist 或 https://www.last.fm/music/Some+Artist/Some+Album
Visit any album or artist page on Last.fm, e.g. https://www.last.fm/music/Some+Artist or https://www.last.fm/music/Some+Artist/Some+Album

* 如果当前页面语言没有维基，脚本会在后台静默运行
If the current page language has no wiki, the script runs silently in the background

* 几秒钟后，右下角会弹出提示，显示找到的维基链接，或“未找到其他语言维基”的消息
After a few seconds, a notification appears in the bottom-right corner showing any found wiki links, or a message that no other-language wikis were found

* 点击任意链接即可直接跳转到对应语言的维基页面
Click any link to jump directly to that language’s wiki page

* 通知在 10 秒后自动消失
The notification disappears automatically after 10 seconds

---

### 重要提示 Important notes:  

* 脚本会检测 11 种语言：英语、德语、西班牙语、法语、意大利语、日语、波兰语、葡萄牙语、俄语、瑞典语、土耳其语和简体中文（加上当前页面语言共 12 种）
The script checks 11 languages: English, German, Spanish, French, Italian, Japanese, Polish, Portuguese, Russian, Swedish, Turkish, and Simplified Chinese (12 including the current page language)

* 检测过程完全静默——不会显示“正在检测”的弹窗，只显示最终结果
The checking is completely silent — no "checking" popup is shown, only the final result appears

* 它适用于音乐人页面和专辑页面，也适用于它们的 /+wiki 子页面
It works on both artist pages and album pages, and also on their /+wiki subpages

* 此脚本完全由 AI 编写，因此可能存在 bug，作者可能无法提供修复
This script was written entirely by AI, so bugs may exist and the author may not be able to provide fixes

---

### 故障排除 Troubleshooting:  

* 如果脚本未触发，请确保你的 Last.fm 界面语言是受支持的语言之一，并尝试刷新页面
If the script doesn't trigger, make sure your Last.fm interface language is one of the supported languages, and try refreshing the page

* 由于这是 AI 生成的代码，可能无法进行深入调试——欢迎反馈问题，但支持有限
Since this is AI-generated code, advanced debugging may not be possible — please report issues but expect limited support


---

### 隐私 Privacy:

此脚本仅在 Last.fm 上运行，仅读取页面内容并向 Last.fm 自身的维基 URL 发送请求。它不会收集、存储或向任何其他地方传输个人数据。
This script only runs on Last.fm and only reads page content plus sends requests to Last.fm's own wiki URLs. It does not collect, store, or transmit any personal data anywhere else.
