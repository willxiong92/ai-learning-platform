// Theme palette + localStorage keys used by the FOUC-prevention script
// (see THEME_INIT_SCRIPT in layout.tsx).

export const THEME_STORAGE_KEY = "vibe-guide-theme";
export const COLOR_MODE_STORAGE_KEY = "vibehub-color-mode";
export const FAVORITES_STORAGE_KEY = "vibehub:favorites";

export interface ThemeDef {
  id: string;
  label: string;
  brand: string;
  brandHover: string;
  darkBrand: string;
}

// 界面升级样稿（2026-09-26，docs/REDESIGN.md §2.3）：原站 8 色换成本站自有 4 色，默认明亮蓝。
// 浏览器里存着旧 id（klein、violet…）的用户查不到时自动回到默认色，不需要迁移。
export const THEMES: ThemeDef[] = [
  { id: "ink", label: "明亮蓝", brand: "#0066ff", brandHover: "#0057e0", darkBrand: "#8fb8ff" },
  { id: "pine", label: "松绿", brand: "#2f6b52", brandHover: "#255641", darkBrand: "#86c7a6" },
  { id: "clay", label: "陶土", brand: "#a4502f", brandHover: "#864026", darkBrand: "#e4a07f" },
  { id: "graphite", label: "石墨", brand: "#4a4f57", brandHover: "#3a3e45", darkBrand: "#b9bec6" },
];

export const DEFAULT_THEME_ID = "ink";

/**
 * Runs before hydration so the right theme color + light/dark mode apply on
 * first paint (avoids a flash of the default theme). Mirrors the original
 * site's inline <script> almost verbatim.
 */
export const THEME_INIT_SCRIPT = `(function(){
  var mode=null;
  try{mode=localStorage.getItem(${JSON.stringify(COLOR_MODE_STORAGE_KEY)})}catch(e){}
  if(mode!=="light"&&mode!=="dark"){mode=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}
  document.documentElement.dataset.colorMode=mode;
})();
(function(){
  var id=${JSON.stringify(DEFAULT_THEME_ID)};
  try{id=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})||id}catch(e){}
  var themes=${JSON.stringify(
    Object.fromEntries(
      THEMES.map((t) => [t.id, { "--theme-brand": t.brand, "--theme-brand-hover": t.brandHover, "--theme-dark-brand": t.darkBrand }])
    )
  )};
  var vars=Object.prototype.hasOwnProperty.call(themes,id)?themes[id]:themes[${JSON.stringify(DEFAULT_THEME_ID)}];
  Object.keys(vars).forEach(function(key){document.documentElement.style.setProperty(key,vars[key])});
})();`;
