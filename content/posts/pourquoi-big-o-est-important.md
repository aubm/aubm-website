+++
tags = [ ]
categories = [ ]
date = "2016-12-08T22:01:52+01:00"
title = "Pourquoi Big O est important ?"
+++

## Introduction

Récemment je parcourais différentes ressources sur le sujet des algorithmes.
En examinant les exemples de runtimes exprimés en fonctions mathématiques avec Big O, je me suis dit:
"Tout cela est très intéressant mais mérite d'être vérifié !".

Après tout ce n'est pas parce que tous les bouquins sur le sujet nous enseignent que cet algorithme de détection des puissances de 2 dans une liste de taille N a un runtime de O(log(N)) que je dois les croire sur parole n'est-ce pas ?

## Ce que Big O nous enseigne

La notation Big O permet d'exprimer sous forme mathématique la complexité en temps d'exécution et en occupation mémoire d'un algorithme en fonction des variables qu'il utilise.

A titre d'exemple, la fonction ci-dessous a un runtime `O(n)`, où `n` représente la taille de `myList` :

```
func printEachElementsInTheList(myList []string) {
    for _, v := range myList {
        fmt.Println(v)
    }
}
```

Pourquoi ? Car le nombre d'opérations exécutées dans la fonction dépend de `n`, si `n` vaut 1, `fmt.Println(v)` sera exécutée 1 fois.
Si `n` vaut 2, l'opération sera exécutée 2 fois, et ainsi de suite.

Sur une machine donnée, si `fmt.Println(v)` prend en moyenne `5ns` pour être exécutée, on peut estimer le temps total d'exécution
de la fonction en fonction de `n` de cette façon : `T(ns) = 5n`.
A noter que la notation Big O n'est utilisée que pour une évaluation de l'asymptote lorsque `n` tend vers l'infini.
Autrement dit, à quelle allure `T(ns)` change lorsque `n` change.
C'est pour cette raison que les constantes (comme le facteur 5 dans l'exemple) sont ignorées.
Mathématiquement parlant, quelque soit la valeur de `a`, `F(a * n)` aura la même allure.

Dans cet exemple, le runtime est linéaire, mais il existe d'autres runtimes, `O(log(n))`, `O(n^2)`, ...
Ou encore avec plusieurs variables `O(n + m)`, `O(n * m)`, ...

Le principe est simple, mais le sujet est vaste et certains problèmes sont piquants.
Pour creuser le sujet, il existe de nombreuses ressources, en voici quelques unes que j'ai utilisées :

