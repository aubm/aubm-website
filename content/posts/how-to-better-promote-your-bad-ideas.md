---
title: "How to Better Promote Your Bad Ideas"
date: 2020-01-03T00:38:00+01:00
draft: false
tags: []
---

Ever found yourself in a situation where you had to promote an idea that you thought it was brilliant, but your co-workers did not?

We don't always have good ideas, sometimes we poorly elaborate our instincts, and whatever we come up with doesn't pass the test of the evaluation by our pairs.
If your colleagues have presented robust and logical arguments, then it's hard to defend your idea further.

The thing is, if you really care about these ideas, then it is really a shame that it would only take a solid and well established argumentation for them to be rejected. What if everything that comes from you ends up being gently put apart by the first well intended experienced expert.
Well that would be outraging and unfair! After all, if you really want to store these sensitive payment transactions in an sqlite database running in a docker container located on a non-persistent local VM disk, it is your damn right to do so!

In this article we will discuss and practice several techniques that will help you better promote your bad ideas.

## Techniques

### Argumentum ad verecundiam _(appeals to authorities)_

This first one is a safe bet, as it has already proven its effectiveness in many scenarios.

You might think that it is reserved to the ones in your team that stand in a position of authority of some kind. It is indeed easy if that is your case because then you don't really need to put a lot of effort, just go _We'll go with my idea, I take full responsibility on that one._ or _I've been working in this team for 2 years and you just arrived. Trust me, you don't want to bring that up._.

But the truth is, anyone can appeal to authorities.
For example, go outside your team's boundaries and with a bit of creative interpretation you will always find some guy's blog post or presentation video that supports your idea.

### Argumentum ad populum _(appeals to the people)_

That one is a close cousin of the ad verecundiam, only this time, you call the mass.
It can go with several forms, but a common one is _If it has worked for them I don't see any reason why it wouldn't work for us_.

Always wanted your company to go monorepo? Use the card _Google, Facebook, Microsoft and many others use a monorepo, we should definitely do that too._

I'm sure the following quote, which by the way is a good illustration of a hasty generalization, will ring a bell too.

> If it is good enough for Javascript, why can't we apply it in Rust?
>
>-- _A developer who really enjoys Javascript_

### Cherry-picking

As when using git, cherry-picking is a powerful manipulation tool.

Used in combination with other techniques, you can achieve powerful combos that will shake your coworkers for sure, like when combining with the ad verecundiam in the below example.

> &minus; You really reimplemented the whole routing logic in your component for this new feature, why not using the framework capabilities?
>
> &minus; I figured that the framework brought a lot of overhead to the compilation and complexity. As the creator of Golang Rob Pike said in one of his conferences _A little copying is better than a little dependency_.

Of course there is a context in which this opinionated standpoint was made, and people might as well consider that the invoked authority is wrong but your reviewer Jimmy doesn't need to know that.
The only thing that he needs to understand, is that Rob Pike actually said that, period.

### Ex vulgus scientia _(popular wisdom)_

This one is a particularly useful way to play a shell game that will appear as a striking argument for the uninitiated. It consists of taking popular maxims and proverbs and simply using them as arguments.

Imagine a situation where you have to create a thumb up / thumb down based rating widget. The backend for the widget could simply store a double counter, one for the total number of up votes, and one for the total number of down votes. But what if the marketing team later changes its mind, and in a few weeks by now, they ask you to change your rating widget into a multiple stars based system.
Fortunately for the company you are working for, you are a very farseeing person.
You consider designing your backend so that it stores the complete history of votes for a given content, for each vote there is a notation value that represents the number of stars that the user selected. Well of course for now, the user will be presented the thumb up / thumb down widget, so you have to find a way to make it fit in your super future-proof backend. Let's just say that a click will add a record with the notation `5` for a thumb up,  and `1` for a thumb down.

Now enters your reviewer Jimmy who expectedly says that your solution is too complex. Then is a perfect timing for unleashing a _He who can do more can do less_. Jimmy will be left voiceless, distraught. In his deep inside he will still have the feeling that he had a point but the magic thing is that you don't need to erase that feeling, because you just pulled the wisdom trigger that inserted doubt in Jimmy's mind and he will do the work for you.
Now he will think _He who can do more can indeed do less. Maybe I was wrong and it is a good idea. After all this marketing team is an ever changing entity_, and voilà!

The good thing about popular wisdom maxims is that you can use them to justify anything and everything. For example, the situation could very well have been the opposite, with Jimmy trying to convince you that the future-proof backend is a good idea. Then a simple _Leave well enough alone_ would have made the case.

### The false dilemma

When we are forced to make a difficult choice between two equally reasonable alternatives, that is what we call a dilemma.
Real dilemmas exist like whether going all native or hybrid for your new mobile app.

One useful manipulation technique consists of creating a false dilemma. You do that by persuading your opponent that there are only two mutually exclusive solutions to a given problem.
One solution is precisely where you want to go, and the other is very undesirable.

> Either we take the decision right now to completely review our technical stack to a trendier one, or we are completely off market in less than six months.

> &minus; I see that you based your Docker image on `rocky82/debian-8-java:latest`, I'm afraid it doesn't match our security guidelines.
>
> &minus; Let's rebuild the whole from scratch then. But I should warn you, that will have a very negative impact on our sprint velocity.

Whether you really can't stand your old stack anymore, or are too lazy to take some extra care with the containers you ship to production, these lines are worth it.
It would only require a lack of imagination from your opponent, who would not be able to realize, for example that the stack could only be partially changed fragment per fragment, or that the Docker container could use a fixed tag of the official java image from Docker hub.

### The straw man

When you face a strong argument, it is hard not to lose face. One way people sometimes react to that is by reconsidering their position, but remember that you don't want to let your coworkers win. Admitting you are wrong is not an option.

