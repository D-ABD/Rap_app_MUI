j'ai tranferer mon backend sur mon vps et aussi mon front (dist) , par contre je veux que le backend pointe le front: # ================================================================
# 📘 README TECHNIQUE – RAP_APP_DJ_V2
# ================================================================
# Projet : Rap_App_Django (Version 2)
# Date : (mettre la date)
# Auteur principal : root / administrateur serveur
# Objectif : fournir à tout développeur les informations nécessaires
# pour comprendre, maintenir et déployer l’application RAP_APP_DJ_V2.
# ================================================================

## 🧩 1️⃣ Description du projet
RAP_APP_DJ_V2 est une application Django déployée sur un serveur Linux
(Ubuntu) configuré avec :

- **Backend :** 
- **Serveur web :** 
- **Base de données :** PostgreSQL
- **Environnement :** 
- **Déploiement :** 
- **Sauvegardes :** 

L’application gère les fonctionnalités métiers du projet RAP_APP,
et son code source est synchronisé avec un dépôt GitHub privé.

---

## ⚙️ 2️⃣ Fonctionnement global
Le serveur exécute Gunicorn en tant que service systemd
(`......`), derrière un reverse proxy Nginx.
Le code Django vit. dans `/srv/.....

Lorsqu’un déploiement est lancé :
1. Le code est mis à jour depuis GitHub (`git pull`).
2. Le venv est activé et les dépendances mises à jour (`pip install`).
3. Les migrations et collectstatic sont effectuées.
4. Gunicorn et Nginx sont redémarrés.
5. Les logs sont affichés pour vérification.

---

## 💾 3️⃣ Sauvegardes et sécurité
- Sauvegarde quotidienne automatique de PostgreSQL à 3h du matin.
- Conservation des sauvegardes pendant 7 jours.
- Firewall (ufw) + Fail2Ban actifs.
- Certificats SSL gérés via Let’s Encrypt (certbot).

---

## 🧰 4️⃣ Fichiers et raccourcis utiles


**Alias principaux :**


## 🚀 5️⃣ Pour un nouveau développeur
- Connecte-toi au serveur :  
  ```bash
  ssh root@....


# ================================================================
# 🧠 RAP_APP_DJ_V2 — Mémo d’administration & déploiement
# ================================================================
# Généré le 2025-10-19 23:42
# Auteur : moi-même (root)
# Dernière mise à jour : (mettre la date du jour)
# ================================================================


==================================================
🚀 1️⃣ DÉPLOIEMENT DE NOUVELLES VERSIONS
==================================================

### ➤ Étape 1 — Sur ton poste local
git add .
git commit -m "Dernière version avant prod"
git push origin main

### ➤ Étape 2 — Sur le serveur de production
ssh root@147.93.126.119
bash /srv/rap_app_dj_v2/deploy.sh


==================================================
⚙️ 2️⃣ GESTION DES SERVICES
==================================================

systemctl restart gunicorn_rapapp
systemctl status gunicorn_rapapp --no-pager
tail -n 50 /var/log/gunicorn/error.log
tail -n 50 /var/log/gunicorn/access.log


==================================================
🌐 3️⃣ GESTION NGINX
==================================================

nginx -t
systemctl reload nginx
tail -n 50 /var/log/nginx/error.log


==================================================
🔒 4️⃣ SÉCURITÉ & MAINTENANCE
==================================================

ufw status verbose
systemctl status fail2ban --no-pager
apt update && apt upgrade -y
certbot renew --dry-run


==================================================
💾 5️⃣ SAUVEGARDES POSTGRESQL
==================================================

# Sauvegarder la base
pg_dump -U abd -d rap_app_backend > /srv/rap_app_dj_v2/backup_$(date +%Y%m%d).sql

# Restaurer une sauvegarde
psql -U abd -d rap_app_backend < backup_YYYYMMDD.sql


