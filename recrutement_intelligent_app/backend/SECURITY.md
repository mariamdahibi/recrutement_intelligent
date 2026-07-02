## Scan de sécurité avec Trivy

Trivy est utilisé dans la partie DevSecOps pour analyser les images Docker déployées en production.

Images analysées :

- recrutement-backend
- recrutement-frontend
- recrutement-ai
- recrutement-mysql

Objectifs :

- détecter les vulnérabilités CVE ;
- identifier les failles HIGH et CRITICAL ;
- analyser les dépendances système des images Docker ;
- générer des rapports de sécurité exploitables.

Les rapports Trivy sont générés sur la VM PROD dans :

```bash
~/recrutement-prod/security-reports