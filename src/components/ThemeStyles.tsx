import { themeToCssVars } from "@/lib/theme";
import type { ThemeColors } from "@/lib/types";

export function ThemeStyles({ theme }: { theme: ThemeColors }) {
  const vars = themeToCssVars(theme);
  const css = `:root{${Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")}}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
