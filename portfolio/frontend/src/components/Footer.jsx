import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="mono footer-text">
          built by Abu Dujana &middot; {new Date().getFullYear()}
        </span>
        <div className="footer-links">
          <a href="https://github.com/abudujanasvct-rgb" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://tinyurl.com/Abu-dujana" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
