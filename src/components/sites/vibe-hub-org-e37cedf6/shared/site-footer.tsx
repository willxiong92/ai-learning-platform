const SOCIALS = [
  {
    key: "website",
    href: "https://oiloil.org/",
    icon: <img src="/sites/vibe-hub-org-e37cedf6/shared/images/oil-favicon.png" alt="" width={20} height={20} />,
    title: "oil 欧呦",
    sub: "oiloil.org",
  },
  {
    key: "github",
    href: "https://github.com/oil-oil",
    icon: <i className="ti ti-brand-github" aria-hidden="true" />,
    title: "GitHub",
    sub: "@oil-oil",
  },
  {
    key: "x",
    href: "https://x.com/I_am_oil_oil",
    icon: <i className="ti ti-brand-x" aria-hidden="true" />,
    title: "X",
    sub: "x.com/I_am_oil_oil",
  },
  {
    key: "xiaohongshu",
    href: "https://www.xiaohongshu.com/user/profile/5f4dfecb000000000100571d",
    icon: <b className="footer-social-glyph">RED</b>,
    title: "小红书",
    sub: "oil 的小红书主页",
  },
  {
    key: "email",
    href: "mailto:zhihuang.oiloil@gmail.com",
    icon: <i className="ti ti-mail" aria-hidden="true" />,
    title: "Email",
    sub: "zhihuang.oiloil@gmail.com",
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div className="site-footer-shell">
        <div className="site-footer-content">
          <div className="footer-wordmark" aria-hidden="true">
            oil
          </div>
          <nav className="footer-socials" aria-label="联系方式和投稿">
            {SOCIALS.map((s, i) => (
              <a
                key={s.key}
                className="footer-social-link"
                data-social={s.key}
                href={s.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="footer-social-index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="footer-social-icon" aria-hidden="true">
                  {s.icon}
                </span>
                <span className="footer-social-copy">
                  <strong>{s.title}</strong>
                  <small>{s.sub}</small>
                </span>
                <i className="ti ti-arrow-up-right footer-social-arrow" aria-hidden="true" />
              </a>
            ))}
            <a
              className="footer-social-link footer-contribute-card"
              href="https://my.feishu.cn/share/base/shrcnxcYfvOPpNtF0c1Vv3oBXGb"
              target="_blank"
              rel="noreferrer"
            >
              <span className="footer-social-icon" aria-hidden="true">
                <i className="ti ti-pencil-plus" aria-hidden="true" />
              </span>
              <span className="footer-social-copy">
                <strong>术语投稿</strong>
                <small>提交建议</small>
              </span>
              <i className="ti ti-arrow-up-right footer-social-arrow" aria-hidden="true" />
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
