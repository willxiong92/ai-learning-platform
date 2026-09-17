// Exact theme palette + localStorage keys ported from vibe-hub.org's inline
// FOUC-prevention script (see THEME_INIT_SCRIPT in layout.tsx).

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

export const THEMES: ThemeDef[] = [
  { id: "klein", label: "克莱因蓝", brand: "#3559d8", brandHover: "#2a46b4", darkBrand: "#7b93ea" },
  { id: "violet", label: "紫罗兰", brand: "#7c3aed", brandHover: "#6d28d9", darkBrand: "#a78bfa" },
  { id: "teal", label: "青绿", brand: "#0f766e", brandHover: "#115e59", darkBrand: "#2dd4bf" },
  { id: "amber", label: "琥珀", brand: "#c2410c", brandHover: "#9a3412", darkBrand: "#fb923c" },
  { id: "rose", label: "玫瑰", brand: "#e11d48", brandHover: "#be123c", darkBrand: "#fb7185" },
  { id: "pink", label: "粉色", brand: "#db2777", brandHover: "#be185d", darkBrand: "#f472b6" },
  { id: "yellow", label: "黄色", brand: "#b45309", brandHover: "#92400e", darkBrand: "#fbbf24" },
  { id: "zinc", label: "锌灰", brand: "#525963", brandHover: "#414751", darkBrand: "#b7bec9" },
];

export const DEFAULT_THEME_ID = "klein";

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
