const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');

// Chercher la fonction Dashboard et ajouter un bouton "Changer mot de passe" dans le header
// Trouver le bouton Deconnexion dans le header du Dashboard
let logoutIdx = c.indexOf('Deconnexion');
if (logoutIdx === -1) logoutIdx = c.indexOf('connexion');

// Approche: ajouter un onglet "Compte" dans les tabs du dashboard
let tabsIdx = c.indexOf('"events", label: "');
if (tabsIdx === -1) {
  // Chercher autrement
  let idx = c.indexOf('vnements');
  if (idx !== -1) {
    let lineStart = c.lastIndexOf('\n', idx);
    console.log('Found events tab near:', c.substring(lineStart, lineStart + 80).trim());
  }
}

// Chercher le tableau des tabs
let tabArrayStart = c.indexOf('const tabs = [');
if (tabArrayStart !== -1) {
  let tabArrayEnd = c.indexOf('];', tabArrayStart);
  let oldTabs = c.substring(tabArrayStart, tabArrayEnd + 2);
  console.log('Found tabs:', oldTabs.substring(0, 100));
  
  // Ajouter un onglet Compte
  let newTabs = oldTabs.replace('];', '    { id: "account", label: "Mon compte", icon: Icon.Users(16) },\n  ];');
  c = c.replace(oldTabs, newTabs);
  console.log('Tab added');
}

// Ajouter le rendu du tab account dans le contenu
let tabContent = c.indexOf('{tab === "events"');
if (tabContent !== -1) {
  let endOfEvents = c.indexOf('}\n', tabContent);
  // Chercher la fin du bloc events
  let eventsLine = c.indexOf('<EventsTab', tabContent);
  let eventsEnd = c.indexOf('/>', eventsLine) + 2;
  let afterEvents = c.indexOf('}', eventsEnd);
  
  // Insérer après le bloc events
  let insertPoint = afterEvents + 1;
  let accountTab = `
        {tab === "account" && <AccountTab token={token} />}`;
  c = c.substring(0, insertPoint) + accountTab + c.substring(insertPoint);
  console.log('Account tab render added');
}

// Ajouter le composant AccountTab avant la fonction Dashboard
let dashboardIdx = c.indexOf('function Dashboard(');
if (dashboardIdx !== -1) {
  let accountComponent = `
function AccountTab({ token }) {
  var currentPwd = "";
  var newPwd = "";
  var confirmPwd = "";
  var msgEl = null;
  
  function handleChange() {
    currentPwd = document.getElementById("fk-current-pwd").value;
    newPwd = document.getElementById("fk-new-pwd").value;
    confirmPwd = document.getElementById("fk-confirm-pwd").value;
    msgEl = document.getElementById("fk-pwd-msg");
    
    if (!currentPwd || !newPwd || !confirmPwd) {
      msgEl.textContent = "Remplissez tous les champs.";
      msgEl.style.color = T.red;
      return;
    }
    if (newPwd.length < 6) {
      msgEl.textContent = "Le nouveau mot de passe doit faire au moins 6 caracteres.";
      msgEl.style.color = T.red;
      return;
    }
    if (newPwd !== confirmPwd) {
      msgEl.textContent = "Les mots de passe ne correspondent pas.";
      msgEl.style.color = T.red;
      return;
    }
    
    msgEl.textContent = "Modification en cours...";
    msgEl.style.color = T.textMuted;
    
    fetch(API + "/auth/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ current_password: currentPwd, new_password: newPwd }),
    })
    .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, data: d }; }); })
    .then(function(res) {
      if (res.ok) {
        msgEl.textContent = "Mot de passe modifie avec succes !";
        msgEl.style.color = T.green;
        document.getElementById("fk-current-pwd").value = "";
        document.getElementById("fk-new-pwd").value = "";
        document.getElementById("fk-confirm-pwd").value = "";
      } else {
        msgEl.textContent = res.data.error || "Erreur";
        msgEl.style.color = T.red;
      }
    })
    .catch(function() {
      msgEl.textContent = "Erreur de connexion.";
      msgEl.style.color = T.red;
    });
  }

  return (
    <div>
      <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, marginBottom: 24, fontWeight: 700 }}>Mon compte</h2>
      <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "28px 24px", maxWidth: 450 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Changer le mot de passe</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Mot de passe actuel</label>
          <input id="fk-current-pwd" type="password" placeholder="Votre mot de passe actuel" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Nouveau mot de passe</label>
          <input id="fk-new-pwd" type="password" placeholder="Minimum 6 caracteres" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Confirmer le nouveau mot de passe</label>
          <input id="fk-confirm-pwd" type="password" placeholder="Retapez le nouveau mot de passe" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <p id="fk-pwd-msg" style={{ fontSize: 13, marginBottom: 16, minHeight: 20 }}></p>
        <button onClick={handleChange} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: T.radiusSm, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>Modifier le mot de passe</button>
      </div>
    </div>
  );
}

`;
  c = c.substring(0, dashboardIdx) + accountComponent + c.substring(dashboardIdx);
  console.log('AccountTab component added');
}

fs.writeFileSync(path, c, 'utf8');
console.log('Done');
