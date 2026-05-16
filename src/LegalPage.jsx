import { useState } from "react";

const T = {
  accent: "#E8593C",
  accentDim: "rgba(232,89,60,0.12)",
  bg: "#0B0B0F",
  card: "#141419",
  border: "rgba(255,255,255,0.06)",
  text: "#F0F0F5",
  textMuted: "#8888A0",
  textDim: "#555568",
  radius: 14,
  radiusSm: 10,
  font: "'DM Sans', system-ui, sans-serif",
  fontDisplay: "'Playfair Display', Georgia, serif",
};

const cguContent = [
  { title: "Article 1 - Definitions", text: "La Plateforme designe le site web fotokash.com et l'ensemble des services associes. L'Editeur designe la societe ou l'entite exploitant FotoKash, sise a Abidjan, Cote d'Ivoire. Le Photographe designe tout professionnel inscrit sur la Plateforme. L'Invite ou Client designe toute personne accedant a la Plateforme pour rechercher, visualiser ou acheter des photos. Les Donnees faciales designent la representation mathematique (vecteur numerique) extraite du visage de l'Invite." },
  { title: "Article 2 - Objet", text: "La Plateforme permet aux Photographes d'uploader, gerer et vendre leurs photos d'evenements. Elle permet aux Invites de retrouver les photos sur lesquelles ils apparaissent grace a la reconnaissance faciale. Elle facilite les transactions via Mobile Money (Orange Money, MTN MoMo, Wave)." },
  { title: "Article 3 - Inscription et compte Photographe", text: "L'inscription est reservee aux personnes exercant une activite de photographie. Le Photographe fournit des informations exactes. Tout nouveau compte est soumis a validation par l'administrateur. Le Photographe est responsable de la confidentialite de ses identifiants." },
  { title: "Article 4 - Propriete intellectuelle", text: "Le Photographe reste le proprietaire exclusif de ses photos. En uploadant, il accorde a FotoKash une licence non exclusive et limitee pour stocker, generer des miniatures, filigraner et livrer les photos. L'Invite recoit une licence d'utilisation personnelle, non commerciale et non transferable. Toute personne peut demander le retrait de sa photo sous 72 heures." },
  { title: "Article 5 - Reconnaissance faciale", text: "FotoKash utilise la technologie ArcFace/InsightFace. Le selfie est supprime immediatement apres extraction de l'embedding facial. Les embeddings sont des vecteurs mathematiques qui ne permettent pas de reconstruire un visage. Le consentement est recueilli avant chaque selfie. Les donnees faciales ne sont jamais partagees avec des tiers." },
  { title: "Article 6 - Conditions de vente", text: "Tarifs : 1 photo = 200 FCFA, 6 photos = 500 FCFA, 10+ photos = 1 000 FCFA. Paiements via Orange Money, MTN MoMo ou Wave. Commissions : Plan PRO = 15%, Plan BUSINESS = 10%, Plan FREE = gratuit. Le droit de retractation ne s'applique pas aux contenus numeriques telecharges." },
  { title: "Article 7 - Obligations du Photographe", text: "Le Photographe s'engage a disposer des droits sur ses photos, ne pas uploader de contenus illicites, respecter le droit a l'image, traiter les demandes de retrait sous 72 heures, ne pas utiliser la Plateforme a des fins frauduleuses." },
  { title: "Article 8 - Obligations de l'Invite", text: "L'Invite s'engage a utiliser le selfie uniquement pour retrouver ses propres photos, ne pas tenter d'acceder aux photos d'autres personnes, ne pas redistribuer ou revendre les photos obtenues." },
  { title: "Article 9 - Responsabilite", text: "L'Editeur n'est pas responsable des interruptions de service, de la qualite des photos, des erreurs de reconnaissance faciale, ni des dysfonctionnements des services Mobile Money. Le Photographe est seul responsable de ses contenus. La responsabilite de l'Editeur est limitee aux sommes versees au cours des 12 derniers mois." },
  { title: "Article 10 - Protection des donnees", text: "L'Editeur traite les donnees conformement a la legislation ivoirienne et au RGPD. Donnees collectees : Photographes (nom, email, telephone), Invites (selfie temporaire, embedding facial, telephone pour paiement), Photos (images, metadonnees, embeddings)." },
  { title: "Article 11 - Suspension et resiliation", text: "L'Editeur peut suspendre tout compte en cas de violation des CGU. Le Photographe peut resilier a tout moment. La resiliation entraine la suppression des donnees sous 30 jours." },
  { title: "Article 12 - Droit applicable", text: "Les presentes CGU/CGV sont regies par le droit ivoirien. Tout litige sera soumis aux tribunaux d'Abidjan, Cote d'Ivoire." },
];

