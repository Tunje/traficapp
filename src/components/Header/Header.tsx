import logoImage from "/public/TLT-Logo.png";

export const Header = () => {
  return (
    <div className="logo-container">
      <img src={logoImage} alt="Logo" className="logo" />
    </div>
  );
};
