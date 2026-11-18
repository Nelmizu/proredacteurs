<?php
// Prorédacteurs Académiques : réception des demandes de devis et envoi par e-mail.
// Fonctionne sur un hébergement PHP classique (aucune dépendance à installer).
// Le destinataire est fixé ci-dessous. Ne mettez aucun mot de passe dans ce fichier.

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const DESTINATAIRE = 'contact@proredacteurs.fr';
const EXPEDITEUR   = 'contact@proredacteurs.fr'; // doit être une adresse de votre domaine, pour que l'envoi ne soit pas classé comme spam

function repondre(int $code, bool $ok, string $message = ''): void {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    repondre(405, false, 'Méthode non autorisée');
}

// Champ piège anti-robots : doit rester vide. Un robot le remplit, on fait semblant de réussir.
if (!empty($_POST['website'])) {
    repondre(200, true, 'Merci pour votre demande.');
}

// Nettoyage : on supprime les retours à la ligne (évite l'injection d'en-têtes dans l'e-mail)
function nettoyer(string $v, int $max = 2000): string {
    $v = str_replace(["\r", "\n"], ' ', $v);
    return mb_substr(trim($v), 0, $max, 'UTF-8');
}

$nom   = nettoyer($_POST['nom'] ?? $_POST['name'] ?? '', 120);
$email = nettoyer($_POST['email'] ?? '', 160);
$tel   = nettoyer($_POST['telephone'] ?? $_POST['phone'] ?? '', 40);

if ($nom === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    repondre(400, false, 'Nom ou adresse e-mail invalide.');
}

// Corps du message : chaque champ envoyé par le formulaire
$lignes = [];
foreach ($_POST as $cle => $valeur) {
    if ($cle === 'website' || is_array($valeur)) continue;
    $lignes[] = $cle . ' : ' . nettoyer((string)$valeur);
}
$corps = "Nouvelle demande de devis reçue depuis le site.\n\n" . implode("\n", $lignes) . "\n";

$sujet = mb_encode_mimeheader('Nouvelle demande de devis : ' . $nom, 'UTF-8');
$entetes  = 'From: Site Prorédacteurs <' . EXPEDITEUR . ">\r\n";
$entetes .= 'Reply-To: ' . $email . "\r\n";
$entetes .= "Content-Type: text/plain; charset=UTF-8\r\n";
$entetes .= "X-Mailer: PHP\r\n";

if (mail(DESTINATAIRE, $sujet, $corps, $entetes)) {
    repondre(200, true, 'Merci pour votre demande. Notre équipe a bien reçu vos informations.');
}
error_log('Prorédacteurs : envoi du formulaire impossible');
repondre(500, false, 'Envoi impossible pour le moment.');
