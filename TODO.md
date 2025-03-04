- passkey / webauthn https://github.com/nextauthjs/next-auth-webauthn/blob/main/components/login.tsx
- refresh token https://github.com/nextauthjs/next-auth-refresh-token-example
- route /api/stats
- page /stats (nombre de pages générées, nombre de templates, nombre de startups, nombre de variables, nombre de versions, nombre de startups "completes" => Northstar)
- page /budget (?)
- page /roadmap


## Produit
- [x] https://legal.beta.gouv.fr/startup/carte-verte/politique-confidentialite
- [x] https://legal.beta.gouv.fr/startup/carte-verte/politique-confidentialite.(txt|md|html)
- [x] https://legal.beta.gouv.fr/startup/territoires-en-transitions/aldo/politique-confidentialite.(txt|md|html) (en cas de produit supplémentaire)
- [x] github en backend pour profiter du versionning
### Login
- [x] checker les comptes inactifs

### Editeur
- [ ] hover et auto completion sur les variables
- [x] preview
- [ ] lock avec TTL sur l'édition si une autre personne est en train d'éditer ou éditeur collaboratif (Yjs + monaco https://github.com/yjs/y-monaco)

## Think tank
- [x] github sha as id pour les templates (/template/mentions-legales/[groupId]/[id]/edit ; ex: "/template/mentions-legales/default/a34bcde/edit"
- [ ] "/template/mentions-legales/ademe/ef828ab9/new" pour créer un fichier à partir d'un template) - warning si la version (le sha) n'est pas la dernière
- [x] tout le monde peut créer ou dupliquer un template, mais une fois créé le groupe appartient au créateur et les personnes accordées (droit par personne, par se, ou par incubateur, avec TTL)
- [x] les variables d'un template sont enregistrées dans le frontmatter du fichier markdown
- [x] par défaut, uniquement les admins peuvent editer le groupe "default"
- [x] liste des versions = histo git d'un fichier
- [x] stockage des mappings de variables sur git aussi avec un chemin "/variables/[se]/[variableId]/mention-legales.json" ("variableId" = "default" ou autre chose)
- [ ] possibilité de recover un fichier supprimé (si fonction de suppression)
- [ ] possibilité de rollback à une version précédente (ajout d'une version rollback comme nouvelle version)
- [x] anticiper le fait d'avoir plusieurs mentions legales si plusieurs produit (d'ou le "[variableId]"), sinon "default" par défaut 
- [x] GPG pour les commits
- [x] teardown "db" review app/pr avec github actions

## Navigation
|- Accueil
|- Groupes
|- Templates
|- Liste Startups (avec leurs pages)

### Accueil `/`
- [ ] Présentation
- [ ] Comment ça marche
- [ ] Contact
- Si connecté
  - [ ] Ajouter une nouvelle page légale

### Templates `/template`
- [x] Liste des templates
- [ ] Bouton global pour créer un nouveau template
- [ ] Recherche par nom
- [ ] Filtre par type (mentions légales, politique de confidentialité, etc)
- [ ] Bouton pour dupliquer un template

#### Template
- [x] Nom
- [x] Description
- [x] Type
- [x] Variables
- [x] Version
- [ ] Bouton pour dupliquer `/template/mentions-legales/[groupId]/[id]/duplicate`
**Lecture seule**  `/template/mentions-legales/[groupId]/[id]`
- [ ] Bouton pour éditer
- [ ] Bouton pour créer une page à partir de ce template (`/template/mentions-legales/[groupId]/[id]/generate`)
- [ ] Liste des versions
**Edition** `/template/mentions-legales/[groupId]/[id]/edit`
- [ ] Bouton pour sauvegarder
- [ ] Bouton pour annuler
- [ ] Editeur / preview

### Liste Startups `/startup`
- [x] Liste des startups
- [ ] Recherche par nom
- [ ] Filtre par type (qui a mentions légales, politique de confidentialité, etc)
- [ ] Bouton pour ajouter une page légale à une startup `/startup/[id]/new`

---
## Page "new variables" / "new page"
### Points d'entrée
- depuis la liste des startups
  - `/variables/[startupId]/new`
  - `/variables/[startupId]/[templateType]/new`
- depuis une page de startup
  - `/variables/[startupId]/new`
  - `/variables/[startupId]/[templateType]/new`
- depuis la liste des templates
  - `/template/[groupId]/[templateType]/generate`
- depuis un template
  - `/template/[groupId]/[templateType]/[sha]/generate`
- depuis la home
  - `/variables/new`
- depuis une page de variable (utiliser le même template)
  - `/template/[groupId]/[templateType]/[sha]/generate`

### Liste de urls
- [ ] `/variables/new`
- [ ] `/variables/[startupId]/new`
- [ ] `/variables/[startupId]/[templateType]/new`
- [ ] `/template/[groupId]/[templateType]/generate`
- [ ] `/template/[groupId]/[templateType]/[sha]/generate`

Alternative : `/variables/new?startupId=123&templateType=mentions-legales`
Conditions :
- sha ne peut être présent que si groupId et templateType sont renseignés




