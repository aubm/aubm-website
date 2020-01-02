+++
categories = []
date = "2016-11-11T16:53:03+01:00"
tags = []
title = "Comment vous faire une idée de l'impact de la latence de votre téléviseur dans vos sessions de jeux vidéos"

+++

A l'approche des fêtes de fin d'année j'envisage de profiter des soldes pour remplacer la télévision de mon salon.
Ce ne sont pas les choix qui manquent entre les LCD, OLED, rétroprojecteurs 4K, pas 4K, ou je ne sais quelle autre fantaisie ...

Cette initiative étant principalement motivée par l'envie de profiter d'un support plus grand, nombre de joueurs
aguerris et autres grands manitous du gaming de mon entourage n'ont pas manqué de me mettre en garde :

> Tu ne feras point l'acquisition d'une dalle ne disposant pas d'une latence satisfaisante

Soit ...

> 50ms, cela représente une éternité sur un FPS

![Right ...](http://www.reactiongifs.com/wp-content/uploads/2013/05/dr-evil-right.gif)

Bon, j'ai beau être de bonne foi, j'avoue avoir un peu de mal à me représenter comment un temps si court peut à ce point changer la donne.

Pour m'en convaincre, je décide donc de construire un mini-jeu pour l'expérience.

L'idée est de détruire des blocs en mouvement sur l'écran, en cliquant dessus avec la souris.
Lorsqu'un clic est déclenché sur la zone de jeu à un instant `t0`, un traitement système va se déclencher à `t0 + n`,
`n` étant le nombre de milisecondes écoulées, soit la latence.
Ce traitement va inspecter la zone de jeu à l'emplacement du clic de l'utilisateur, et déterminer si un bloc doit être détruit à cet emplacement.

Si l'utilisateur vise correctement et que la latence est nulle, alors le bloc sera détruit.
Si l'utilisateur vise correctement mais que la latence est suffisamment élevée pour que le bloc en mouvement se soit fait la malle avant que le système
n'ait pu réagir à temps, le jeu considérera alors que le joueur n'a tout simplement pas été assez rapide.
Voilà qui pourrait bien être des plus embêtant.

![Geek rage](https://media.giphy.com/media/9i4cIY1wZMTDy/giphy.gif)

Je me suis dit que cela pourrait être amusant de partager ce petit mini-jeu, je vous laisse donc vous faire votre propre impression à cette adresse : https://aubm.github.io/lag-shooter/.

A titre d'information, la latence est paramétrable en bas à gauche, juste à côté du pourcentage de réussite des clics !

