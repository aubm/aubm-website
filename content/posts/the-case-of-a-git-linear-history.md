---
title: "The Case of a Git Linear History"
date: 2020-04-02T22:00:00+01:00
draft: false
tags: [Git]
---

I recently left a team where I was the lead developer for about three years.
I was regularly asked about why I wanted to keep the history of the git repository linear. Most of the time (but not always), the question came from fellow developers having a hard time rebasing a work branch.

As a matter of fact, the question was also asked multiple times on StackOverflow, especially as [What are advantages of keeping linear history in git](https://stackoverflow.com/questions/20348629/what-are-advantages-of-keeping-linear-history-in-git) or [Git workflow and rebase vs merge questions](https://stackoverflow.com/questions/457927/git-workflow-and-rebase-vs-merge-questions).

When reading the responses and their associated comments, it appears that the opinion is somewhat divided. Searching the web for _git linear history_ or _git merge vs rebase_, I found many blog posts promoting or demoting linear history. From what I could see, despite the number of available resources, the listed pros and cons arguments are quite redundant, however not always well detailed.
This blog post will dig into the most recurrent arguments. Let's start with the pros.

## Pros

### It is easier to follow

Below is an example of a linear history. It is called linear because every reference has only one parent.
Hitting down the road to the past of this alphabet repository, each commit is like a new page of a book. They are incremental and chronological, there are no fork roads on the way back to the root of the project.

```
* b0aaccd (master) add letters from U to Z
* 3bcfdb9 add letters from P to T
* a6958e2 add letters from K to O
* 1dc63f0 capitalize all letters
* 6f6ed85 add letters from f to j
* cbf6c73 init alphabet.txt with letters a to e
```

Now here is an example of a non-linear history.

```
* 7c4be78 (master) Merge branch 'add-missing-letters'
|\
* | 1dc63f0 capitalize all letters
| * c0e53d5 (add-missing-letters) add letters from u to z
| * 11f0ed9 add letters from p to t
| * d84cbe6 add letters from k to o
|/
* 6f6ed85 add letters from f to j
* cbf6c73 init alphabet.txt with letters a to e
```

It gives more information about the process of creating the alphabet. Thanks to the graph, we can see that the work on letters k to z was conducted in parallel with another work. We can see when exactly it was integrated.
While this information can be useful, it comes at the cost of added complexity in the history.
In order to review each individual step, we need to walk though two different and complementary routes. Our novel is now more of a role playbook that needs to be re-played to get a full appreciation of it. This becomes even more complex, when mixing up more branches.

But things get confusing when the graph is flattened, with commits printed in one dimension, sorted chronologically.
This is how the history is represented on Github, Gitlab or Bitbucket in the `/commits` view.

```
7c4be78 (master) Merge branch 'add-missing-letters'
1dc63f0 capitalize all letters
c0e53d5 (add-missing-letters) add letters from u to z
11f0ed9 add letters from p to t
d84cbe6 add letters from k to o
6f6ed85 add letters from f to j
cbf6c73 init alphabet.txt with letters a to e
```

From `cbf6c73 init alphabet.txt with letters a to e` to `c0e53d5 (add-missing-letters) add letters from u to z` everything is all right, group of letters by group of letters, `alphabet.txt` was consecutively patched and eventually ended up looking like :

```
a
b
c
d
f
g
h
i
j
k
l
m
n
o
p
q
r
s
t
u
v
w
x
y
z
```

Now printing the output of the next commit `git show 1dc63f0`.

```
commit 1dc63f0a3995e54d379955d515de7b47b4a95d8c
Author: <someone@gmail.com>
Date:   Thu Apr 2 15:13:04 2020 +0200

    capitalize all letters

diff --git a/alphabet.txt b/alphabet.txt
index 92dfa21..719a59f 100644
--- a/alphabet.txt
+++ b/alphabet.txt
@@ -1,10 +1,10 @@
-a
-b
-c
-d
-e
-f
-g
-h
-i
-j
+A
+B
+C
+D
+E
+F
+G
+H
+I
+J
(END)
```

Without the graph representation, it is not easy to understand why letters k to z seem to have suddenly disappeared from `alphabet.txt`, without git to be aware.

Now inspecting the next and last commit `7c4be78 Merge branch 'add-missing-letters'`, we see this.
Again, nothing that we can quickly understand from this only perspective.

```
commit 7c4be78005f8d926698d5eb4452755d6d2b518c1
Merge: e04623b c3d970e
Author: <someone@gmail.com>
Date:   Thu Apr 2 15:13:04 2020 +0200

    Merge branch 'add-missing-letters'

    # Conflicts:
    #       alphabet.txt

diff --cc alphabet.txt
index 719a59f,0edb856..8451816
--- a/alphabet.txt
+++ b/alphabet.txt
@@@ -1,10 -1,26 +1,25 @@@
 -a
 -b
 -c
 -d
 -e
 -f
 -g
 -h
 -i
 -j
 -k
 -l
 -m
 -n
 -o
 -p
 -q
 -r
 -s
 -t
 -u
 -v
 -w
 -x
 -y
 -z
 +A
 +B
 +C
 +D
 +E
 +F
 +G
 +H
 +I
 +J
++K
++L
++M
++N
++O
++P
++Q
++R
++S
++T
++U
++V
++W
++X
++Y
++Z
```

### Easy git bisect

This is a very common argument in favor of a linear history, but I hardly found a satisfying explanation.
If never used [bisect](https://git-scm.com/docs/git-bisect) before, and don't especially plan for using it any time soon, maybe this is not such a strong argument.
Building on my previous example, here is altered version where I strategically introduced an errored commit.

```
* 7c4be78 (master) Merge branch 'add-missing-letters'
|\
* | 45b257c oops... accidentally delete letter E   <--------------- here
| * c0e53d5 (add-missing-letters) add letters from u to z
* | 1dc63f0 capitalize all letters
| * 11f0ed9 add letters from p to t
| * d84cbe6 add letters from k to o
|/
* 6f6ed85 add letters from f to j
* cbf6c73 init alphabet.txt with letters a to e
```

Here is the detail of the indicted commit. Arguably if every bug was that self-explaining we wouldn't have much trouble tracking them!
Anyway let's try and catch the one, using bisect.

```
commit 45b257c9b1e6a4b8a4d67957add3d5c5176a00e8
Author: <troll@gmail.com>
Date:   Thu Apr 2 16:09:20 2020 +0200

    oops... accidentally delete letter E

diff --git a/alphabet.txt b/alphabet.txt
index 719a59f..a812140 100644
--- a/alphabet.txt
+++ b/alphabet.txt
@@ -2,7 +2,6 @@ A
 B
 C
 D
-E
 F
 G
 H
(END)
```

The most recent commit that we know to be good in master is `1dc63f0 capitalize all letters`. We will use it as the base, and use `grep` to check if the letter E is part of `alphabet.txt`, here is how.

```
> git bisect start master 1dc63f0 && git bisect run sh -c "cat alphabet.txt | grep 'E' -q"

Bisecting: 2 revisions left to test after this (roughly 1 step)
[11f0ed9614a2225ed21d00c6392ca1aa20a4bea7] add letters from p to t
running sh -c cat alphabet.txt | grep 'E' -q
Bisecting: 0 revisions left to test after this (roughly 0 steps)
[d84cbe6e2e7f659b90a7ad04b0c4059948a4cf4d] add letters from k to o
running sh -c cat alphabet.txt | grep 'E' -q
d84cbe6e2e7f659b90a7ad04b0c4059948a4cf4d is the first bad commit
commit d84cbe6e2e7f659b90a7ad04b0c4059948a4cf4d
Author: <someone@gmail.com>
Date:   Thu Apr 2 16:09:20 2020 +0200

    add letters from k to o

:100644 100644 92dfa216416a1ac944633ab674568f8bae139d95 f8c295c135e5d24d913c7b1c720e2e0deeaeb052 M	alphabet.txt
bisect run success
```

Bisect didn't find the right commit, so what happened? Let's focus on the portion of the graph that git considered, leaving the rest.

```
* 7c4be78 (master) Merge branch 'add-missing-letters'
|\
* | 45b257c oops... accidentally delete letter E
| * c0e53d5 (add-missing-letters) add letters from u to z
* | 1dc63f0 capitalize all letters
| * 11f0ed9 add letters from p to t
| * d84cbe6 add letters from k to o
|/
```

After sorting the commits chronologically, git tries to determine the commit in the middle of the list. As one of the nodes is a merge commit, git needs to treat both branches separately and it starts with the first parent of `7c4be78 (master) Merge branch 'add-missing-letters'`, which is the `add-missing-letters` branch. There are three commits in the branch, so the first break is commit `11f0ed9 add letters from p to t`.

Then, the test command is ran and this is where things get wrong. Because branch `add-missing-letters` doesn't have commit `1dc63f0 capitalize all letters`, the test command fails (exit with status 1). In this context, the appropriate test command should search for `e` instead of `E`. We didn't anticipate that and only considered the history of branch `master`, because of that, git found a false bad commit.

Moving on, git will then try to determine if the error already existed in commit `d84cbe6 add letters from k to o`.
As it did, git is telling us that it is _the first bad commit_.

Funny thing is, if branch `add-missing-letters` originated from commit `1dc63f0 capitalize all letters`, then `E` would have been there. Git would then have determined that all commits in the branch were good ones, and would have moved on to the second parent of `7c4be78 (master) Merge branch 'add-missing-letters'`, eventually finding the actual source of the bug.

This is very hazardous, and we would not have encountered this issue with a linear history for example looking like :

```
* c0e53d5 (master) add letters from U to Z
* 11f0ed9 add letters from P to T
* d84cbe6 add letters from K to O
* 45b257c oops... accidentally delete letter E
* 1dc63f0 capitalize all letters
* 6f6ed85 add letters from f to j
* cbf6c73 init alphabet.txt with letters a to e
```

I want to mention [this article](https://blog.quantic.edu/2015/02/03/git-bisect-debugging-with-feature-branches/). It proposes a workaround for this very issue. Though not impossible, it is more tedious and less precise.

### Easy git revert

This is the last recurrent argument for keeping a linear history.
Let's rewind to an earlier example.

```
* 7c4be78 (master) Merge branch 'add-missing-letters'
|\
* | 1dc63f0 capitalize all letters
| * c0e53d5 (add-missing-letters) add letters from u to z
| * 11f0ed9 add letters from p to t
| * d84cbe6 add letters from k to o
|/
* 6f6ed85 add letters from f to j
* cbf6c73 init alphabet.txt with letters a to e
```

Here is what happened in this project.

* The repository was initialized, the first two commits `cbf6c73` and `6f6ed85` appended letters a to j to `alphabet.txt`, one letter per line.
* From there, someone created a new branch `add-missing-letters` for working on adding the rest of the alphabet.
* Meanwhile, `1dc63f0` changed the case of the existing letters in branch `master`, `alphabet.txt` now has A to J.
* Branch `add-missing-letters` was merged into `master`. Changes from `master` were taken into account, and the work adapted so that now the alphabet is complete with capital letters only.

Now let's say that for some reason, we want to roll back letters u to z. Using revert with commit `c0e53d5 (add-missing-letters) add letters from u to z` produces the following conflict.

```
<<<<<<< HEAD
A
B
C
D
F
G
H
I
J
K
L
M
N
O
P
Q
R
S
T
U
V
W
X
Y
Z
=======
a
b
c
d
e
f
g
h
i
j
k
l
m
n
o
p
q
r
s
t
>>>>>>> parent of c0e53d5... add letters from u to z
```

This is not particularly helpful, resolving the conflict is actually more work than manually removing the letters in a new commit.
In the case of the linear version of this history, the revert applies seamlessly.

```
* 31a1b1a (master) Revert "add letters from U to Z"
* b0aaccd add letters from U to Z
* 3bcfdb9 add letters from P to T
* a6958e2 add letters from K to O
* 1dc63f0 capitalize all letters
* 6f6ed85 add letters from f to j
* cbf6c73 init alphabet.txt with letters a to e
```

That being said, git revert is not cheap, and often not realistic for patching a set of files where a lot of modifications happened since the original patch was applied.
This could mitigate the argument. Still, building on the previous examples, we were able to show how a non-linear history can complicate things more.

## Cons

### Incremental build efforts are lost

Keeping a linear history means that developers will need to rebase their work branches before merging. When applying a patch on a more recent base, chances are that some portions of the work will be invalidated by the latest changes.

```
* f19b505 (master) rename alphabet.txt to latin-alphabet.txt
| * c0e53d5 (add-missing-letters) add letters from u to z
* | 1dc63f0 capitalize all letters
| * 11f0ed9 add letters from p to t
| * d84cbe6 add letters from k to o
|/
* 6f6ed85 add letters from f to j
* cbf6c73 init alphabet.txt with letters a to e
```

The last commit in branch `master` changed the name of `alphabet.txt`. When rebasing branch `add-missing-letters`, changes brought to `alphabet.txt` will be reapplied on `latin-alphabet.txt`. __So yes, the process is destructive__, history is rewritten. It is up to you to estimate the value of keeping the indication that `add-missing-letters` originates from a version of `master` where the file was not renamed yet. At least now, knowing that this will come at other expenses in terms of readability and some tools ease of use, you can make an informed decision.

#### Keeping a linear history doesn't necessarily mean squashing everything around

Squashing a topic branch commits before merge is not necessary for keeping the history linear.
I want to make this quick digression because I feel like the confusion is often made.
If you find it relevant, it is perfectly fine to keep commits separated in the branch when merging.

Furthermore, it is possible to use merge commits and still require branches to be rebased on the target.
The term of semi-linear history is used to describe such logs.

```
* 7c4be78 (HEAD -> master) Merge branch 'add-missing-letters'
|\
| * c0e53d5 (add-missing-letters) add letters from U to Z
| * 11f0ed9 add letters from P to T
| * d84cbe6 add letters from K to O
|/
* 1dc63f0 capitalize all letters
* 6f6ed85 add letters from f to j
* cbf6c73 init alphabet.txt with letters a to e
```

Regarding readability, bisectability and revertability, a semi-linear history has the same advantages than a linear history.

### Rebasing is hard, time consuming, reserved for the elite

In the _Git Branching - Rebasing_ chapter of the [git web book](https://git-scm.com/book/en/v2/Git-Branching-Rebasing), the _merge_ command is mentioned as the _easiest way to integrate two branches_ with divergent history. The method is indeed more direct, requires less commands and manual steps, however it should be recalled that easiest doesn't necessarily mean best or recommended.

Rebase is a more advanced git command that requires reading some documentation and a bit of practice to master.
But so is mastering a programming language, understanding a runtime environment or getting used to a new IDE.
In comparison, learning how to perform a simple rebase operation is a very reasonable investment, especially for someone with basic knowledge in git. So no, it is not reserved for the elite.

Moreover, major git providers have resources and options that help to maintain a linear or semi-linear history :

- https://docs.gitlab.com/ee/user/project/merge_requests/fast_forward_merge.html
- https://docs.gitlab.com/ee/topics/gitlab_flow.html#reducing-merge-commits-in-feature-branches
- https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-request-merges#squash-and-merge-your-pull-request-commits
- https://confluence.atlassian.com/bitbucketserver/pull-request-merge-strategies-844499235.html

Rebases should not be a problem in themselves, but the operation of resolving conflicts can be tedious.
Whether or not you chose to rebase a branch on master before it is merged, you will have to deal with the same conflicts.
However, when you rebase a branch on master, potential conflicts need to be resolved for individual commits.
If several commits alter the same sources, chances are that conflicts will appear for each one of them.
When starting using `git rebase`, I found these situations confusing because I had the impression that git asked me to resolve the same conflicts multiple times. The reason is that I only considered the modifications brought by my work branch as a whole, and not the individual steps in it.
Rebasing a branch means rebasing individual commits. This is the semi-automatic equivalent of a method consisting in starting a new branch from master, and manually cherry-picking commits, one by one.
Rebasing a commit means creating a new one (with a different parent), so if the next commit alters the same sources, conflicts will have to be resolved as for any _regular_ conflict originating from a reference that was never an ancestor.

It can indeed be more time consuming than resolving all conflicts at once. But it is a price to pay if you want to preserve the individual steps of the branch. Branches with few commits or with orthogonal changes between commits help to mitigate or even completely remove this issue.

## Conclusion

Because everything is incremental and chronological, it is easy to navigate in the linear history, and it is also easy to use advanced features like bisect and revert. But artificially maintaining a linear history involves constantly rebasing topic branches, which is an advanced git feature that requires a slightly higher mastering of git. In addition, portions of work history are erased in the process.

If you are wondering whether or not you want to maintain a linear history, you may want to ask yourself what you want your git history to be used for. If your project was a novel, and you want each commit in the master branch to be a new page of the story, then you want a linear history. However if you want your repository to contain the complete and unaltered records of everything that happened in the process of writing the novel, then you will not aim for a linear history.

Quoting the _Git Branching - Rebasing_ chapter of the [git web book](https://git-scm.com/book/en/v2/Git-Branching-Rebasing):

> Now, to the question of whether merging or rebasing is better: hopefully you’ll see that it’s not that simple. Git is a powerful tool, and allows you to do many things to and with your history, but every team and every project is different. Now that you know how both of these things work, it’s up to you to decide which one is best for your particular situation.
>
> In general the way to get the best of both worlds is to rebase local changes you’ve made but haven’t shared yet before you push them in order to clean up your story, but never rebase anything you’ve pushed somewhere.
