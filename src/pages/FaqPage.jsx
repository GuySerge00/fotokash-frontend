import { useEffect, useState } from "react";

const faqs = [
  {
    category: "Pour les clients",
    items: [
      {
        q: "Comment retrouver mes photos avec FotoKash ?",
        a: "Scannez le QR code de l'evenement ou ouvrez le lien partage par votre photographe. Prenez un selfie via votre navigateur, et FotoKash detecte automatiquement toutes vos photos dans la galerie en quelques secondes. Aucune application a installer.",
      },
      {
        q: "Est-ce que j'ai besoin de creer un compte ?",
        a: "Non. Aucun compte n'est requis pour retrouver et acheter vos photos. Il suffit du lien ou du QR code partage par votre photographe.",
      },
      {
        q: "Comment telecharger mes photos sur iPhone ?",
        a: "Apres paiement, appuyez sur Telecharger. Sur iPhone, une fenetre de partage native s'ouvre automatiquement — choisissez Enregistrer l'image pour sauvegarder directement dans votre Pellicule en haute definition.",
      },
      {
        q: "Quels sont les tarifs pour telecharger mes photos ?",
        a: "1 photo = 200 FCFA · 3 photos = 500 FCFA · 5 photos et plus = 1 000 FCFA. Le paiement se fait par Mobile Money (Orange Money, Wave, MTN).",
      },
      {
        q: "La reconnaissance faciale fonctionne-t-elle si je porte des lunettes ?",
        a: "La reconnaissance faciale fonctionne mieux avec un visage bien visible et un bon eclairage. Les lunettes de vue standard ne posent generalement pas de probleme.",
      },
      {
        q: "Que faire si je ne trouve pas mes photos ?",
        a: "Essayez de reprendre un selfie dans un meilleur eclairage, face a la camera. Si le probleme persiste, contactez votre photographe directement.",
      },
    ],
  },
  {
    category: "Confidentialite et donnees",
    items: [
      {
        q: "Mes donnees biometriques sont-elles conservees ?",
        a: "Non. Les donnees de visage des visiteurs sont supprimees automatiquement apres 3 jours. Elles ne sont jamais partagees avec des tiers.",
      },
      {
        q: "Mes photos sont-elles accessibles par d'autres personnes ?",
        a: "Non. Chaque galerie est accessible uniquement via un lien prive partage par le photographe. La reconnaissance faciale vous montre uniquement les photos ou vous apparaissez.",
      },
      {
        q: "FotoKash vend-il mes donnees personnelles ?",
        a: "Non. FotoKash ne vend jamais vos donnees personnelles ou biometriques. Consultez notre politique de confidentialite pour plus de details.",
      },
    ],
  },
  {
    category: "Pour les photographes",
    items: [
      {
        q: "Comment proposer FotoKash a mes clients ?",
        a: "Creez un compte photographe, uploadez vos photos apres l'evenement, et partagez le lien ou QR code a vos clients. La reconnaissance faciale est automatique.",
      },
      {
        q: "Quels sont les plans disponibles ?",
        a: "FotoKash propose trois plans : Free (gratuit), Pro (5 000 FCFA/mois) et Business (10 000 FCFA/mois). Les details sont disponibles sur la page Tarifs.",
      },
      {
        q: "Comment je recois mes revenus ?",
        a: "Vos revenus sont disponibles dans votre tableau de bord sous l'onglet Revenus. Vous pouvez demander un retrait a partir de 1 000 FCFA, transfere sur votre compte Mobile Money.",
      },
      {
        q: "Combien de temps mes evenements sont-ils conserves ?",
        a: "Plan Free : 15 jours · Plan Pro : 30 jours · Plan Business : conservation illimitee. Vous recevez une notification quand un evenement approche de sa date d'expiration.",
      },
    ],
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: open ? "#16161F" : "transparent", borderRadius: 8, border: "1px solid", borderColor: open ? "#2A2A3A" : "#1E1E2A", overflow: "hidden", transition: "all 0.2s" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", background: "none", border: "none", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 16, textAlign: "left" }}
      >
        <span style={{ fontSize: 15, fontWeight: 500, color: "#F5F4F0", lineHeight: 1.4 }}>{q}</span>
        <span style={{ color: "#E8593C", fontSize: 20, flexShrink: 0, transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>+</span>
      </button>
      {open && (
        <div style={{ padding: "0 20px 18px", fontSize: 14, color: "#8A8A9A", lineHeight: 1.8 }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function FaqPage({ navigate }) {
  useEffect(() => {
    document.title = "FAQ — Questions frequentes · FotoKash";
    let desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Retrouvez les reponses aux questions frequentes sur FotoKash : comment retrouver ses photos, confidentialite, tarifs, telechargement iPhone.");
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = "https://www.fotokash.com/faq";

    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.id = "faq-schema";
    schema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.flatMap(cat =>
        cat.items.map(item => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": { "@type": "Answer", "text": item.a },
        }))
      ),
    });
    document.head.appendChild(schema);
    return () => {
      const s = document.getElementById("faq-schema");
      if (s) s.remove();
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D14", color: "#F5F4F0", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "60px 24px 80px" }}>
        <button
          onClick={() => navigate && navigate("landing")}
          style={{ background: "none", border: "none", color: "#8A8A9A", cursor: "pointer", fontSize: 14, marginBottom: 40, padding: 0, display: "flex", alignItems: "center", gap: 6 }}
        >
          ← Retour à l'accueil
        </button>
        <div style={{ marginBottom: 56 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", color: "#E8593C", textTransform: "uppercase" }}>Centre d'aide</span>
          <h1 style={{ fontSize: 42, fontWeight: 700, margin: "12px 0 16px", lineHeight: 1.2 }}>Questions frequentes</h1>
          <p style={{ fontSize: 17, color: "#8A8A9A", lineHeight: 1.7, margin: 0 }}>
            Tout ce que vous devez savoir sur FotoKash, pour les clients et les photographes.
          </p>
        </div>
        {faqs.map((section, si) => (
          <div key={si} style={{ marginBottom: 52 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", color: "#E8593C", textTransform: "uppercase", marginBottom: 20 }}>
              {section.category}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {section.items.map((item, ii) => (
                <FaqItem key={ii} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
        <div style={{ marginTop: 64, padding: "32px", background: "#16161F", borderRadius: 12, border: "1px solid #2A2A3A", textAlign: "center" }}>
          <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>Vous n'avez pas trouve votre reponse ?</p>
          <p style={{ fontSize: 14, color: "#8A8A9A", margin: "0 0 20px" }}>Notre equipe est disponible pour vous aider.</p>
          
          <a
            href="mailto:gserge26@gmail.com"
            style={{ display: "inline-block", background: "#E8593C", color: "#fff", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}
          >
            Contacter le support
          </a>
        </div>
      </div>
    </div>
  );
}