If your opponent's argument is too solid, you might as well subtlety change it by exaggerating it or by making seem like it is used to defend a lesser idea. That way, the argument is way easier to reject.
This is called a straw man, in reference to the old military training where the soldier fights against a straw man that substitutes the opponent. Of course in that case, it is admitted by all that the military man is fighting a dummy. In the context of a verbal debate, rejecting a mocked version of your opponent's argument will produce the same effect as rejecting the original one. This takes some practice in order for your straw men not to look too obvious.

> &minus; This library doesn't seem to be actively maintained, have you thought of alternatives?
>
> &minus; If you think that maintaining our own template engine is a cost effective solution, then indeed I see no reason why we should keep this dependency.

> &minus; Going open source is not that simple considering the history of the project and how it reflects the company internal policy.
>
> &minus; If you can't see the benefits of giving back to the community, then I guess we just don't share the same values.

### The perfect solution

You probably have heard of that one, and I would even bet that you already witnessed it working.
This sophism consists in rejecting a solution for the very one reason that it only address a portion of the problem.
Let's see if the following rings any bell.

> This curl command is not a faithful representation of what the user actually do on the system. Basing the test on this approach, we might as well do nothing at all!

> &minus; We have decided to remove all unused system packages from our Docker images in order to limit the potential security breaches surface.
>
> &minus; Still that won't guarantee us that our images are fully secured. Why investing in an effort that won't satisfy all our needs?

A solution doesn't need to be perfect to be the best your team can produce. That being said, this kind of argument works surprisingly well in many contexts, so feel free to give it a shot!

### The false analogy

The use of analogies is a good strategy to understand new unknown concepts by comparing them to more familiar and somehow similar ones.
For example, comparing containers to lightweight virtual machines can help someone at getting a first idea of the concept. But analogies have limits, and the more we deep into the specificities of the individual concepts, the less the analogy stays relevant.

To put it another way, the less a person knows about a given topic, the easier it will be for you to abuse of fallacious analogies. So whenever possible, take advantage of this!

> Bringing the whole Angular stack for an app as simple as that one is like using a sledgehammer to kill a gnat.
>
> -- _Unbiased anonymous React enthusiast_

### Red herring

A red herring is a diversion, something that you make up in order to mislead your opponent.
The name originates from the stories of escaped prisoners who covered their traces for the dogs with red herring in south United States.

There are many situations in which you might want to spread some red herring too. Imagine for example that your reviewer Jimmy has some security concerns about the way that you implemented your content rating widget and he comes to you to discuss them. Your response might be _Happy to hear that we do care about security in this company, considering how many bugs we have on our authorization gateway_.

This indeed smells fish from pretty far. And sure, even if the authorization gateway was that unreliable, it still would not be a valid argument for adding more security gaps, moreover, in another component.
But does Jimmy need to realize that? Of course not.

Just to put you on track, here is another example situation.

> &minus; Thank you for the good work, this new endpoint will definitely make our lives easier, if you could just update the API documentation accordingly, that would be great.
>
> &minus; I could do that, or I could focus on this framework update, don't you think that would be a better use of my time and skills?

Sometimes you feel like writing some documentation and sometimes you don't, deal with it Jimmy.

### The slippery slope

Like the red herring, the goal of the slippery slope is to create a diversion. Only this time, we invoke a chain of undesirable consequences in order to demonstrate how bad it could be if we accepted the first element. Obviously, the last element of the chain (the ultimate consequence) has to be very bad.

> &minus; This refactoring task is starting to go too far, we should clarify the scope of a first step, and set a schedule for other ones.
>
> &minus; If we do not go to the end of it, then we will never do. Inevitably after a short period of time, we will find ourselves in the impossibility to update the framework, which means no more security patches, therefore more and more open faults in production, which will create the need for more on-call weekends.

The reason why it works is that your opponent won't notice that your chain is fragile because the links are pure speculation.

### Argumentum ad hominem

This one stands for _to the person_. You can use it when it is easier to reject your opponent rather than the arguments.
Ad hominem is another diversion strategy, that must be adapted to the context. So free the creativity of the troll that sleeps inside you.

> &minus; I tried this new library in one of my personal projects, I think we should give it a shot.
>
> &minus; It's only natural coming from a Javascript developer to want to import the whole internet in the project as long as it makes something blink.

> I guess that would be reasonable if it wasn't coming from an Apple fanboy.

> You say that you learned that from your AngularJS experience? Well how do you enjoy the present my dear dinosaur?

### Reductio ad Hitlerum

Or put in other terms: playing the nazi card. This one is a kind of pre-packaged ad hominem and another verification of the [Godwin's law](https://en.wikipedia.org/wiki/Godwin%27s_law).

> You want everyone to use two spaces indents, do you know that Hitler couldn't stand four spaces indents either?

## Conclusion

These techniques (among others) can be used to defend bad ideas, but good ideas can also be poorly defended by using them.
In both cases, it remains a problem. The workspace should be a place where ideas (good and bad) are discussed honestly with logical and pragmatic arguments.

Try and spot usages of these fallacious techniques both in your coworkers argumentation, and also in yours. By being aware of our biases and how they reveal themselves, we all work for a better communication with our pairs.

## Used resources

I this article, I tried to give back only a small fraction of what the following resources address.

- [fr] [Petit cours d'autodéfense intellectuelle - _Normand Baillargeon_](https://www.amazon.fr/Petit-dautod%C3%A9fense-intellectuelle-Normand-Baillargeon/dp/2895960445)
- [fr] [Quand est-ce qu'on biaise ? - _Thomas C. Durand_](https://www.amazon.fr/Quand-est-ce-biaise-Thomas-Durand/dp/2379310009)
