"use client";

export default function Modal({ cert, onClose }) {
  return (
    <div className={`modal-wrap${cert ? " open" : ""}`} id="mw" onClick={(e) => e.target.id === "mw" && onClose()}>
      <div className="modal-box">
        <button className="modal-x" onClick={onClose}>
          ✕
        </button>
        {cert && (
          <div id="mb">
            <div className="modal-from">{cert.from}</div>
            <div className="modal-title">{cert.title}</div>
            <p className="modal-desc">{cert.desc}</p>
            <div className="modal-grid">
              <div className="modal-kv">
                <div className="modal-k">Issued</div>
                <div className="modal-v">{cert.date}</div>
              </div>
              <div className="modal-kv">
                <div className="modal-k">Format</div>
                <div className="modal-v">{cert.duration}</div>
              </div>
              <div className="modal-kv" style={{ gridColumn: "1/-1" }}>
                <div className="modal-k">Certificate ID</div>
                <div className="modal-v">{cert.id}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
