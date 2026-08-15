import Link from "next/link";

type ActivePage = "home" | "graphic" | "photo";

export function SiteHeader({ active }: { active: ActivePage }) {
  return (
    <header className="site-header">
      <Link className="header-logo" href="/" aria-label="YuLjinG 首页"><img src="/assets/nav-logo.svg" alt="YuLjinG" /></Link>
      <nav aria-label="主导航">
        <Link className={active === "home" ? "is-active" : ""} href="/">首页</Link>
        <Link className={active === "graphic" ? "is-active" : ""} href="/graphic">平面</Link>
        <Link className={active === "photo" ? "is-active" : ""} href="/photo">摄影</Link>
      </nav>
      <Link className="header-contact" href="/?profile=1">个人资料 <b>↗</b></Link>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-title"><h2>Get in Touch</h2><p>联系方式</p></div>
      <div className="footer-details">
        <p>邮箱：<a href="mailto:yuljing0405@163.com">yuljing0405@163.com</a></p>
        <p>电话：<a href="tel:18928378397">18928378397</a></p>
        <p>抖音：渔凉景YuLjinG</p><p>小红书：渔凉景YuLjinG</p>
      </div>
      <p className="footer-vertical">珍惜每一次沟通机会</p>
    </footer>
  );
}
