// 页脚渠道：版式沿用原站，作者换成 will（2026-09-19）。
// href 留空的渠道暂不可点；拿到真实地址后填进 href，并把 sub 换成账号名。
const SOCIALS = [
  {
    key: "website",
    href: "",
    icon: <i className="ti ti-user" aria-hidden="true" />,
    title: "will",
    sub: "个人主页待补充",
  },
  {
    key: "github",
    href: "https://github.com/willxiong92",
    icon: <i className="ti ti-brand-github" aria-hidden="true" />,
    title: "GitHub",
    sub: "@willxiong92",
  },
  {
    key: "x",
    href: "https://x.com/willxiong92",
    icon: <i className="ti ti-brand-x" aria-hidden="true" />,
    title: "X",
    sub: "x.com/willxiong92",
  },
  {
    key: "xiaohongshu",
    href: "",
    icon: <b className="footer-social-glyph">RED</b>,
    title: "小红书",
    sub: "will 的小红书主页",
  },
  {
    key: "email",
    href: "mailto:willxiong92@gmail.com",
    icon: <i className="ti ti-mail" aria-hidden="true" />,
    title: "Email",
    sub: "willxiong92@gmail.com",
  },
];

// 术语投稿表单地址待补充（原站指向原作者的飞书表单，已去掉）
const CONTRIBUTE_HREF = "";

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div className="site-footer-shell">
        <div className="site-footer-content">
          <div className="footer-wordmark" aria-hidden="true">
            will
          </div>
          <nav className="footer-socials" aria-label="联系方式和投稿">
            {SOCIALS.map((s, i) => (
              <a
                key={s.key}
                className="footer-social-link"
                data-social={s.key}
                href={s.href || undefined}
                target={s.href ? "_blank" : undefined}
                rel={s.href ? "noreferrer" : undefined}
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
              href={CONTRIBUTE_HREF || undefined}
              target={CONTRIBUTE_HREF ? "_blank" : undefined}
              rel={CONTRIBUTE_HREF ? "noreferrer" : undefined}
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
