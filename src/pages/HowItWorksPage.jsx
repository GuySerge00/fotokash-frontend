import { useEffect } from "react";

const steps = [
  {
    num: "01",
    title: "Scannez le QR code de l'evenement",
    desc: "Votre photographe affiche un QR code sur place ou partage un lien apres l'evenement. Scannez-le avec votre telephone pour acceder a la galerie privee — aucune application a installer, tout se passe dans votre navigateur.",
    detail: "Compatible iPhone, Android, et tous les navigateurs modernes.",
  },
  {
    num: "02",
    title: "Prenez un selfie",
    desc: "Autorisez l'acces a votre camera et prenez un selfie face a l'objectif, dans un endroit bien eclaire. FotoKash analyse votre visage en quelques secondes et recherche vos correspondances dans toute la galerie.",
    detail: "Vos donnees biometriques sont supprimees automatiquement apres 3 jours.",
  },
  {
    num: "03",
    title: "Vos photos apparaissent",
    desc: "Toutes les photos ou vous apparaissez sont affichees instantanement. Vous pouvez les consulter gratuitement, zoomer, et choisir celles que vous souhaitez telecharger en haute definition.",
    detail: "La reconnaissance faciale fonctionne meme avec des lunettes ou dans un environnement anime.",
  },
  {
    num: "04",
    title: "Payez et telechargez en HD",
    desc: "Selectionnez une ou plusieurs photos et payez par Mobile Money (Orange Money, Wave, MTN). Le telechargement HD est disponible immediatement apres paiement, sur Android comme sur iPhone.",
    detail: "1 photo = 200 FCFA · 3 photos = 500 FCFA · 5 photos et plus = 1 000 FCFA.",
  },
];

const faqs_mini = [
  { q: "Faut-il creer un compte ?", a: "Non, aucun compte requis pour les clients." },
  { q: "Ca marche sur iPhone ?", a: "Oui, y compris le telechargement direct dans la Pellicule." },
  { q: "Mes donnees sont-elles protegees ?", a: "Oui, les donnees de visage sont supprimees apres 3 jours." },
  { q: "Quels operateurs Mobile Money sont acceptes ?", a: "Orange Money, Wave et MTN Money." },
];

export default function HowItWorksPage({ navigate }) {
  useEffect(() => {
    document.title = "Comment ca marche — FotoKash";
    let desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Decouvrez comment retrouver vos photos d'evenement avec FotoKash en 4 etapes simples : QR code, selfie, reconnaissance faciale et telechargement HD par Mobile Money.");
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = "https://www.fotokash.com/comment-ca-marche";

    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.id = "howto-schema";
    schema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "Comment retrouver ses photos d'evenement avec FotoKash",
      "description": "Retrouvez vos photos d'evenement en 4 etapes grace a la reconnaissance faciale.",
      "totalTime": "PT2M",
      "step": steps.map((s, i) => ({
        "@type": "HowToStep",
        "position": i + 1,
        "name": s.title,
        "text": s.desc,
      })),
    });
    document.head.appendChild(schema);
    return () => {
      const s = document.getElementById("howto-schema");
      if (s) s.remove();
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D14", color: "#F5F4F0", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px 80px" }}>

        {/* Back */}
        <button
          onClick={() => navigate && navigate("landing")}
          style={{ background: "none", border: "none", color: "#8A8A9A", cursor: "pointer", fontSize: 14, marginBottom: 40, padding: 0, display: "flex", alignItems: "center", gap: 6 }}
        >
          {String.fromCharCode(8592)} Retour a l'accueil
        </button>

        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", color: "#E8593C", textTransform: "uppercase" }}>Guide</span>
          <h1 style={{ fontSize: 42, fontWeight: 700, margin: "12px 0 16px", lineHeight: 1.2 }}>Comment ca marche ?</h1>
          <p style={{ fontSize: 17, color: "#8A8A9A", lineHeight: 1.7, margin: 0 }}>
            Retrouvez toutes vos photos d'evenement en moins de 2 minutes, sans application, sans compte.
          </p>
        </div>

        {/* Steps */}
        <div style={{ marginBottom: 72 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 28, marginBottom: 48, position: "relative" }}>
              {/* Left: number + line */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: i === 0 ? "#E8593C" : "#16161F",
                  border: i === 0 ? "none" : "1px solid #2A2A3A",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 700,
                  color: i === 0 ? "#fff" : "#E8593C",
                  flexShrink: 0,
                }}>
                  {step.num}
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: 1, flex: 1, background: "#2A2A3A", marginTop: 8, minHeight: 40 }} />
                )}
              </div>
              {/* Right: content */}
              <div style={{ paddingTop: 12, paddingBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 12px", color: "#F5F4F0" }}>{step.title}</h2>
                <p style={{ fontSize: 15, color: "#8A8A9A", lineHeight: 1.8, margin: "0 0 10px" }}>{step.desc}</p>
                <span style={{
                  display: "inline-block", fontSize: 12, color: "#E8593C",
                  background: "#1E1218", border: "1px solid #3A1A20",
                  borderRadius: 6, padding: "4px 10px"
                }}>
                  {step.detail}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Mini FAQ */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", color: "#E8593C", textTransform: "uppercase", marginBottom: 20 }}>
            Questions rapides
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
            {faqs_mini.map((f, i) => (
              <div key={i} style={{ background: "#16161F", borderRadius: 10, border: "1px solid #2A2A3A", padding: "16px 18px" }}>
                <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: "#F5F4F0" }}>{f.q}</p>
                <p style={{ fontSize: 13, color: "#8A8A9A", margin: 0, lineHeight: 1.6 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: "#16161F", borderRadius: 12, border: "1px solid #2A2A3A", padding: "36px 32px", textAlign: "center" }}>
          <p style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Pret a retrouver vos photos ?</p>
          <p style={{ fontSize: 14, color: "#8A8A9A", margin: "0 0 24px" }}>Demandez le lien ou le QR code a votre photographe.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate && navigate("faq")}
              style={{ background: "none", border: "1px solid #2A2A3A", color: "#8A8A9A", padding: "12px 24px", borderRadius: 8, fontSize: 14, cursor: "pointer" }}
            >
              Voir la FAQ
            </button>
            <button
              onClick={() => navigate && navigate("auth", { mode: "signup" })}
              style={{ background: "#E8593C", border: "none", color: "#fff", padding: "12px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Je suis photographe
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
