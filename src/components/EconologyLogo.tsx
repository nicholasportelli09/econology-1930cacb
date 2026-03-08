import { memo } from "react";
import logoSrc from "@/assets/econology-logo.png";

const EconologyLogo = memo(({ size = 64 }: { size?: number }) => {
  return (
    <img
      src={logoSrc}
      alt="Econology logo"
      width={size}
      height={size}
      className="shrink-0 object-contain"
      loading="eager"
    />
  );
});

EconologyLogo.displayName = "EconologyLogo";

export default EconologyLogo;
