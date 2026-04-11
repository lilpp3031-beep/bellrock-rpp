<?php
/**
 * Template Name: pathbright LP
 * Description: pathbrightブランドサイト ランディングページ
 *
 * 【使い方】
 * 1. このファイルを wp-content/themes/お使いのテーマ/ に FTPでアップロード
 * 2. WordPress管理画面 → 固定ページ → 新規追加
 * 3. タイトルを「pathbright」等にする
 * 4. 右サイドバーの「テンプレート」から「pathbright LP」を選択
 * 5. 公開
 *
 * ※ このテンプレートはテーマのheader/footerを使わず、
 *   独立した1ページとして表示されます。
 */
?>
<!DOCTYPE html>
<html lang="ja">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>pathbright | トラックドライバーのための快適を。</title>
  <meta name="description"
    content="pathbrightは、長距離トラックドライバーのためのカーアクセサリーブランドです。シートクッション、寝台マットレスなど、ドライバーの快適を追求するプロダクトをお届けします。">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link
    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Manrope:wght@300;400;500;600&family=Noto+Sans+JP:wght@200;300;400;500;700&display=swap"
    rel="stylesheet">
  <?php wp_head(); ?>
  <style>
    :root {
      --black: #080808;
      --dark: #0e0e0e;
      --dark2: #151515;
      --dark3: #1c1c1c;
      --warm-white: #E8E4DE;
      --warm-gray: #6B6560;
      --mid-gray: #3a3835;
      --text-dim: #4a4744;
      --text-sub: #7a7570;
      --text-body: #999590;
      --text-light: #c5c0ba;
    }

    /* ── RESET（WPテーマのスタイルを上書き） ── */
    html,
    body {
      margin: 0;
      padding: 0
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box
    }

    html {
      scroll-behavior: smooth
    }

    body {
      font-family: 'Noto Sans JP', 'Manrope', sans-serif !important;
      background: var(--black) !important;
      color: var(--warm-white) !important;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
      line-height: 1.6;
    }

    /* WPの管理バー対応 */
    body.admin-bar nav {
      top: 32px
    }

    @media(max-width:782px) {
      body.admin-bar nav {
        top: 46px
      }
    }

    ::selection {
      background: var(--warm-white);
      color: var(--black)
    }

    img {
      max-width: 100%;
      height: auto
    }

    a {
      color: inherit
    }

    /* ── NAV ── */
    .pb-nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      padding: 2rem 3.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all .5s ease;
    }

    .pb-nav.scrolled {
      background: rgba(8, 8, 8, .92);
      backdrop-filter: blur(20px);
      padding: 1.2rem 3.5rem;
    }

    .pb-nav-logo {
      font-family: 'Manrope', sans-serif;
      font-size: 1.05rem;
      font-weight: 500;
      letter-spacing: .25em;
      text-transform: uppercase;
      color: var(--warm-white);
      text-decoration: none;
    }

    .pb-nav-links {
      display: flex;
      gap: 2.5rem;
      align-items: center
    }

    .pb-nav-links a {
      font-family: 'Manrope', sans-serif;
      font-size: .85rem;
      font-weight: 400;
      letter-spacing: .12em;
      color: var(--warm-white);
      text-decoration: none;
      opacity: .5;
      transition: opacity .4s;
    }

    .pb-nav-links a:hover {
      opacity: 1
    }

    .pb-hamburger {
      display: none;
      cursor: pointer;
      width: 24px;
      height: 14px;
      position: relative;
      z-index: 200
    }

    .pb-hamburger span {
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--warm-white);
      transition: .4s
    }

    .pb-hamburger span:first-child {
      top: 0
    }

    .pb-hamburger span:last-child {
      bottom: 0
    }

    .pb-mobile-nav {
      position: fixed;
      inset: 0;
      background: var(--black);
      z-index: 150;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2.5rem;
      opacity: 0;
      visibility: hidden;
      transition: .5s;
    }

    .pb-mobile-nav.open {
      opacity: 1;
      visibility: visible
    }

    .pb-mobile-nav a {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2rem;
      font-weight: 300;
      font-style: italic;
      color: var(--warm-white);
      text-decoration: none;
      opacity: .6;
      transition: opacity .3s;
    }

    .pb-mobile-nav a:hover {
      opacity: 1
    }

    /* ── HERO ── */
    .pb-hero {
      height: 100vh;
      min-height: 700px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 0 3.5rem 6rem;
      position: relative;
      overflow: hidden;
    }

    .pb-hero-bg {
      position: absolute;
      inset: 0;
      background: url('https://pathbright.jp/wp-content/uploads/2026/02/Gemini_Generated_Image_eaidzaeaidzaeaid_cleaned-scaled.png') center/cover no-repeat;
    }

    .pb-hero-bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(8, 8, 8, 0.3) 0%, rgba(8, 8, 8, 0.5) 100%);
    }


    .pb-hero-content {
      position: relative;
      z-index: 2
    }

    .pb-hero-eyebrow {
      font-family: 'Manrope', sans-serif;
      font-size: .8rem;
      font-weight: 400;
      letter-spacing: .35em;
      text-transform: uppercase;
      color: var(--text-body);
      margin-bottom: 2.5rem;
      opacity: 0;
      animation: pbFadeIn 1s ease .3s forwards;
    }

    .pb-hero-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(3rem, 6vw, 5.5rem);
      font-weight: 300;
      line-height: 1.05;
      letter-spacing: -.02em;
      color: var(--warm-white);
      margin-bottom: 2rem;
      opacity: 0;
      animation: pbFadeUp 1.2s ease .5s forwards;
    }

    .pb-hero-title em {
      font-style: italic;
      color: var(--text-sub)
    }

    .pb-hero-bottom {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      opacity: 0;
      animation: pbFadeIn 1s ease .8s forwards;
    }

    .pb-hero-desc {
      font-size: 1rem;
      font-weight: 300;
      color: var(--text-body);
      line-height: 2;
      max-width: 480px;
    }

    .pb-hero-scroll {
      display: flex;
      align-items: center;
      gap: 1rem
    }

    .pb-hero-scroll span {
      font-family: 'Manrope', sans-serif;
      font-size: .75rem;
      letter-spacing: .2em;
      text-transform: uppercase;
      color: var(--text-dim);
    }

    .pb-scroll-bar {
      width: 1px;
      height: 48px;
      background: var(--mid-gray);
      position: relative;
      overflow: hidden;
    }

    .pb-scroll-bar::after {
      content: '';
      position: absolute;
      top: -100%;
      left: 0;
      width: 100%;
      height: 40%;
      background: var(--warm-white);
      animation: pbScrollDown 2.5s ease-in-out infinite;
    }

    @keyframes pbScrollDown {
      0% {
        top: -40%
      }

      100% {
        top: 100%
      }
    }

    @keyframes pbFadeUp {
      from {
        opacity: 0;
        transform: translateY(40px)
      }

      to {
        opacity: 1;
        transform: translateY(0)
      }
    }

    @keyframes pbFadeIn {
      from {
        opacity: 0
      }

      to {
        opacity: 1
      }
    }

    .pb-hr {
      height: 1px;
      background: var(--dark3);
      margin: 0 3.5rem
    }

    /* ── PHILOSOPHY ── */
    .pb-philosophy {
      padding: 10rem 3.5rem;
      display: grid;
      grid-template-columns: 1fr 1.1fr;
      grid-template-areas:
        "header header"
        "image text";
      gap: 3rem 6rem;
      align-items: stretch;
      max-width: 1400px;
      margin: 0 auto;
    }

    .pb-phil-header {
      grid-area: header;
    }

    .pb-phil-image {
      grid-area: image;
    }

    .pb-section-label {
      font-family: 'Manrope', sans-serif;
      font-size: 1.1rem;
      font-weight: 500;
      letter-spacing: .25em;
      text-transform: uppercase;
      color: var(--warm-white);
      margin-bottom: 2rem;
    }

    .pb-section-heading {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(2.2rem, 4vw, 3.5rem);
      font-weight: 300;
      line-height: 1.3;
      letter-spacing: -.01em;
      margin-bottom: 1rem;
    }

    .pb-section-heading em {
      font-style: italic;
      color: var(--text-sub)
    }

    .pb-story-img-wrapper {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      border-radius: 4px;
    }

    .pb-story-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      filter: brightness(0.85) contrast(1.15) grayscale(15%);
      transition: filter 0.8s ease;
    }

    .pb-story-img-wrapper::after {
      content: '';
      position: absolute;
      inset: 0;
      background:
        linear-gradient(135deg, rgba(232, 228, 222, .04) 0%, transparent 60%),
        linear-gradient(to top, rgba(8, 8, 8, 0.9) 0%, transparent 40%);
      pointer-events: none;
    }

    .pb-phil-right {
      grid-area: text;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      padding-top: 0;
    }

    .pb-phil-text {
      font-size: 1.08rem;
      font-weight: 300;
      color: var(--text-body);
      line-height: 2.4;
      margin-bottom: 3.5rem;
    }

    .pb-phil-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem
    }

    .pb-stat-item {
      padding: 2rem 0;
      border-top: 1px solid var(--dark3)
    }

    .pb-stat-number {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2.5rem;
      font-weight: 300;
      color: var(--warm-white);
      line-height: 1;
      margin-bottom: .6rem;
    }

    .pb-stat-label {
      font-family: 'Manrope', sans-serif;
      font-size: .8rem;
      font-weight: 400;
      letter-spacing: .15em;
      text-transform: uppercase;
      color: var(--text-dim);
    }

    /* ── IMAGE BREAK ── */
    .pb-image-break {
      width: 100%;
      height: 45vh;
      min-height: 300px;
      position: relative;
      overflow: hidden;
      background: url('https://pathbright.jp/wp-content/uploads/2026/02/05de718f1f9198b48bdd53c3a0fb119a.png') center/cover no-repeat fixed;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pb-image-break::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        linear-gradient(180deg, rgba(8, 8, 8, 0.6) 0%, rgba(8, 8, 8, 0.6) 100%),
        radial-gradient(ellipse at 50% 50%, rgba(232, 228, 222, .03) 0%, transparent 60%),
        linear-gradient(90deg, var(--black) 0%, transparent 20%, transparent 80%, var(--black) 100%);
    }

    .pb-image-break-text {
      position: relative;
      z-index: 1;
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(1.4rem, 3vw, 2.2rem);
      font-weight: 300;
      font-style: italic;
      color: rgba(232, 228, 222, .5);
      text-align: center;
      padding: 0 2rem;
    }

    /* ── PRODUCTS ── */
    .pb-products-section {
      padding: 8rem 3.5rem 10rem;
      background: var(--dark)
    }

    .pb-products-header {
      max-width: 1400px;
      margin: 0 auto 5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .pb-products-header-left .pb-section-label {
      margin-bottom: 1.5rem
    }

    .pb-section-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(2rem, 3.5vw, 3rem);
      font-weight: 300;
    }

    .pb-products-count {
      font-family: 'Manrope', sans-serif;
      font-size: .8rem;
      letter-spacing: .15em;
      color: var(--text-dim);
    }

    .pb-products-grid {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .pb-product-card {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      transition: all .5s ease;
    }

    .pb-product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
    }

    .pb-product-visual {
      height: 380px;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
    }

    .pb-product-icon {
      font-size: 5rem;
      opacity: .12;
      transition: opacity .5s, transform .5s;
      z-index: 0
    }

    .pb-product-card:hover .pb-product-icon {
      opacity: .2;
      transform: scale(1.08)
    }

    .pb-product-placeholder-text {
      position: absolute;
      bottom: 1rem;
      right: 1.2rem;
      z-index: 2;
      font-family: 'Manrope', sans-serif;
      font-size: .65rem;
      letter-spacing: .15em;
      color: var(--text-dim);
    }

    .pb-product-tag {
      position: absolute;
      top: 1.5rem;
      left: 1.5rem;
      z-index: 2;
      font-family: 'Manrope', sans-serif;
      font-size: .7rem;
      letter-spacing: .25em;
      text-transform: uppercase;
      color: var(--black);
      background: var(--warm-white);
      padding: .35rem .8rem;
      font-weight: 500;
    }

    .pb-product-info {
      padding: 2rem 2rem 2.5rem
    }

    .pb-product-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.6rem;
      font-weight: 500;
      margin-bottom: .8rem;
      color: var(--black);
    }

    .pb-product-desc {
      font-size: 1.02rem;
      font-weight: 300;
      color: var(--text-body);
      line-height: 1.9;
      margin-bottom: 2rem;
    }

    .pb-product-link {
      font-family: 'Manrope', sans-serif;
      font-size: .8rem;
      letter-spacing: .2em;
      text-transform: uppercase;
      color: var(--black);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: .8rem;
      transition: gap .4s;
    }

    .pb-product-link:hover {
      gap: 1.5rem
    }

    .pb-product-link-line {
      width: 24px;
      height: 1px;
      background: var(--black);
      transition: width .4s
    }

    .pb-product-link:hover .pb-product-link-line {
      width: 40px
    }

    /* ── REVIEWS ── */
    .pb-reviews-section {
      padding: 6rem 3.5rem 10rem;
      background: var(--dark);
      max-width: 1400px;
      margin: 0 auto;
    }

    .pb-reviews-header {
      margin-bottom: 5rem;
    }

    .pb-review-category {
      margin-bottom: 5rem;
    }

    .pb-review-cat-title {
      font-family: 'Manrope', sans-serif;
      font-size: 1rem;
      font-weight: 400;
      color: var(--warm-white);
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .pb-review-cat-title::before {
      content: '';
      width: 40px;
      height: 1px;
      background: var(--text-sub);
    }

    .pb-reviews-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
      background: var(--dark3);
      border: 1px solid var(--dark3);
    }

    .pb-review-card {
      background: var(--dark);
      padding: 3rem 2.5rem;
      display: flex;
      flex-direction: column;
      transition: background .4s;
    }

    .pb-review-card:hover {
      background: #151515;
    }

    .pb-review-stars {
      color: #E86A1E;
      font-size: 1.2rem;
      letter-spacing: 0.1rem;
      margin-bottom: 1.5rem;
    }

    .pb-review-stars .half-star {
      opacity: 0.5;
    }

    .pb-review-text {
      font-size: 0.88rem;
      font-weight: 300;
      color: var(--text-body);
      line-height: 2;
      flex-grow: 1;
      margin-bottom: 2.5rem;
    }

    .pb-review-date {
      font-family: 'Manrope', sans-serif;
      font-size: 0.75rem;
      color: var(--text-dim);
      letter-spacing: 0.05em;
    }

    /* ── FEATURES ── */
    .pb-features-section {
      padding: 10rem 3.5rem;
      max-width: 1400px;
      margin: 0 auto
    }

    .pb-features-top {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6rem;
      margin-bottom: 6rem
    }

    .pb-features-list {
      display: flex;
      flex-direction: column
    }

    .pb-feature-item {
      padding: 2.5rem 0;
      border-bottom: 1px solid var(--dark3);
      display: grid;
      grid-template-columns: 48px 1fr;
      gap: 2rem;
      align-items: start;
      transition: border-color .4s;
    }

    .pb-feature-item:first-child {
      border-top: 1px solid var(--dark3)
    }

    .pb-feature-item:hover {
      border-color: var(--mid-gray)
    }

    .pb-feature-num {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      font-weight: 300;
      color: var(--text-dim);
      font-style: italic;
    }

    .pb-feature-content h3 {
      font-family: 'Manrope', sans-serif;
      font-size: 1.05rem;
      font-weight: 500;
      margin-bottom: .8rem;
      color: var(--warm-white);
    }

    .pb-feature-content p {
      font-size: 1.02rem;
      font-weight: 300;
      color: var(--text-body);
      line-height: 1.9
    }

    /* ── BRAND STORY ── */
    .pb-story-section {
      background: var(--dark);
      position: relative;
      overflow: hidden
    }

    .pb-story-visual {
      width: 100%;
      height: 40vh;
      min-height: 280px;
      position: relative;
      overflow: hidden;
      background:
        linear-gradient(to bottom, rgba(8, 8, 8, 0.4) 0%, rgba(8, 8, 8, 0.9) 100%),
        url('https://pathbright.jp/wp-content/uploads/2026/02/fedd8822-66fb-4aa1-af91-57e573b12818.png') center/cover no-repeat;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pb-story-visual::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, var(--dark) 0%, transparent 30%, transparent 70%, var(--dark) 100%);
    }

    .pb-story-text-block {
      padding: 5rem 3.5rem 10rem
    }

    .pb-story-inner {
      max-width: 750px;
      margin: 0 auto;
      text-align: center
    }

    .pb-story-label {
      font-family: 'Manrope', sans-serif;
      font-size: .75rem;
      font-weight: 400;
      letter-spacing: .35em;
      text-transform: uppercase;
      color: var(--text-dim);
      margin-bottom: 4rem;
    }

    .pb-story-quote {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 300;
      line-height: 1.5;
      margin-bottom: 3.5rem;
    }

    .pb-story-quote em {
      font-style: italic;
      color: var(--text-sub)
    }

    .pb-story-divider {
      width: 40px;
      height: 1px;
      background: var(--mid-gray);
      margin: 3.5rem auto
    }

    .pb-story-body {
      font-size: clamp(1.05rem, 2vw, 1.25rem);
      font-weight: 300;
      color: var(--text-body);
      line-height: 2.2;
      text-align: left;
    }

    .pb-story-body+.pb-story-body {
      margin-top: 2rem
    }

    /* ── CTA ── */
    .pb-cta-section {
      padding: 12rem 3.5rem;
      text-align: center;
      position: relative;
      overflow: hidden
    }

    .pb-cta-bg {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 50% 50%, rgba(232, 228, 222, .03) 0%, transparent 50%), var(--dark2);
    }

    .pb-cta-content {
      position: relative;
      z-index: 2
    }

    .pb-cta-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(2.5rem, 6vw, 5rem);
      font-weight: 300;
      letter-spacing: -.02em;
      line-height: 1.15;
      margin-bottom: 2rem;
    }

    .pb-cta-title em {
      font-style: italic;
      color: var(--text-sub)
    }

    .pb-cta-desc {
      font-size: 1.05rem;
      font-weight: 300;
      color: var(--text-body);
      line-height: 2;
      max-width: 400px;
      margin: 0 auto 3.5rem;
    }

    .pb-btn {
      font-family: 'Manrope', sans-serif;
      font-size: .85rem;
      font-weight: 500;
      letter-spacing: .2em;
      text-transform: uppercase;
      padding: 1.1rem 3rem;
      text-decoration: none;
      display: inline-block;
      transition: all .4s ease;
    }

    .pb-btn-filled {
      background: var(--warm-white);
      color: var(--black);
      border: 1px solid var(--warm-white)
    }

    .pb-btn-filled:hover {
      background: transparent;
      color: var(--warm-white);
      transform: translateY(-2px)
    }

    .pb-btn-ghost {
      background: transparent;
      color: var(--warm-white);
      border: 1px solid var(--mid-gray)
    }

    .pb-btn-ghost:hover {
      border-color: var(--warm-white);
      transform: translateY(-2px)
    }

    /* ── FOOTER ── */
    .pb-footer {
      padding: 5rem 3.5rem 3rem;
      border-top: 1px solid var(--dark3)
    }

    .pb-footer-grid {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 2.5fr 1fr 1fr 1fr;
      gap: 3rem;
    }

    .pb-footer-brand p {
      font-size: .98rem;
      font-weight: 300;
      color: var(--text-dim);
      line-height: 1.9;
      margin-top: 1.5rem;
      max-width: 280px;
    }

    .pb-footer-col h4 {
      font-family: 'Manrope', sans-serif;
      font-size: .75rem;
      font-weight: 400;
      letter-spacing: .2em;
      text-transform: uppercase;
      color: var(--text-dim);
      margin-bottom: 1.5rem;
    }

    .pb-footer-col a {
      display: block;
      font-size: 1rem;
      font-weight: 300;
      color: var(--text-body);
      text-decoration: none;
      margin-bottom: .8rem;
      transition: color .3s;
    }

    .pb-footer-col a:hover {
      color: var(--warm-white)
    }

    .pb-footer-bottom {
      max-width: 1400px;
      margin: 4rem auto 0;
      padding-top: 2rem;
      border-top: 1px solid var(--dark3);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .pb-footer-bottom p {
      font-family: 'Manrope', sans-serif;
      font-size: .8rem;
      color: var(--text-dim);
      letter-spacing: .1em;
    }

    /* ── SCROLL REVEAL ── */
    .pb-reveal {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity .9s cubic-bezier(.25, .46, .45, .94),
        transform .9s cubic-bezier(.25, .46, .45, .94);
    }

    .pb-reveal.visible {
      opacity: 1;
      transform: translateY(0)
    }

    .pb-reveal-d1 {
      transition-delay: .15s
    }

    .pb-reveal-d2 {
      transition-delay: .3s
    }

    /* ── RESPONSIVE ── */
    @media(max-width:1000px) {
      .pb-nav {
        padding: 1.5rem 2rem
      }

      .pb-nav.scrolled {
        padding: 1.2rem 2rem
      }

      .pb-nav-links {
        display: none
      }

      .pb-hamburger {
        display: block
      }

      .pb-hero {
        padding: 0 2rem 5rem
      }

      .pb-hero-desc {
        font-size: clamp(0.8rem, 3.6vw, 1rem);
        letter-spacing: -0.02em;
        max-width: 100%;
      }

      .pb-hr {
        margin: 0 2rem
      }

      .pb-philosophy {
        grid-template-columns: 1fr;
        grid-template-areas:
          "header"
          "image"
          "text";
        gap: 4rem;
        padding: 6rem 2rem
      }

      .pb-story-img-wrapper {
        aspect-ratio: 4/3;
        height: auto;
      }

      .pb-products-section {
        padding: 6rem 2rem 8rem
      }

      .pb-products-grid {
        grid-template-columns: 1fr
      }

      .pb-products-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem
      }

      .pb-features-section {
        padding: 6rem 2rem
      }

      .pb-features-top {
        grid-template-columns: 1fr;
        gap: 3rem
      }

      .pb-reviews-section {
        padding: 4rem 2rem 6rem;
      }

      .pb-reviews-grid {
        grid-template-columns: 1fr;
        gap: 1px;
      }

      .pb-review-card {
        padding: 2.5rem 1.5rem;
      }

      .pb-feature-item {
        grid-template-columns: 32px 1fr;
        gap: 1.2rem
      }

      .pb-story-text-block {
        padding: 4rem 2rem 6rem
      }

      .pb-cta-section {
        padding: 8rem 2rem
      }

      .pb-footer {
        padding: 4rem 2rem 2rem
      }

      .pb-footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2.5rem
      }

      .pb-footer-bottom {
        flex-direction: column;
        gap: .8rem;
        text-align: center
      }

      .pb-hero-bottom {
        flex-direction: column;
        gap: 2rem;
        align-items: flex-start
      }

      .pb-product-visual {
        height: 280px
      }
    }

    @media(max-width:600px) {
      .pb-image-break {
        background-attachment: scroll !important;
        background-position: center center !important;
      }

      .pb-hero-bg {
        background-position: 25% 40% !important;
      }

      .pb-hero-title {
        font-size: 2.8rem
      }

      .pb-phil-stats {
        grid-template-columns: 1fr
      }

      .pb-footer-grid {
        grid-template-columns: 1fr
      }

      .pb-image-break {
        height: 30vh;
        min-height: 200px
      }
    }
  </style>

  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="pathbright | トラックドライバーのための快適を。">
  <meta property="og:description"
    content="pathbrightは、長距離トラックドライバーのためのカーアクセサリーブランドです。シートクッション、寝台マットレスなど、ドライバーの快適を追求するプロダクトをお届けします。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://pathbright.jp/">
  <meta property="og:image"
    content="https://pathbright.jp/wp-content/uploads/2026/02/Gemini_Generated_Image_eaidzaeaidzaeaid_cleaned-scaled.png">
  <meta name="twitter:card" content="summary_large_image">

  <!-- JSON-LD Structured Data (Organization & Products) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://pathbright.jp/#organization",
        "name": "pathbright",
        "url": "https://pathbright.jp/",
        "logo": "https://pathbright.jp/wp-content/uploads/2026/02/Gemini_Generated_Image_eaidzaeaidzaeaid_cleaned-scaled.png",
        "description": "長距離トラックドライバーのためのカーアクセサリーブランド"
      },
      {
        "@type": "Product",
        "name": "pathbright Seat Cushion",
        "image": "https://pathbright.jp/wp-content/uploads/2026/02/00.jpg",
        "description": "長時間のドライブでも疲れにくい、高密度低反発クッション。体圧を均等に分散し、腰への負担を軽減します。",
        "brand": {
          "@type": "Brand",
          "name": "pathbright"
        },
        "offers": {
          "@type": "Offer",
          "url": "https://www.amazon.co.jp/dp/B0FNL8XMVB",
          "priceCurrency": "JPY",
          "availability": "https://schema.org/InStock"
        }
      },
      {
        "@type": "Product",
        "name": "pathbright Sleeper Mattress",
        "image": "https://pathbright.jp/wp-content/uploads/2026/02/サムネイル.jpg",
        "description": "寝台スペースに最適化された高反発マットレス。限られたスペースでも質の高い睡眠を実現します。",
        "brand": {
          "@type": "Brand",
          "name": "pathbright"
        },
        "offers": {
          "@type": "Offer",
          "url": "https://www.amazon.co.jp/dp/B0GDDF27M2",
          "priceCurrency": "JPY",
          "availability": "https://schema.org/InStock"
        }
      }
    ]
  }
  </script>
