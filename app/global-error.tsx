"use client";

// Last resort when the root layout itself fails: no providers or styles here,
// so plain inline styles and a short bilingual message
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="uz">
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", color: "#fff", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Nimadir notoʻgʻri ketdi</h1>
          <p style={{ color: "#a1a1aa", marginBottom: 24 }}>Что-то пошло не так. Qaytadan urinib koʻring.</p>
          <button
            onClick={() => (reset(), window.location.reload())}
            style={{ background: "#FFB800", color: "#111", border: 0, borderRadius: 16, padding: "12px 24px", fontWeight: 800, cursor: "pointer" }}
          >
            Qayta urinish
          </button>
        </div>
      </body>
    </html>
  );
}
