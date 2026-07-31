// ==UserScript==
// @name         Last.fm 跨语言维基跳转助手 (V17.1 - 增强维基触发)
// @namespace    http://tampermonkey.net/
// @version      17.1
// @description  此脚本可自动检测 Last.fm 上缺失维基的专辑或音乐人页，并查找其他语言可用的维基链接。This script automatically detects album or artist pages with no wiki on Last.fm and finds wiki links in other languages.
// @author       Your Name
// @match        https://www.last.fm/music/*
// @match        https://www.last.fm/*/music/*
// @grant        GM_xmlhttpRequest
// @connect      www.last.fm
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const REQUEST_TIMEOUT_MS = 3000;

    // ========== 专辑维基触发文本 ==========
    const WIKI_NO_WIKI_MESSAGES_ALBUM = {
        'zh': "我们没有这张专辑的维基。您了解这张专辑的背景信息吗？",
        'en': "We don't have a wiki for this album. Do you know any background info about this album?",
        'de': "Wir haben noch kein Wiki zu diesem Album. Hast du Hintergrundinfos zu diesem Album?",
        'es': "No tenemos un wiki para este álbum. ¿Sabes algo de los antecedentes de este álbum?",
        'fr': "Nous n'avons pas de wiki pour cet album. Avez-vous des informations générales à son sujet ?",
        'it': "Non è ancora disponibile una wiki per questo album. Hai informazioni al riguardo?",
        'ja': "このアルバムに関する wiki はまだありません。このアルバムの基本情報を記入していただけませんか？",
        'pl': "Nie mamy jeszcze wiki dla tego albumu. Czy znasz jakieś podstawowe informacje na temat tego albumu?",
        'pt': "Não temos nenhuma wiki para este álbum. Você tem alguma informação sobre a trajetória dele?",
        'ru': "У нас пока нет вики-статьи об этом альбоме. Ты что-нибудь знаешь о нем?",
        'sv': "Vi har ingen wiki för detta album. Känner du till någon bakgrundsinformation för detta album?",
        'tr': "Bu albüm için henüz elimizde bir viki yok. Bu albüm hakkında arka plan bilgisine sahip misin?",
    };

    const MAIN_PAGE_NO_WIKI_MESSAGES_ALBUM = {
        'zh': "您知道有关此专辑的背景信息吗",
        'en': "Do you know any background info about this album?",
        'de': "Hast du Hintergrundinfos zu diesem Album?",
        'es': "¿Sabes algo de los antecedentes de este álbum?",
        'fr': "Avez-vous quelques informations à nous donner sur cet album ?",
        'it': "Hai informazioni sul background di questo album?",
        'ja': "このアルバムのバックグラウンド情報をご存知ですか?",
        'pl': "Czy znasz jakieś podstawowe informacje o tym albumie?",
        'pt': "Você tem informações sobre a gravação desse álbum?",
        'ru': "Ты что-нибудь знаешь про этот альбом?",
        'sv': "Känner du till någon bakgrundsinformation om detta album?",
        'tr': "Bu albüm hakkında herhangi bir arka plan bilgin var mı?",
    };

    // ========== 艺术家维基触发文本 ==========
    const WIKI_NO_WIKI_MESSAGES_ARTIST = {
        'zh': "我们没有此艺术家的维基。您了解这位艺术家的背景信息吗？",
        'en': "We don't have a wiki for this artist. Do you know any background info about this artist?",
        'de': "Wir haben noch kein Wiki zu diesem Künstler. Hast du Hintergrundinfos zu diesem Künstler?",
        'es': "No tenemos un wiki para este artista. ¿Sabes algo de los antecedentes de este artista?",
        'fr': "Nous n'avons pas de wiki pour cet artiste. Avez-vous des informations générales à son sujet ?",
        'it': "Non è disponibile una wiki per questo artista. Hai informazioni al riguardo?",
        'ja': "このアーティストに関する wiki はまだありません。このアーティストの基本情報を記入していただけませんか？",
        'pl': "Nie mamy jeszcze wiki dla tego wykonawcy. Czy znasz jakieś podstawowe informacje na temat tego wykonawcy?",
        'pt': "Não temos nenhuma wiki para este artista. Você tem alguma informação sobre a trajetória dele?",
        'ru': "У нас пока нет вики-статьи об этом исполнителе. Ты что-нибудь знаешь о нем?",
        'sv': "Vi har ingen wiki för denna artist. Känner du till någon bakgrundsinformation om denna artist?",
        'tr': "Bu sanatçı için henüz elimizde bir viki yok. Bu sanatçı hakkında arka plan bilgisine sahip misin?",
    };

    const MAIN_PAGE_NO_WIKI_MESSAGES_ARTIST = {
        'zh': "您知道有关此艺术家的背景信息吗？",
        'en': "Do you know any background info about this artist?",
        'de': "Hast du Hintergrundinfos zu diesem Künstler?",
        'es': "¿Sabes algo de los antecedentes de este artista?",
        'fr': "Avez-vous quelques informations à nous donner sur cet artiste ?",
        'it': "Hai informazioni sul background di questo artista?",
        'ja': "このアーティストのバックグラウンド情報をご存知ですか?",
        'pl': "Czy znasz jakieś podstawowe informacje o tym wykonawcy?",
        'pt': "Você tem informações sobre a carreira desse artista?",
        'ru': "Ты что-нибудь знаешь про этого исполнителя?",
        'sv': "Känner du till någon bakgrundsinformation om denna artist?",
        'tr': "Bu sanatçı hakkında herhangi bir arka plan bilgin var mı?",
    };

    // ========== 通用无维基关键词（用于维基页面备选匹配） ==========
    const FALLBACK_KEYWORDS = {
        'zh': '没有维基',
        'en': "don't have a wiki",
        'de': 'kein Wiki',
        'es': 'no tenemos un wiki',
        'fr': "n'avons pas de wiki",
        'it': 'non è disponibile una wiki',
        'ja': 'wiki はまだありません',
        'pl': 'nie mamy jeszcze wiki',
        'pt': 'não temos nenhuma wiki',
        'ru': 'нет вики-статьи',
        'sv': 'ingen wiki',
        'tr': 'henüz bir viki yok'
    };

    // ========== 语言优先级 ==========
    const LANGUAGE_PRIORITY = [
        { code: 'en', name: 'English' }, { code: 'de', name: 'Deutsch' }, { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' }, { code: 'it', name: 'Italiano' }, { code: 'ja', name: '日本語' },
        { code: 'pl', name: 'Polski' }, { code: 'pt', name: 'Português' }, { code: 'ru', name: 'Русский' },
        { code: 'sv', name: 'Svenska' }, { code: 'tr', name: 'Türkçe' }, { code: 'zh', name: '简体中文' }
    ];

    // ========== UI 文本 ==========
    const UI_TEXTS = {
        'zh': { status: '查找状态', found: '已找到', noFound: '未找到其他语言维基。', checkComplete: '检查完成', currentPageLang: '界面语言' },
        'en': { status: 'Status', found: 'Found', noFound: 'No wiki found in other languages.', checkComplete: 'Check Complete', currentPageLang: 'Page Language' },
        'de': { status: 'Status', found: 'Gefunden', noFound: 'Kein Wiki in anderen Sprachen gefunden.', checkComplete: 'Überprüfung abgeschlossen', currentPageLang: 'Seitensprache' },
        'es': { status: 'Estado', found: 'Encontrado', noFound: 'No se encontró wiki en otros idiomas.', checkComplete: 'Verificación completa', currentPageLang: 'Idioma de la página' },
        'fr': { status: 'État', found: 'Trouvé', noFound: 'Aucun wiki trouvé dans d\'autres langues.', checkComplete: 'Vérification terminée', currentPageLang: 'Langue de la page' },
        'it': { status: 'Stato', found: 'Trovato', noFound: 'Nessun wiki trovato in altre lingue.', checkComplete: 'Controllo completato', currentPageLang: 'Lingua della pagina' },
        'ja': { status: '検索状態', found: '見つかりました', noFound: '他の言語のWikiは見つかりませんでした。', checkComplete: 'チェック完了', currentPageLang: 'ページ言語' },
        'pl': { status: 'Stan', found: 'Znaleziono', noFound: 'Nie znaleziono wiki w innych językach.', checkComplete: 'Sprawdzanie zakończone', currentPageLang: 'Język strony' },
        'pt': { status: 'Estado', found: 'Encontrado', noFound: 'Nenhum wiki encontrado em outros idiomas.', checkComplete: 'Verificação concluída', currentPageLang: 'Idioma da página' },
        'ru': { status: 'Статус', found: 'Найдено', noFound: 'Вики не найдено на других языках.', checkComplete: 'Проверка завершена', currentPageLang: 'Язык страницы' },
        'sv': { status: 'Status', found: 'Hittad', noFound: 'Ingen wiki hittades på andra språk.', checkComplete: 'Kontroll slutförd', currentPageLang: 'Sidspråk' },
        'tr': { status: 'Durum', found: 'Bulundu', noFound: 'Diğer dillerde wiki bulunamadı.', checkComplete: 'Kontrol tamamlandı', currentPageLang: 'Sayfa Dili' },
    };

    // ========== 状态管理 ==========
    const foundWikis = [];
    let completedChecks = 0;
    const totalChecks = LANGUAGE_PRIORITY.length;
    let currentLangCode = 'en';
    let isArtistPage = false;

    const notification = document.createElement('div');
    notification.id = 'lastfm-wiki-redirect-helper-float';

    function getUIText(key) {
        const langTexts = UI_TEXTS[currentLangCode] || UI_TEXTS['en'];
        return langTexts[key] || UI_TEXTS['en'][key];
    }

    function initializeNotification() {
        notification.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; background-color: #6c757d;
            color: white; padding: 12px 15px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 99999; font-size: 14px; max-width: 400px; line-height: 1.4; transition: background-color 0.5s;
        `;
        document.body.appendChild(notification);
    }

    function removeNotification() {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }

    function updateNotificationUI() {
        let htmlContent = '';
        let statusColor = '#6c757d';
        let completeFlag = '';

        if (completedChecks === totalChecks) {
            statusColor = foundWikis.length > 0 ? '#28a745' : '#dc3545';
            completeFlag = ` - ${getUIText('checkComplete')}`;
        }

        notification.style.backgroundColor = statusColor;

        htmlContent += `<strong>[${completedChecks}/${totalChecks}] ${getUIText('status')}${completeFlag}</strong>`;

        const langName = LANGUAGE_PRIORITY.find(l => l.code === currentLangCode)?.name || 'Unknown';
        htmlContent += `<br><small>${getUIText('currentPageLang')}：${langName}</small>`;

        htmlContent += `<hr style="margin: 4px 0; border-color: rgba(255,255,255,0.3);">`;

        if (foundWikis.length > 0) {
            htmlContent += `<strong>${getUIText('found')}：</strong> `;
            foundWikis.forEach(link => {
                htmlContent += `<a href="${link.url}" target="_blank" style="color: #fff; background-color: #1e7e34; padding: 2px 4px; border-radius: 3px; text-decoration: none; margin-right: 5px; display: inline-block; margin-top: 2px;">[${link.name}]</a> `;
            });
        } else if (completedChecks === totalChecks) {
             htmlContent += `${getUIText('noFound')}<br>`;
        }

        notification.innerHTML = htmlContent;
    }

    // ========== 核心请求函数 ==========
    function requestWithTimeout(url, timeout, langInfo) {
        return new Promise(resolve => {
            let xhr;
            let timer = setTimeout(() => { if (xhr) xhr.abort(); }, timeout);

            xhr = GM_xmlhttpRequest({
                method: "GET", url: url,
                onload: function(response) {
                    clearTimeout(timer);
                    resolve({ status: response.status, responseText: response.responseText, langInfo: langInfo });
                },
                onerror: function() {
                    clearTimeout(timer);
                    resolve({ status: 0, langInfo: langInfo });
                },
                onabort: function() {
                    clearTimeout(timer);
                    resolve({ status: -1, langInfo: langInfo });
                }
            });
        });
    }

    // ========== 辅助函数：检查维基页面是否无维基 ==========
    function isWikiPageMissingWiki(bodyText, langCode, isArtist) {
        // 1. 精确匹配
        const exactText = isArtist ? WIKI_NO_WIKI_MESSAGES_ARTIST[langCode] : WIKI_NO_WIKI_MESSAGES_ALBUM[langCode];
        if (exactText && bodyText.includes(exactText)) {
            return true;
        }
        // 2. 备选关键词匹配
        const keyword = FALLBACK_KEYWORDS[langCode] || "don't have a wiki";
        return bodyText.toLowerCase().includes(keyword.toLowerCase());
    }

    // ========== 主流程 ==========

    const path = window.location.pathname;
    const bodyText = document.body.innerText;

    // 1. URL 解析和语言检测
    let contentPath = path;
    const isWikiPage = path.endsWith('/+wiki');

    let detectedLangFromURL = 'en';
    const langMatch = path.match(/^\/([a-z]{2}(?:_[A-Z]{2})?)\//);

    if (langMatch) {
        const possibleLang = langMatch[1];
        if (UI_TEXTS[possibleLang]) {
            detectedLangFromURL = possibleLang;
        }
    } else {
        detectedLangFromURL = 'en';
    }

    currentLangCode = detectedLangFromURL;

    // 提取基础路径
    if (langMatch) {
        if (isWikiPage) {
            contentPath = path.substring(path.indexOf('/', 1), path.length - 5);
        } else {
            contentPath = path.substring(path.indexOf('/', 1));
        }
    } else {
        if (isWikiPage) {
            contentPath = path.substring(0, path.length - 5);
        } else {
            contentPath = path;
        }
    }

    const baseContentPath = contentPath.replace(/\/\+wiki$/, '');

    // 2. 判断页面类型
    const slashCount = (baseContentPath.match(/\//g) || []).length;
    isArtistPage = (slashCount === 2);

    // 3. 触发条件判断
    let shouldRun = false;

    if (isWikiPage) {
        // 维基页面：使用增强检查
        shouldRun = isWikiPageMissingWiki(bodyText, currentLangCode, isArtistPage);
    } else {
        // 主页面：使用精确文本匹配
        const triggerText = isArtistPage ? MAIN_PAGE_NO_WIKI_MESSAGES_ARTIST[currentLangCode] : MAIN_PAGE_NO_WIKI_MESSAGES_ALBUM[currentLangCode];
        if (triggerText) {
            shouldRun = bodyText.includes(triggerText);
        }
    }

    if (!shouldRun) {
        return;
    }

    // 4. 初始化 UI
    initializeNotification();
    updateNotificationUI();

    // 5. 并发检测其他语言维基
    const fetchPromises = LANGUAGE_PRIORITY.map(langInfo => {

        let targetUrl;
        if (langInfo.code === 'en') {
            targetUrl = `https://www.last.fm${baseContentPath}/+wiki`;
        } else if (langInfo.code === 'zh') {
            targetUrl = `https://www.last.fm/zh${baseContentPath}/+wiki`;
        } else {
            targetUrl = `https://www.last.fm/${langInfo.code}${baseContentPath}/+wiki`;
        }

        return requestWithTimeout(targetUrl, REQUEST_TIMEOUT_MS, langInfo).then(result => {

            completedChecks++;

            let isFound = false;
            if (result.status === 200) {
                // 判断目标语言页面是否有维基（使用同样的增强检查）
                if (!isWikiPageMissingWiki(result.responseText, langInfo.code, isArtistPage)) {
                    isFound = true;
                }
            }

            if (isFound) {
                foundWikis.push({ name: langInfo.name, url: targetUrl });
            }

            updateNotificationUI();
        });
    });

    // 6. 完成清理
    Promise.all(fetchPromises).then(() => {
        updateNotificationUI();
        setTimeout(removeNotification, 10000);
    });

})();
