---
title: "The Certified Kubernetes Application Developer and Administrator Certifications"
date: 2020-04-26T15:00:07+02:00
draft: false
tags: [Kubernetes]
---

After a few years of daily work with Kubernetes, I decided to become a [Certified Kubernetes Application Developer](https://www.cncf.io/certification/ckad/) (CKAD) as well as a [Certified Kubernetes Administrator](https://www.cncf.io/certification/cka/) (CKA).
As I've just taken and successfully passed the exams, I figured this was a good opportunity for a story.

## My background experience

My first steps with Kubernetes go back a few years ago, when I began experiencing on Google Cloud Platform and was amazed by how easy and fun it was to deploy applications on Google App Engine.
At some point I was in charge of deploying an API gateway product named [Kong](https://konghq.com/kong/).
Looking at the options that I had, I decided to go with Google Kubernetes Engine (GKE) (or [Google Container Engine as it was named back then](https://cloud.google.com/blog/products/gcp/introducing-certified-kubernetes-and-google-kubernetes-engine)).
Kubernetes still was a new thing at the time, and Kong didn’t have the level of maturity that it seems to have now (having taken a quick look at the [documentation](https://docs.konghq.com/2.0.x/kong-for-kubernetes/install/#yaml-manifests), Kong now seems to be very well supported on Kubernetes, integrated with custom resource definitions for persisting configurations, which is kind of cool).
In fact, there were very few feedbacks from other companies and I'd only found one pretty basic example available for deploying Kong with Cassandra as a backend in Kubernetes.
This example leveraged an alpha resource named PetSet (which was eventually renamed to Statefulset) for supporting Cassandra.

I had a limited time for figuring it all out, and it sure was a lot to assimilate at once.
From the perspective of a junior Google App Engine enthusiast, Kubernetes was a whole new world, and I can tell from experience that deploying a distributed database is not the easiest way to get started. I felt like as thought I was to take the order for a whole table in a restaurant in Japan without knowing the first things about the language.

In the end it wasn't that much trouble to make it work as I could mostly rely on the example that I mentioned, bringing a few minor adjustments to it. Besides, I was already familiar with Docker basics, which was a good thing, not having to add the containers to the list of already confusing enough new concepts, not to mention yaml overflow.

![Yaml everywhere](/img/yaml_everywhere.jpg)

Even though I didn’t feel like I had fully get what I had done, it had sure made me want to dig more into Kubernetes.
So I took it all over from the start, taking more time for reading the documentation and getting some hands-on experience with basic concepts such as pods and replica sets.

Afterwards, I got an opportunity to work on this very exciting new project and Kubernetes was in the center of it.
I worked there for about 3 years and it was a really good opportunity to gain some real world experience.
I became more and more confortable with deployments and statefulsets, how to configure them using configmaps and secrets, and how to expose them using services and ingresses.
I was getting more and more enthusiastic about how well Kubernetes integrates with other Google Cloud services, like when connecting Kubernetes service accounts to the Google Cloud IAM using Workload Identity.

In the end we managed a lot of resources, including cronjobs, horizontal pod autoscalers, network policies and pod security policies. Also we'd had to implement and improve our continuous delivery pipeline which relied on tools like Terraform and Helm.

## Why I wanted to get certified

Preparing the CKAD exam is an opportunity to become familiar with developing and running applications in Kubernetes.
As I already had that kind of experience, I think a small part of myself wanted to assert that somehow, I had assimilated what it takes to legitimately want to invest that knowledge into new projects.
As I was about to engage new relations and partnerships, I figured this would pledge for my credibility, as well as my company's.

On the other hand, I took advantage of my preparation for the CKA exam to deepen some knowledges about concepts which I was unfamiliar with. It was a good goal and source of motivation for digging deeper and understanding more about Kubernetes itself.
Indeed, most of my experience was built on GKE which is fully managed Kubernetes service. For this reason, I knew quite little about the components of the control plane. I had barely played with Minikube and had no idea of how to install my own instance of Kubernetes.

I like to create things and for that I actually want to code. I'm good with fully managed services and I don’t really want to operate Kubernetes clusters myself. But I definitely feel more confortable using Kubernetes now that I know the basics on how it is configured, how it can be customized, etc.

Maybe it's like driving. You don't actually need to know how to assemble a car to drive it, you could just lease it.
But it is always good to have a clue on how to react to that funny noise that it was not making before, or whether or not you should panic when that particular red light indicator starts to blink.
It's actually sort of funny that I use that specific metaphor, because even though now I can get a Kubernetes cluster up and running the hard way, from scratch, I'm quite sure I wouldn't manage to change a tire on my own even if I had to.

![I asked a CKA to fix my microwave, without success](/img/cka_microwave.jpg)

Now with these new tools, I'll be able to faster diagnose errors and determine if they are more likely to come from a configuration at the cluster or resource level, which I think is a good win.

## About the exams

This is only my experience, but I wanted to mention a few things that I think have contributed to my success to the exams.

To begin, once registered, I took the time to read the provided candidate handbook.
It's a thirty pages long PDF, with a lot of repeated detailed information about the conditions of the exams. It's not exactly fun to read, however as the exam conditions are pretty strict, some points are worth knowing before showing up at due date.

Even though I had enough experience for the CKAD exam, getting a glance of the test environment by taking a few trainings on [KodeKloud](https://kodekloud.com/) really was a big plus. If I didn't learn any new concepts (meaning from the CKAD class), getting used to using `kubectl` more intensively by manipulating some advanced flag parameters, as well as practicing search in the official documentation of Kubernetes definitely enhanced my velocity, which is good for the exams.

Finally, I want to mention the amazing work of [Mumshad Mannambeth on his Kubernetes classes on Udemy](https://www.udemy.com/user/mumshad-mannambeth/) which come with free access to KodeKloud for practicing with real Kubernetes clusters. I would definitely recommend them, especially if you don't have much experience.