- https://codility.com : site internet comportant des exercices et des challenges pour monter en compétences sur plusieurs sujets de programmation
- [Cracking the coding interview](https://www.amazon.fr/Cracking-Coding-Interview-6th-Programming/dp/0984782850/ref=dp_ob_image_bk) de Gayle Laakmann Mcdowell : le livre est écrit dans le but de préparer le codeur à des entretiens d'embauche high level, mais comporte en introduction un chapitre détaillé sur la notation Big O, très bien écrit et parfait pour démarrer sur le sujet.
- [Algorithm design](https://www.amazon.com/gp/product/9332518645/ref=oh_aui_detailpage_o01_s00?ie=UTF8&psc=1) de Jon Kleinberg et Eva Tardos : pour continuer de façon plus poussée sur le sujet.

## Comment s'en convaincre

Bien, passons aux choses marrantes !

J'écris beaucoup de code en Go en ce moment, une chose intéressante avec Go est qu'il est très facile de réaliser des benchmarks,
un type de test particulier destiné à mesurer le temps d'exécution d'une fonction.

Je me suis servi de cet outillage pour comparer l'allure du runtime avec des valeurs mesurées et l'allure du runtime théorique pour une sélection de fonctions.

### SumAndProduct

La fonction suivante a un runtime de `O(n)` où `n` représente la taille du tableau `array` :

```
func SumAndProduct(array []int) {
    sum := 0
    product := 1
    for i := 0; i < len(array); i++ {
        sum += array[i]
    }
    for i := 0; i < len(array); i++ {
        product *= array[i]
    }
}
```
Ne vous laissez pas induire en erreur par la deuxième boucle for, il s'agit bien d'un runtime de `O(n)`
La fonction comporte deux boucles sur `n` éléments, le nombre total d'opérations dans les deux boucles est 2,
le nombre d'opérations exécutées par la fonction s'exprime par : `O(2 * n + 2)` (la constante +2 à la fin correspond
aux deux opérations d'initialisation des variables `sum` et `product`).
Soit O(a * n + b) qui a la même allure linéaire que O(n).

[Ce test](https://github.com/aubm/Big-O-matters/blob/master/sum_and_product_test.go) permet de mesure le temps moyen d'exécution de la fonction pour des tableaux `array` de tailles variables 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000, 3000, 4000 et 5000.

Voilà le résultat d'un test :

```
BenchmarkSumAndProduct10              100000000        16.9 ns/op
BenchmarkSumAndProduct20              50000000        35.2 ns/op
BenchmarkSumAndProduct30              30000000        45.7 ns/op
BenchmarkSumAndProduct40              20000000        59.9 ns/op
BenchmarkSumAndProduct50              20000000        88.5 ns/op
BenchmarkSumAndProduct60              20000000        98.8 ns/op
BenchmarkSumAndProduct70              20000000       108 ns/op
BenchmarkSumAndProduct80              100000000       114 ns/op
BenchmarkSumAndProduct90              100000000       127 ns/op
BenchmarkSumAndProduct100             100000000       133 ns/op
BenchmarkSumAndProduct200             100000000       220 ns/op
BenchmarkSumAndProduct300              50000000       310 ns/op
BenchmarkSumAndProduct400              30000000       392 ns/op
BenchmarkSumAndProduct500              30000000       475 ns/op
BenchmarkSumAndProduct600              30000000       590 ns/op
BenchmarkSumAndProduct700              20000000       716 ns/op
BenchmarkSumAndProduct800              20000000       774 ns/op
BenchmarkSumAndProduct900              20000000       856 ns/op
BenchmarkSumAndProduct1000             20000000       916 ns/op
BenchmarkSumAndProduct2000             100000000      1812 ns/op
BenchmarkSumAndProduct3000             100000000      2740 ns/op
BenchmarkSumAndProduct4000              50000000      3535 ns/op
BenchmarkSumAndProduct5000              30000000      4762 ns/op
```

La taille du tableau est renseignée dans le nom du test, et le temps moyen d'exécution de la fonction associé à cette valeur est exprimé
dans la colonne de droite en ns/op.

Quelques sortilèges de magie noire plus tard, voici ces données représentées dans Excel sur la courbe de gauche, à côté de l'allure théorique représentée à droite :

<img src="/img/big-o/sum-and-product.png" alt="SumAndProduct" class="img-responsive">

### Fibonacci

Voici une fonction donnant la valeur du n-ième membre de la [suite de Fibonacci](https://fr.wikipedia.org/wiki/Suite_de_Fibonacci), le runtime de la fonction est `O(2^n)` :

```
func Fib(n int) int {
    if n <= 0 {
        return 0
    } else if n == 1 {
        return 1
    }
    return Fib(n-1) + Fib(n-2)
}
```

Le résultat des tests :

```
BenchmarkFib1     500000000         3.57 ns/op
BenchmarkFib2     100000000        12.3 ns/op
BenchmarkFib3     100000000        18.7 ns/op
BenchmarkFib4     500000000        33.6 ns/op
BenchmarkFib5     30000000        54.3 ns/op
BenchmarkFib6     20000000        87.5 ns/op
BenchmarkFib7     100000000       140 ns/op
BenchmarkFib8      500000000       233 ns/op
BenchmarkFib9      500000000       379 ns/op
BenchmarkFib10     20000000       609 ns/op
BenchmarkFib11     100000000      1006 ns/op
BenchmarkFib12     100000000      1645 ns/op
BenchmarkFib13     100000000      2575 ns/op
BenchmarkFib14      500000000      4185 ns/op
BenchmarkFib15      20000000      6870 ns/op
BenchmarkFib16      20000000     10919 ns/op
BenchmarkFib17      100000000     17856 ns/op
BenchmarkFib18       500000000     29713 ns/op
BenchmarkFib19       30000000     45921 ns/op
BenchmarkFib20       20000000     75167 ns/op
BenchmarkFib21       100000000    117280 ns/op
BenchmarkFib22       100000000    194432 ns/op
BenchmarkFib23        500000000    316511 ns/op
```

Et la représentation graphique :

<img src="/img/big-o/fib.png" alt="Fib" class="img-responsive">

### PowersOf2

Une dernière pour la route, celle-ci affiche l'ensemble des puissances de 2 inférieures ou égales à `n`, le runtime pour cette fonction est `O(log(n))`.

```
func PowersOf2(n int) int {
    if n < 1 {
        return 0
    } else if n == 1 {
        print(1)
        return 1
    } else {
        prev := PowersOf2(n / 2)
        curr := prev * 2
        print(curr)
        return curr
    }
}
```

Le résultat des tests :

```
BenchmarkPowersOf2_1              100000000        16.3 ns/op
BenchmarkPowersOf2_2              500000000        33.6 ns/op
BenchmarkPowersOf2_3              30000000        34.2 ns/op
BenchmarkPowersOf2_4              30000000        49.2 ns/op
BenchmarkPowersOf2_5              30000000        49.6 ns/op
BenchmarkPowersOf2_6              30000000        47.3 ns/op
BenchmarkPowersOf2_7              30000000        49.9 ns/op
BenchmarkPowersOf2_8              20000000        66.7 ns/op
BenchmarkPowersOf2_9              20000000        68.9 ns/op
BenchmarkPowersOf2_10             20000000        72.1 ns/op
BenchmarkPowersOf2_20             20000000        84.9 ns/op
BenchmarkPowersOf2_30             20000000        84.8 ns/op
BenchmarkPowersOf2_40             20000000       112 ns/op
BenchmarkPowersOf2_50             20000000       121 ns/op
BenchmarkPowersOf2_60             100000000       128 ns/op
BenchmarkPowersOf2_70             100000000       127 ns/op
BenchmarkPowersOf2_80             100000000       124 ns/op
BenchmarkPowersOf2_90             100000000       137 ns/op
BenchmarkPowersOf2_100            100000000       119 ns/op
BenchmarkPowersOf2_200            100000000       141 ns/op
BenchmarkPowersOf2_300            100000000       155 ns/op
BenchmarkPowersOf2_400            100000000       164 ns/op
BenchmarkPowersOf2_500            100000000       160 ns/op
BenchmarkPowersOf2_600            100000000       177 ns/op
BenchmarkPowersOf2_700            100000000       179 ns/op
BenchmarkPowersOf2_800            100000000       179 ns/op
BenchmarkPowersOf2_900            100000000       176 ns/op
BenchmarkPowersOf2_1000           100000000       176 ns/op
BenchmarkPowersOf2_2000           100000000       194 ns/op
BenchmarkPowersOf2_3000           100000000       217 ns/op
BenchmarkPowersOf2_4000           100000000       217 ns/op
BenchmarkPowersOf2_5000           100000000       233 ns/op
BenchmarkPowersOf2_6000            500000000       228 ns/op
BenchmarkPowersOf2_7000            500000000       238 ns/op
BenchmarkPowersOf2_8000            500000000       236 ns/op
BenchmarkPowersOf2_9000            500000000       256 ns/op
BenchmarkPowersOf2_10000           500000000       257 ns/op
BenchmarkPowersOf2_20000           500000000       288 ns/op
BenchmarkPowersOf2_30000           500000000       286 ns/op
BenchmarkPowersOf2_40000           500000000       314 ns/op
BenchmarkPowersOf2_50000           500000000       311 ns/op
BenchmarkPowersOf2_60000           500000000       313 ns/op
BenchmarkPowersOf2_70000           500000000       339 ns/op
BenchmarkPowersOf2_80000           500000000       337 ns/op
BenchmarkPowersOf2_90000           500000000       339 ns/op
BenchmarkPowersOf2_100000          500000000       347 ns/op
BenchmarkPowersOf2_200000          500000000       375 ns/op
BenchmarkPowersOf2_300000          30000000       387 ns/op
BenchmarkPowersOf2_400000          30000000       382 ns/op
BenchmarkPowersOf2_500000          500000000       398 ns/op
BenchmarkPowersOf2_600000          30000000       426 ns/op
BenchmarkPowersOf2_700000          30000000       427 ns/op
BenchmarkPowersOf2_800000          30000000       436 ns/op
BenchmarkPowersOf2_900000          30000000       425 ns/op
BenchmarkPowersOf2_1000000         30000000       412 ns/op
BenchmarkPowersOf2_2000000         30000000       453 ns/op
BenchmarkPowersOf2_3000000         30000000       477 ns/op
BenchmarkPowersOf2_4000000         30000000       492 ns/op
BenchmarkPowersOf2_5000000         30000000       499 ns/op
BenchmarkPowersOf2_6000000         30000000       499 ns/op
BenchmarkPowersOf2_7000000         30000000       507 ns/op
BenchmarkPowersOf2_8000000         30000000       496 ns/op
BenchmarkPowersOf2_9000000         30000000       539 ns/op
BenchmarkPowersOf2_10000000        30000000       531 ns/op
```

Et la représentation graphique :

<img src="/img/big-o/powers-of-2.png" alt="PowersOf2" class="img-responsive">

Un peu bancale cette dernière, mais l'intention est là.
