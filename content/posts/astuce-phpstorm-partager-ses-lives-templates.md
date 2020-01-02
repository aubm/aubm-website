+++
categories = []
date = "2014-10-11T18:39:40+01:00"
tags = ["Astuce"]
title = "Astuce PhpStorm : partager ses live templates"

+++

## Coder vite et bien

Le choix de l'IDE est important dans le sens où celui-ci peut apporter une réelle valeur ajoutée dans le travail du développeur. En ce qui me concerne, j'ai vendu mon âme à <a href="https://www.jetbrains.com/" target="_blank">Jetbrains</a>. Une chose que j'apprécie particulièrement dans leurs solutions est la facilité avec laquelle il est possible de configurer des live templates. Cet article porte sur PhpStorm mais peut être reporté sur d'autres IDE de l'éditeur (RubyMine, PyCharm, etc ...).

Les live templates, c'est cette fonctionnalité qui permet d'accélérer l'écriture du code à l'aide de "shortcuts" servant à générer des fragments de code entier. Un exemple ?

Saisissez 'fore' dans du code PHP, puis utilisez la touche tab. Le fragment de code suivant sera automatiquement généré :

```php
foreach ( as $) {

}
```

Chaque appui sur la touche tab fera avancer le curseur à une position pré-déterminée vous permettant d'achever l'écriture de votre boucle en moins de temps qu'il n'en faut pour le dire. Essayez aussi d'autres shortcuts comme `forek`, `pubf`, etc ...

Jetbrains propose un petit article détaillant la procédure à suivre pour <a class="https://www.jetbrains.com/phpstorm/webhelp/creating-and-editing-live-templates.html" target="_blank">la création et l'éditions de live templates personnalisés</a>. Sa lecture pourrait cependant ne pas être utile, inspirez vous simplement des live templates proposés par défaut pour créer les vôtres. Pour les trouver, rendez vous dans les paramètres de l'IDE, section "Live Templates".

<figure>
<img class="img-responsive" src="/img/php_storm_live_templates.png" alt="Configuration des live templates dans PhpStorm" width="900" height="542">
<figcaption>La fenêtre de configuration des live templates dans PHPStorm.</figcaption>
</figure>

Le bouton + vous permet d'ajouter un nouveau live template. Considérez également l'utilisation des groupes de templates pour vous y retrouver plus facilement.

## Partager ses live templates

Si vous utilisez beaucoup les live templates, vous aurez certainement envie de retrouver vos précieux sur l'ensemble de vos postes, et ce bien entendu sans avoir à les re-saisir à la main. Je vous propose donc dans cet article la solution que j'utilise pour y parvenir.

Les live templates personnalisés que vous créez sont enregistrés dans des fichiers xml. Selon votre environnement ils pourraient se trouver quelque part dans `~/Library/Preferences/WebIde{VERSION}/templates` ou `C:\Users\{USERNAME}\.WebIde{VERSION}\templates`. Chaque groupe de templates correspond à un fichier xml.

L'idée est simple : versionner ce répertoire avec git (ou un autre VCS). Pour l'exemple, j'ai créé un nouveau repository sur mon compte Github, et me voici dans mon terminal :

```bash
cd ~/Library/Preferences/WebIde80/templates
git init
git remote add origin git@github.com:aubm/jetbrains-live-templates.git
git add -A
git commit -m "First commit"
git push
```

Et sur mon autre poste :

```bash
cd ~/Library/Preferences/WebIde80/templates
git init
git remote add origin git@github.com:aubm/jetbrains-live-templates.git
git pull
```

Il faudra penser à redémarrer PhpStorm pour que les modifications effectuées dans le ou les fichiers xml soient prises en compte.

Je peux maintenant enrichir mes live templates à volonté, puis les récupérer presque sans effort d'un poste à l'autre. En espérant que certains trouveront cette astuce utile, merci pour la lecture !

Aurélien.