==================================================
🧱 6️⃣ EMPLACEMENT DES FICHIERS
==================================================

Projet Django ............. 
Environnement virtuel ..... 
Fichiers statiques ........ 
Service Gunicorn .......... 
Config Nginx .............. 
Optimisations Nginx ....... 
Logs Gunicorn ............. 
Logs Nginx ................ 
Certificats SSL ........... 


==================================================
🧠 7️⃣ COMMANDES UTILES
==================================================

# Vérifier les services
systemctl --type=service | grep gunicorn

# Redémarrer Gunicorn + Nginx
systemctl restart gunicorn_rapapp nginx

# Ouvrir un shell Django dans l'environnement virtuel
cd /srv/rap_app_dj_v2 && source venv/bin/activate && python manage.py shell

# Supprimer les fichiers temporaires vieux de plus de 7 jours
find /tmp -type f -mtime +7 -delete


==================================================
💾 8️⃣ SAUVEGARDES AUTOMATIQUES
==================================================

# Lancer une sauvegarde manuelle


✅ Liste des sauvegardes :


✅ Voir le journal de sauvegarde :


🕒 Planification :
Sauvegarde automatique tous les jours à 3H du matin  
Suppression des anciennes sauvegardes au bout de 7 jours

Raccourci utile :
backupdb


==================================================
📜 9️⃣ LOGS RAPIDES
==================================================

💡 Voir un résumé instantané des 3 logs principaux :
logsrap

💡 Voir les logs en direct, colorés et en continu :
logslive
(Arrêt avec Ctrl + C)


==================================================
🚀 🔟 DÉPLOIEMENT LIVE
==================================================

💡 Pour mettre ton site à jour depuis GitHub :
deploylive

✅ Ce raccourci effectue automatiquement :
- git pull  
- pip install  
- migrate  
- collectstatic  
- restart gunicorn + nginx  
- ouverture des logs live (Gunicorn, Nginx, PostgreSQL)

# Après un déploiement :
deploylive
checkrap   

# Vérifie que tout est OK


==================================================
🧩 1️⃣1️⃣ ALIAS PERSONNALISÉS
==================================================

# Aller directement dans le dossier principal du projet
alias djapp="cd /home/rap_app/Rap_App_Django/rap_app_project"

# Déployer automatiquement la dernière version du code
alias deploy_rapapp="cd ...... && source env/bin/activate && cd rap_app_project && git pull origin main && python manage.py migrate && python manage.py collectstatic --noinput && sudo systemctl restart gunicorn"

🔹 Recharger les alias :
source ~/.bashrc

🔹 Vérifier :
alias | grep rapapp


==================================================
🐍 1️⃣2️⃣ ENVIRONNEMENT DJANGO
==================================================

# Activer l’environnement virtuel

# Lancer le serveur de développement
python manage.py runserver 0.0.0.0:8000

# Appliquer les migrations
python manage.py migrate

# Créer une migration
python manage.py makemigrations

# Collecter les fichiers statiques
python manage.py collectstatic --noinput

# Créer un superutilisateur
python manage.py createsuperuser


==================================================
📦 1️⃣3️⃣ GUNICORN
==================================================

# Redémarrer Gunicorn
sudo systemctl restart gunicorn

# Vérifier son statut
sudo systemctl status gunicorn

# Voir les logs en direct
sudo journalctl -u gunicorn -n 50 -f


==================================================
🌿 1️⃣4️⃣ GIT (VERSION DU CODE)
==================================================

git pull origin main
git status
git add nom_du_fichier.py
git commit -m "Message clair ici"
git push origin main


==================================================
🧹 1️⃣5️⃣ COMMANDES LINUX UTILES
==================================================

ls -al                        # Lister les fichiers
cd /chemin/vers/dossier       # Naviguer
pwd                           # Voir le chemin courant
nano nom_du_fichier.txt       # Éditer un fichier
grep -R "mot_cherché" .       # Rechercher du texte
sudo systemctl restart nginx  # Redémarrer Nginx


