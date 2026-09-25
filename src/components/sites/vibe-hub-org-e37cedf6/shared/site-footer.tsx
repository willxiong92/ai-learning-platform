// 页脚渠道：只留个人站一个入口，联系方式统一走个人站（2026-09-25 Will 裁决 V3 D4）。
// 邮箱、X、小红书已去掉：个人站规定只通过 GitHub 联系，两站口径要一致。
const SOCIALS = [
  {
    key: "website",
    href: "https://will-in-practice.willxiong92.chatgpt.site/",
    icon: <i className="ti ti-user" aria-hidden="true" />,
    title: "will",
    sub: "个人主页",
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
