import logoSrc from "@/assets/econology-logo.png";

const EconologyLogo = ({ size = 64 }: { size?: number }) => {
  return (
    <img
      src={logoSrc}
      alt="Econology logo"
      width={size}
      height={size}
      className="shrink-0 object-contain"
    />
  );
};

export default EconologyLogo;