==================================================
💡 1️⃣6️⃣ INFOS SUPPLÉMENTAIRES
==================================================

# Recharger le shell si alias modifiés
source ~/.bashrc

# Sauvegarder une base SQLite (si utilisée)
cp db.sqlite3 db_backup_$(date +%Y%m%d).sqlite3

# Vérifier Python & Django
python --version
python -m django --version


==================================================
📧 1️⃣7️⃣ ALERTES EMAIL & SURVEILLANCE SERVEUR
==================================================

🧩 Objectif :
Envoyer automatiquement un mail d’alerte si le serveur plante, 
si un cron échoue, ou si une tâche critique échoue (backup, deploy, etc.)

--------------------------------------------------
⚙️ CONFIGURATION SMTP (Gmail)
--------------------------------------------------

Le serveur utilise `msmtp` comme relais SMTP léger,
configuré pour envoyer les emails via Gmail App Password.

Fichiers principaux :
- `/etc/msmtprc` → configuration SMTP
- `/etc/msmtp_pass` → mot de passe d’application Gmail (sécurisé, chmod 600)
- `/var/log/msmtp.log` → journal d’envoi des mails

Contenu du fichier `/etc/msmtprc` :
--------------------------------------------------
defaults
auth           on
tls            on
tls_trust_file /etc/ssl/certs/ca-certificates.crt
logfile        /var/log/msmtp.log

account        gmail
host           smtp.gmail.com
port           587
from           adserv.fr@gmail.com
user           adserv.fr@gmail.com
passwordeval   "cat /etc/msmtp_pass"

account default : gmail
--------------------------------------------------

Mot de passe (application Gmail généré dans ton compte Google) :
--------------------------------------------------
echo "............" > /etc/msmtp_pass
chmod 600 /etc/msmtp_pass
--------------------------------------------------

Test manuel d’envoi :
--------------------------------------------------
echo "Test SMTP depuis le serveur RAP_APP" | msmtp adserv.fr@gmail.com
--------------------------------------------------

Vérification du log :
--------------------------------------------------
tail -n 20 /var/log/msmtp.log
--------------------------------------------------

--------------------------------------------------
🚨 ALERTES AUTOMATIQUES
--------------------------------------------------

### A. Cron automatique de surveillance
Un script simple envoie un mail si un service est down :

Fichier : `/srv/
--------------------------------------------------
#!/bin/bash
if ! systemctl is-active --quiet gunicorn_rapapp; then
    echo "🚨 Gunicorn est arrêté sur RAP_APP" | msmtp adserv.fr@gmail.com
fi

if ! systemctl is-active --quiet nginx; then
    echo "🚨 Nginx est arrêté sur RAP_APP" | msmtp adserv.fr@gmail.com
fi
--------------------------------------------------

Ajouté dans la crontab root :
--------------------------------------------------
*/10 * * * * bash /srv/..../utils/check_alert.sh
--------------------------------------------------

### B. Alertes backup
Dans `backup_db.sh`, envoi d’un mail si la sauvegarde échoue :
--------------------------------------------------
if [ $? -ne 0 ]; then
    echo "⚠️ Échec de la sauvegarde PostgreSQL sur RAP_APP" | msmtp adserv.fr@gmail.com
else
    echo "✅ Sauvegarde PostgreSQL réussie sur RAP_APP" | msmtp adserv.fr@gmail.com
fi
--------------------------------------------------

--------------------------------------------------
📩 Résumé :
- Mails envoyés via Gmail App Password sécurisé
- Logs d’envoi : `/var/log/msmtp.log`
- Cron toutes les 10 min : vérifie Gunicorn & Nginx
- Alertes backup automatiques via `backup_db.sh`
--------------------------------------------------


==================================================
✅ FIN DU MÉMO
==================================================

