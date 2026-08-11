export default function Nav() {
  return (
    <nav>
      <div className="nav-left">
        <div className="nav-mark">
          HT<em>.</em>
        </div>
        <div className="nav-status">
          <span className="blink-dot"></span> Actively Building
        </div>
      </div>
      <ul className="nav-pills">
        <li>
          <a href="#about">about</a>
        </li>
        <li>
          <a href="#projects">projects</a>
        </li>
        <li>
          <a href="#skills">skills</a>
        </li>
        <li>
          <a href="#certs">certs</a>
        </li>
        <li>
          <a href="#contact">contact</a>
        </li>
      </ul>
    </nav>
  );
}
