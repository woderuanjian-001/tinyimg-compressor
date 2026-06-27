/**
 * TinyImg Cookie Consent Banner + Google Analytics 4 Integration
 *
 * 使用方法：
 * 1. 去 https://analytics.google.com 创建 GA4 媒体资源
 * 2. 拿到 Measurement ID（格式如 G-XXXXXXXXXX）
 * 3. 替换下方 GA_MEASUREMENT_ID 的值
 * 4. 确保本文件被上传到网站 assets/ 目录
 *
 * 功能：
 * - Consent Mode v2 合规（默认拒绝非必要 cookie）
 * - 底部 Cookie 同意横幅（Accept / Reject 按钮）
 * - 用户选择持久化到 localStorage（365 天后重新询问）
 * - 同意后才加载 GA4 分析 + AdSense 个性化广告
 */

(function () {
    'use strict';

    // ====== 配置区 ======
    // TODO: 替换为你从 analytics.google.com 获取的真实 Measurement ID
    const GA_MEASUREMENT_ID = 'G-B4F6XM1428';

    // 同意状态有效期（毫秒）：365 天
    const CONSENT_EXPIRY_MS = 365 * 24 * 60 * 60 * 1000;

    const CONSENT_KEY = 'tinyimg_consent_v1';
    const CONSENT_TIMESTAMP_KEY = 'tinyimg_consent_ts';

    // ====== 1. 初始化 dataLayer + gtag ======
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());

    // ====== 2. Consent Mode v2：默认拒绝（合规要求，必须在 GA4 加载前执行）======
    gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied',
        'wait_for_update': 500
    });

    // ====== 3. 动态加载 GA4 脚本 ======
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(gaScript);

    gtag('config', GA_MEASUREMENT_ID, { 'anonymize_ip': true });

    // ====== 4. 读取用户之前的同意选择 ======
    function getStoredConsent() {
        try {
            const choice = localStorage.getItem(CONSENT_KEY);
            const timestamp = localStorage.getItem(CONSENT_TIMESTAMP_KEY);
            if (!choice || !timestamp) return null;

            const age = Date.now() - parseInt(timestamp, 10);
            if (age > CONSENT_EXPIRY_MS) {
                // 超过 365 天，清除旧选择，重新询问
                localStorage.removeItem(CONSENT_KEY);
                localStorage.removeItem(CONSENT_TIMESTAMP_KEY);
                return null;
            }
            return choice; // 'granted' 或 'denied'
        } catch (e) {
            return null; // localStorage 不可用（隐私模式等）
        }
    }

    function saveConsent(choice) {
        try {
            localStorage.setItem(CONSENT_KEY, choice);
            localStorage.setItem(CONSENT_TIMESTAMP_KEY, Date.now().toString());
        } catch (e) {
            // localStorage 不可用，静默失败
        }
    }

    // ====== 5. 更新 Consent Mode ======
    function updateConsent(granted) {
        const state = granted ? 'granted' : 'denied';
        gtag('consent', 'update', {
            'ad_storage': state,
            'ad_user_data': state,
            'ad_personalization': state,
            'analytics_storage': state
        });
    }

    // ====== 6. Cookie 同意横幅 UI ======
    function createBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie consent');
        banner.style.cssText = [
            'position: fixed',
            'bottom: 0',
            'left: 0',
            'right: 0',
            'z-index: 9999',
            'background: #1f2937',
            'color: #f3f4f6',
            'padding: 16px 20px',
            'box-shadow: 0 -4px 20px rgba(0,0,0,0.15)',
            'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            'transform: translateY(100%)',
            'transition: transform 0.3s ease-out'
        ].join(';');

        banner.innerHTML = `
            <div style="max-width: 1100px; margin: 0 auto; display: flex; flex-wrap: wrap; align-items: center; gap: 16px; justify-content: space-between;">
                <div style="flex: 1 1 400px; min-width: 280px; font-size: 14px; line-height: 1.5;">
                    <span style="font-size: 18px; margin-right: 8px;">🍪</span>
                    We use cookies to improve your experience and analyze site traffic.
                    By clicking "Accept", you consent to the use of cookies for analytics and personalized ads.
                    See our <a href="/privacy.html" style="color: #93c5fd; text-decoration: underline;">Privacy Policy</a>.
                </div>
                <div style="display: flex; gap: 10px; flex-shrink: 0;">
                    <button id="cookie-reject" type="button"
                        style="padding: 10px 20px; font-size: 14px; font-weight: 600; border-radius: 8px; cursor: pointer; background: transparent; color: #d1d5db; border: 1px solid #4b5563; transition: all 0.2s;">
                        Reject
                    </button>
                    <button id="cookie-accept" type="button"
                        style="padding: 10px 24px; font-size: 14px; font-weight: 600; border-radius: 8px; cursor: pointer; background: #2563eb; color: #ffffff; border: none; transition: all 0.2s;">
                        Accept
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // 触发动画：滑入
        requestAnimationFrame(() => {
            banner.style.transform = 'translateY(0)';
        });

        // 绑定按钮
        document.getElementById('cookie-accept').addEventListener('click', () => {
            updateConsent(true);
            saveConsent('granted');
            removeBanner();
        });

        document.getElementById('cookie-reject').addEventListener('click', () => {
            updateConsent(false);
            saveConsent('denied');
            removeBanner();
        });

        // hover 效果
        const acceptBtn = document.getElementById('cookie-accept');
        const rejectBtn = document.getElementById('cookie-reject');
        acceptBtn.addEventListener('mouseenter', () => { acceptBtn.style.background = '#1d4ed8'; });
        acceptBtn.addEventListener('mouseleave', () => { acceptBtn.style.background = '#2563eb'; });
        rejectBtn.addEventListener('mouseenter', () => { rejectBtn.style.borderColor = '#6b7280'; rejectBtn.style.color = '#f3f4f6'; });
        rejectBtn.addEventListener('mouseleave', () => { rejectBtn.style.borderColor = '#4b5563'; rejectBtn.style.color = '#d1d5db'; });
    }

    function removeBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.style.transform = 'translateY(100%)';
            setTimeout(() => banner.remove(), 300);
        }
    }

    // ====== 7. 初始化逻辑 ======
    function init() {
        const stored = getStoredConsent();

        if (stored === 'granted') {
            // 用户之前同意过，直接更新 consent
            updateConsent(true);
        } else if (stored === 'denied') {
            // 用户之前拒绝过，保持拒绝，不显示横幅
            updateConsent(false);
        } else {
            // 首次访问或过期，显示横幅
            // 等 DOM 就绪后再插入横幅
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', createBanner);
            } else {
                createBanner();
            }
        }
    }

    init();
})();