const confidentialiteContent = [
  { title: "Article 1 - Responsable du traitement", text: "Le responsable du traitement est FotoKash, base a Abidjan, Cote d'Ivoire. Site web : fotokash.com." },
  { title: "Article 2 - Donnees collectees", text: "Photographes : nom, email, telephone, mot de passe (chiffre). Invites : selfie (temporaire), embedding facial (biometrique), numero de telephone (paiement). Photos : images, metadonnees EXIF, embeddings des visages detectes." },
  { title: "Article 3 - Reconnaissance faciale", text: "Technologie de reconnaissance faciale fonctionnant localement sur nos serveurs. Le selfie est supprime immediatement apres extraction. L'embedding est un vecteur de 512 nombres - il est impossible de reconstruire un visage. Aucune donnee faciale n'est envoyee a des services IA externes (Google, Amazon, Microsoft, etc.)." },
  { title: "Article 4 - Finalites du traitement", text: "Gestion des comptes (base : contrat). Reconnaissance faciale (base : consentement explicite). Paiement Mobile Money (base : contrat). Statistiques anonymisees (base : interet legitime). Securite de la Plateforme (base : interet legitime)." },
  { title: "Article 5 - Duree de conservation", text: "Selfie : supprime IMMEDIATEMENT. Embedding visiteur (Mode Live) : 3 jours maximum. Embeddings des photos : duree de vie de la photo. Compte Photographe : duree d'utilisation + 30 jours. Donnees de paiement : 5 ans (obligation legale). Logs de connexion : 6 mois." },
  { title: "Article 6 - Securite des donnees", text: "Chiffrement SSL/TLS. Mots de passe hashes (bcrypt). Authentification JWT. Pare-feu Nginx. Rate limiting. Acces serveur par cles SSH. Sauvegardes regulieres. IA 100% locale - aucune donnee faciale ne quitte nos serveurs." },
  { title: "Article 7 - Vos droits", text: "Droit d'acces, de rectification, de suppression, d'opposition, de limitation, de retrait du consentement, de portabilite. Pour exercer vos droits, contactez-nous. Delai de reponse : 30 jours maximum." },
  { title: "Article 8 - Droit a l'image", text: "Toute personne peut demander le retrait de sa photo en contactant le Photographe via WhatsApp. Delai de traitement : 72 heures. Si le Photographe ne repond pas, contactez directement FotoKash." },
  { title: "Article 9 - Cookies", text: "Token JWT pour la session des Photographes. Aucun cookie tiers. Aucun pixel de suivi. Pas de Google Analytics ni Facebook Pixel. Les Invites n'ont aucun cookie apres leur visite." },
  { title: "Article 10 - Protection des mineurs", text: "La Plateforme n'est pas destinee aux moins de 16 ans. Les Photographes sont responsables d'obtenir le consentement parental pour les photos d'enfants." },
];

export default function LegalPage({ tab: initialTab, onNavigate }) {
  const [tab, setTab] = useState(initialTab || "cgu");
  const content = tab === "cgu" ? cguContent : confidentialiteContent;
  const title = tab === "cgu" ? "Conditions Generales d'Utilisation et de Vente" : "Politique de Confidentialite";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text }}>
      <header style={{ padding: "16px 24px", borderBottom: "1px solid " + T.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div onClick={() => onNavigate("landing")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>FK</div>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700 }}>Foto<span style={{ color: T.accent }}>Kash</span></span>
        </div>
        <button onClick={() => onNavigate("landing")} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 7, padding: "8px 16px", color: T.textMuted, cursor: "pointer", fontSize: 13, fontFamily: T.font }}>Retour</button>
      </header>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", background: T.card, borderRadius: T.radiusSm, padding: 3, marginBottom: 32 }}>
          {[{ id: "cgu", label: "CGU / CGV" }, { id: "confidentialite", label: "Politique de confidentialite" }].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "12px 0", borderRadius: 8, border: "none",
              background: tab === t.id ? T.accent : "transparent",
              color: tab === t.id ? "#fff" : T.textMuted,
              fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font,
            }}>{t.label}</button>
          ))}
        </div>

        <h1 style={{ fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{title}</h1>
        <p style={{ color: T.textDim, fontSize: 12, marginBottom: 32 }}>Derniere mise a jour : 15 mai 2026</p>

        {content.map((section, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: T.accent, marginBottom: 8 }}>{section.title}</h2>
            <p style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.7 }}>{section.text}</p>
          </div>
        ))}

        <div style={{ textAlign: "center", marginTop: 40, padding: "20px 0", borderTop: "1px solid " + T.border }}>
          <p style={{ color: T.textDim, fontSize: 12 }}>FotoKash - fotokash.com - Abidjan, Cote d'Ivoire</p>
        </div>
      </div>
    </div>
  );
}
