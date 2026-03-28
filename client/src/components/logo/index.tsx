import { Link } from "react-router-dom";
import logoImage from "@/assets/ChatGPT Image Mar 28, 2026, 10_34_14 PM (1).png";

const Logo = (props: {
  url?: string;
  className?: string;
  imageClassName?: string;
}) => {
  const {
    url = "/",
    className = "flex items-center justify-center sm:justify-start",
    imageClassName = "h-10 w-auto object-contain",
  } = props;

  return (
    <div className={className}>
      <Link to={url} className="inline-flex items-center">
        <img
          src={logoImage}
          alt="Team Sync"
          className={imageClassName}
        />
      </Link>
    </div>
  );
};

export default Logo;