</head>

<body <?php body_class(); ?>>
  <?php wp_body_open(); ?>

  <!-- Mobile Nav -->
  <div class="pb-mobile-nav" id="pbMobileNav">
    <a href="#philosophy" onclick="pbCloseMobile()">私たちの想い</a>
    <a href="#products" onclick="pbCloseMobile()">製品一覧</a>
    <a href="#features" onclick="pbCloseMobile()">選ばれる理由</a>
    <a href="#story" onclick="pbCloseMobile()">ブランドストーリー</a>
    <a href="#contact" onclick="pbCloseMobile()">お問い合わせ</a>
  </div>

  <!-- Nav -->
  <nav class="pb-nav" id="pbNavbar">
    <a href="#" class="pb-nav-logo">pathbright</a>
    <div class="pb-nav-links">
      <a href="#philosophy">私たちの想い</a>
      <a href="#products">製品一覧</a>
      <a href="#features">選ばれる理由</a>
      <a href="#story">ブランドストーリー</a>
      <a href="#contact" class="pb-btn pb-btn-ghost" style="padding:.5rem 1.5rem;font-size:.8rem;opacity:1;">お問い合わせ</a>
    </div>
    <div class="pb-hamburger" onclick="pbToggleMobile()"><span></span><span></span></div>
  </nav>

  <main id="main-content">
    <!-- ═══ HERO ═══ -->
    <section class="pb-hero">
      <div class="pb-hero-bg"></div>
      <div class="pb-hero-content">
        <div class="pb-hero-eyebrow">Truck Driver's Comfort Brand</div>
        <h1 class="pb-hero-title">道を走る人の、<br><em>快適を照らす。</em></h1>
        <div class="pb-hero-bottom">
          <p class="pb-hero-desc">pathbrightは、長距離トラックドライバーのための<br>カーアクセサリーブランドです。</p>
          <div class="pb-hero-scroll"><span>Scroll</span>
            <div class="pb-scroll-bar"></div>
          </div>
        </div>
      </div>
    </section>

    <div class="pb-hr"></div>

    <!-- ═══ PHILOSOPHY ═══ -->
    <section class="pb-philosophy" id="philosophy">
      <div class="pb-phil-header pb-reveal">
        <div class="pb-section-label">私たちの想い</div>
        <h2 class="pb-section-heading">過酷な道の先に、<br><em>安らぎを届けたい。</em></h2>
      </div>

      <div class="pb-story-img-wrapper pb-phil-image pb-reveal">
        <img src="https://pathbright.jp/wp-content/uploads/2026/02/Gemini_Generated_Image_cklh88cklh88cklh.png"
          alt="過酷な道の先に安らぎを届ける" class="pb-story-img" loading="lazy">
      </div>

      <div class="pb-phil-right">
        <div>
          <p class="pb-phil-text pb-reveal">
            長距離を走り続けるトラックドライバーにとって、
            車内は第二の生活空間。
            何百キロもの道のりを、身体を預けるシート。
            わずかな仮眠で明日の力を取り戻す寝台。
          </p>
          <p class="pb-phil-text pb-reveal pb-reveal-d1">
            pathbrightは、そのひとつひとつを丁寧に設計します。
            過酷な環境でも最高のパフォーマンスを発揮するための
            「快適」を追求し、プロダクトに込めています。
          </p>
        </div>
        <div class="pb-phil-stats pb-reveal pb-reveal-d2">
          <div class="pb-stat-item">
            <div class="pb-stat-number">24/7</div>
            <div class="pb-stat-label">ドライバーの快適を</div>
          </div>
          <div class="pb-stat-item">
            <div class="pb-stat-number">100%</div>
            <div class="pb-stat-label">プロ仕様の品質</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ IMAGE BREAK ═══ -->
    <div class="pb-image-break">
      <div class="pb-image-break-text pb-reveal">誰かのために走り続けるあなたへ。</div>
    </div>

    <!-- ═══ PRODUCTS ═══ -->
    <section class="pb-products-section" id="products">
      <div class="pb-products-header">
        <div class="pb-products-header-left">
          <div class="pb-section-label pb-reveal">製品一覧</div>
          <h2 class="pb-section-title pb-reveal pb-reveal-d1">プロダクト</h2>
        </div>
        <div class="pb-products-count pb-reveal">2 Items</div>
      </div>
      <div class="pb-products-grid">
        <a href="https://www.amazon.co.jp/dp/B0FNL8XMVB" target="_blank" rel="noopener noreferrer"
          class="pb-product-card pb-reveal" style="text-decoration:none; color:inherit; cursor:pointer;">
          <div class="pb-product-visual">
            <div class="pb-product-icon">🪑</div>
            <div class="pb-product-tag">On Sale</div>
            <img src="https://pathbright.jp/wp-content/uploads/2026/02/00.jpg" alt="Seat Cushion"
              style="width:100%; height:100%; object-fit:contain; padding:5%; box-sizing:border-box; position:absolute; inset:0; border-radius:12px;"
              loading="lazy">
          </div>
          <div class="pb-product-info">
            <h3 class="pb-product-name">Seat Cushion</h3>
            <p class="pb-product-desc">長時間のドライブでも疲れにくい、高密度低反発クッション。体圧を均等に分散し、腰への負担を軽減します。</p>
          </div>
        </a>
        <a href="https://www.amazon.co.jp/dp/B0GDDF27M2" target="_blank" rel="noopener noreferrer"
          class="pb-product-card pb-reveal pb-reveal-d1" style="text-decoration:none; color:inherit; cursor:pointer;">
          <div class="pb-product-visual">
            <div class="pb-product-icon">🛏️</div>
            <div class="pb-product-tag">On Sale</div>
            <img src="https://pathbright.jp/wp-content/uploads/2026/02/サムネイル.jpg" alt="Sleeper Mattress"
              style="width:100%; height:100%; object-fit:contain; padding:5%; box-sizing:border-box; position:absolute; inset:0; border-radius:12px;"
              loading="lazy">
          </div>
          <div class="pb-product-info">
            <h3 class="pb-product-name">Sleeper Mattress</h3>
            <p class="pb-product-desc">寝台スペースに最適化された高反発マットレス。限られたスペースでも質の高い睡眠を実現します。</p>
          </div>
        </a>
      </div>
    </section>

    <!-- ═══ REVIEWS ═══ -->
    <section class="pb-reviews-section" id="reviews">
      <div class="pb-reviews-header pb-reveal">
        <div class="pb-section-label">Reviews</div>
        <h2 class="pb-section-title">購入者の声</h2>
      </div>

      <!-- Sleeper Mattress Reviews -->
      <div class="pb-review-category pb-reveal">
        <h3 class="pb-review-cat-title">寝台マットレス</h3>
        <div class="pb-reviews-grid">
          <div class="pb-review-card">
            <div class="pb-review-stars">★★★★★</div>
            <p class="pb-review-text">「ぶ厚いマットレスが身体にフィットして腰痛から解放してくれた！リバーシブルな点も◎。よく考えて作られていると感じます。」</p>
            <div class="pb-review-date">2026年1月</div>
          </div>
          <div class="pb-review-card">
            <div class="pb-review-stars">★★★★★</div>
            <p class="pb-review-text">「ネムリッチを5年間使ってからの買い替えです。比べ物にならない使用感。10センチの厚みでぐっすり眠れます。」</p>
            <div class="pb-review-date">2026年2月</div>
          </div>
          <div class="pb-review-card">
            <div class="pb-review-stars">★★★★★</div>
            <p class="pb-review-text">「想像をさらに超えて良かったです。室内でのごろ寝用に使ってますが、寝心地が大変良い感じです。」</p>
            <div class="pb-review-date">2026年2月</div>
          </div>
        </div>
      </div>

      <!-- Seat Cushion Reviews -->
      <div class="pb-review-category pb-reveal">
        <h3 class="pb-review-cat-title">シートクッション</h3>
        <div class="pb-reviews-grid">
          <div class="pb-review-card">
            <div class="pb-review-stars">★★★★★</div>
            <p class="pb-review-text">「ファイブスターギガのシートに使用していますがサイズぴったり。ずれ防止のゴムが本当に役に立ってます。座り心地もよいいい買い物をしました。」</p>
            <div class="pb-review-date">2025年11月</div>
          </div>
          <div class="pb-review-card">
            <div class="pb-review-stars">★★★★★</div>
            <p class="pb-review-text">「トラックでの長距離移動が楽になりました。お尻の痛さが軽減されましたね。」</p>
            <div class="pb-review-date">2025年10月</div>
          </div>
          <div class="pb-review-card">
            <div class="pb-review-stars">★★★★<span class="half-star">★</span></div>
            <p class="pb-review-text">
              「通気性の良いメッシュ素材により、熱や湿気がこもりにくく蒸れを気にせず快適に過ごせます。カバーは丸洗いできるので、いつでも清潔な状態を保てます。長距離運転の疲労軽減としてとても優れた効果を発揮してくれています。」
            </p>
            <div class="pb-review-date">2025年9月</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ FEATURES ═══ -->
    <section class="pb-features-section" id="features">
      <div class="pb-features-top">
        <div class="pb-reveal">
          <div class="pb-section-label">選ばれる理由</div>
          <h2 class="pb-section-heading">選ばれる、<br><em>3つの理由。</em></h2>
        </div>
        <div></div>
      </div>
      <div class="pb-features-list">
        <div class="pb-feature-item pb-reveal">
          <div class="pb-feature-num">01</div>
          <div class="pb-feature-content">
            <h3>ドライバー視点の設計</h3>
            <p>現役ドライバーの声をもとに、実際の使用環境を徹底的にリサーチ。現場で本当に求められる機能を追求しています。</p>
          </div>
        </div>
        <div class="pb-feature-item pb-reveal pb-reveal-d1">
          <div class="pb-feature-num">02</div>
          <div class="pb-feature-content">
            <h3>プロ仕様の耐久性</h3>
            <p>毎日の過酷な使用に耐えるタフな素材選び。長く使えるからこそ、本当の意味でコストパフォーマンスに優れています。</p>
          </div>
        </div>
        <div class="pb-feature-item pb-reveal pb-reveal-d2">
          <div class="pb-feature-num">03</div>
          <div class="pb-feature-content">
            <h3>洗練されたデザイン</h3>
            <p>無骨さと洗練さを兼ね備えたデザイン。プロの道具でありながら、所有する喜びを感じられるプロダクトです。</p>
          </div>
        </div>
      </div>
    </section>

    <div class="pb-hr"></div>

    <!-- ═══ BRAND STORY ═══ -->
    <section class="pb-story-section" id="story">
      <div class="pb-story-visual">
      </div>
      <div class="pb-story-text-block">
        <div class="pb-story-inner">
          <div class="pb-story-label pb-reveal">ブランドストーリー</div>
          <h2 class="pb-story-quote pb-reveal">
            <span style="display:inline-block;">道を照らし、</span>
            <span style="display:inline-block;"><em>快適を届ける。</em></span><br>
            <span style="display:inline-block;">それがpathbrightの</span>
            <span style="display:inline-block;">使命。</span>
          </h2>
          <div class="pb-story-divider pb-reveal"></div>
          <p class="pb-story-body pb-reveal">
            「pathbright」——道（path）を明るく（bright）照らすという想いを込めて。
            日本の物流を支えるトラックドライバーの皆さまに、
            少しでも快適な時間を届けたい。
            長い夜を走り抜けた先に訪れる、夜明けの白い光のように、
            疲れた身体をそっと包み込むプロダクトを。
          </p>
          <p class="pb-story-body pb-reveal">
            まだ生まれたばかりのブランドですが、
            ドライバーの声に耳を傾け、本当に必要とされる製品を
            一つひとつ丁寧に作り続けていきます。
            シートクッション、寝台マットレスから始まり、
            これからさらにカーアクセサリーのラインナップを拡充予定。
            pathbrightと共に、快適なドライブを。
          </p>
        </div>
      </div>
    </section>

    <!-- ═══ CTA ═══ -->
    <section class="pb-cta-section" id="contact">
      <div class="pb-cta-bg"></div>
      <div class="pb-cta-content pb-reveal">
        <div class="pb-section-label" style="margin-bottom:3rem">お問い合わせ</div>
        <h2 class="pb-cta-title"><em>Get in</em> Touch</h2>
        <p class="pb-cta-desc">
          製品に関するお問い合わせ、<br>
          コラボレーションのご相談など、<br>
          お気軽にご連絡ください。
        </p>
        <div style="display:flex; gap:1.5rem; justify-content:center; flex-wrap:wrap;">
          <a href="https://lin.ee/jnDevDi" target="_blank" rel="noopener noreferrer" class="pb-btn pb-btn-filled">公式LINE</a>
          <a href="mailto:bellrock@e-mail.jp" class="pb-btn pb-btn-ghost">メールで問い合わせ</a>
        </div>
      </div>
    </section>

  </main>

  <!-- ═══ FOOTER ═══ -->
  <footer class="pb-footer">
    <div class="pb-footer-grid">
      <div class="pb-footer-brand">
        <a href="#" class="pb-nav-logo" style="font-size:1rem">pathbright</a>
        <p>トラックドライバーのための<br>カーアクセサリーブランド</p>
      </div>
      <div class="pb-footer-col">
        <h4>Products</h4>
        <a href="#">シートクッション</a>
        <a href="#">寝台マットレス</a>
        <a href="#">Coming Soon</a>
      </div>
      <div class="pb-footer-col">
        <h4>Company</h4>
        <a href="#">ブランドについて</a>
        <a href="#">お問い合わせ</a>
        <a href="#">特定商取引法</a>
      </div>
      <div class="pb-footer-col">
        <h4>Follow Us</h4>
        <a href="https://lin.ee/jnDevDi" target="_blank" rel="noopener noreferrer">公式LINE</a>
        <a href="https://www.instagram.com/?locale=ja_JP" target="_blank" rel="noopener noreferrer">Instagram</a>
      </div>
    </div>
    <div class="pb-footer-bottom">
      <p>&copy;
        <?php echo date('Y'); ?> pathbright. All rights reserved.
      </p>
      <p>Truck Driver's Comfort Brand</p>
    </div>
  </footer>

  <script>
    window.addEventListener('scroll', function () {
      document.getElementById('pbNavbar').clagle('scrolled', window.scrollY > 80);
    });
    // Mobile nav
    function pbToggleMobile() { document.getElementById('pbMobileNav').classList.toggle('open') }
    function pbCloseMobile() { document.getElementById('pbMobileNav').classList.remove('open') }
    // Scroll reveal
    var pbObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); pbObs.unobserve(e.target) } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.pb-reveal').forEach(function (el) { pbObs.observe(el) });
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var t = document.querySelector(this.getAttribute('href'));
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  </script>
  <?php wp_footer(); ?>
</body>

</html>