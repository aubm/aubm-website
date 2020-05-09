---
title: "Extending the Kubernetes API"
date: 2020-05-09T18:00:07+02:00
draft: false
tags: [Kubernetes, Golang]
---

Kubernetes offers various way to add custom functionalities and to modify the way built-in features work.
Today I want to talk about extending Kubernetes by using custom resources and controllers.
Let's take a close look at how to do that, but first a quick story!

## Why extending Kubernetes

As I mentioned [in my previous post](/posts/the-certified-kubernetes-application-developer-and-administrator-certifications), my journey on the cloud began with [Google App Engine](https://cloud.google.com/appengine).
As a developer, I was pretty happy with the path to production of the service.
The experience was (and still is) really simple, I just had to focus on the code and the [SDK](https://cloud.google.com/sdk) would take care of the whole deployment workflow.
No additional work needed, the workloads scale automatically from zero and you can even manage traffic routing across multiple versions of an app using a very simplified interface.

All this come at the expense of some restrictions.
App Engine ([standard](https://cloud.google.com/appengine/docs/standard)) is limited to specific runtime environments and it is not a good fit for legacy or stateful applications.
At some point, I started working on a project where multi-cloud was a critical aspect of the design. Deployments had to be reproducible on various cloud environments, and for that, App Engine was not so great either.
So I turned myself on Kubernetes, and from there the code path to production obviously became a bit more complicated.

I think configuration files speak for themselves. While deploying a Go application to App Engine literally takes only an `app.yaml` file with:

```yaml
runtime: go112
service: my-app

handlers:
- url: /.*
  script: auto

env_variables:
  SOME_VAR: 'some value'
```

In order to deploy to Kubernetes, one has to build a container image, publish that image to a container registry and from there, create yaml manifests for a deployment, service and ingress. At the very minimum it will look something like this:

```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  labels:
    app: my-app
  name: my-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-app
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        app: my-app
    spec:
      containers:
      - image: my-app
        name: gcr.io/my-project/my-app:v1
        env:
        - name: SOME_VAR
          vlaue: 'some value'
        resources: {}
status: {}
---
apiVersion: v1
kind: Service
metadata:
  creationTimestamp: null
  labels:
    app: my-app
  name: my-app
spec:
  ports:
  - port: 8080
    protocol: TCP
    targetPort: 8080
  selector:
    app: my-app
  type: NodePort
status:
  loadBalancer: {}
---
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: my-app
spec:
  rules:
  - http:
      paths:
      - path: /
        backend:
          serviceName: my-app
          servicePort: 8080
```

The learning curve is higher, and yet you have a lot of additional configuration to make in order to match the feature set that App Engine offers out of the box.
To get there, one must look at ways to automatically scale the application, tune the pod lifecycle using readiness and liveness probes, figure out some way to implement canary deployments, among other things.

I was pretty proud of myself when I finally felt comfortable with Kubernetes built-ins.
I wanted to use Kubernetes for everything, constantly writing more and more yaml files.
I'd come to a point where I really enjoyed that. At least I think so. But it probably had more to do with some kind of cognitive dissonance than the fact that I actually find writing yaml to be fun.

This became quite obvious to me the day I got my first introduction to Istio.
I remember that folks around me appeared to be very pleased by the benefits it brings.
I too was really impressed by the efficiency of the solution of course, but I couldn't help myself feeling overwhelmed by the endless list of new resources and especially the new kinds added in the installation process.
I mean, it took some time for me to adopt ingress and services, and now I have to add istio gateways and virtual services on top of that. As if there was not enough yaml yet.

![Terry Crews says WHYYY?!](/img/terry-crews-says-why.jpg)

The point is, even though Kubernetes has enabled crafting reliable and repeatable deployments on various environments, we still need the simplicity of App Engine.
I was curious to see how I could leverage the extension points of Kubernetes, in order to implement a deployment workflow that would be simpler to use.

## The operator pattern

There are many [extension points in Kubernetes](https://kubernetes.io/docs/concepts/extend-kubernetes/extend-cluster/#extension-points), from kubectl plugins which add sub commands to storage plugins which add new storage types. The one I want to focus on consists in:

- adding new resource types to the Kubernetes API server, that users will be able to manipulate using standard kubectl.
- writing and deploying a program that will watch those custom resources, and take appropriate actions to reconcile the cluster state with the user desired state.

Documentation and a lot of other useful resources can be found on this approach which is commonly known as the [operator pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/).

The watcher program is called a **controller** and it makes use of custom resources defined in **custom resource definitions** or **CRDs**.

## Defining custom resources

Here is an example of what I chose to call an `Application`, which I believe is a very original and clever name.

```yaml
apiVersion: k8s-app-runner.aubm.net/v1
kind: Application
metadata:
  name: my-app
spec:
  runtime: 'node114'
  port: 8080
  entrypoint: 'app.js'
  minReplicas: 1
  maxReplicas: 10
  env:
  - name: 'SOME_VAR'
    value: 'some value'
  source:
    git:
      gitRepositoryUrl: 'https://github.com/aubm/k8s-app-runner.git'
      root: 'sample-apps/hello-node'
```

Now this definitely looks more like something I could be happy with, without having to lie to myself in the mirror every morning.

Unfortunately if you were to copy this yaml and try to kubectl apply it on your cluster, it would not work. And that's because your cluster doesn't know about version `v1` of the `Application` kind in a so called `k8s-app-runner.aubm.net` group.
You can make sure of that by running `kubectl api-resources`.

In order to create applications in your cluster, you'll first need to tell your cluster about this new type of resource.
This is what CRDs are for. You can read a lot about the concept of custom resources [in the documentation](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) and get more details about how to create CRDs [here](https://kubernetes.io/docs/tasks/access-kubernetes-api/custom-resources/custom-resource-definitions/), but in essence, this is what it looks like.

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  creationTimestamp: null
  name: applications.k8s-app-runner.aubm.net
spec:
  group: k8s-app-runner.aubm.net
  names:
    kind: Application
    plural: applications
    singular: application
  scope: Namespaced
  versions:
  - name: v1
    schema:
      openAPIV3Schema: {...}
```

As you can see a CRD is just another kind of resource in the Kubernetes API, which exists in the group `apiextensions.k8s.io`. As any other resource, it has a name and a specification.
The beauty of this is that the API can be extended dynamically at runtime, without having to recompile or even restart the API server, you just kubectl apply a CRD file and you are good to create custom resources.

The example is a truncated version of the `Application` definition as we can see by looking at the `.spec.names` section. The value of `.spec.scope` indicates that the resources are namespaced, just like pods and deployments for example, and unlike kinds like `StorageClass` or `CustomResourceDefinition` themselves.

Obviously the biggest part of the CRD, which happens to be the portion of the yaml file that I eluded in the example, is the specification of the resource itself. You can see in `.spec.versions[*].schema` that it is given as an [OpenAPI v3 specification](https://swagger.io/specification/), which is a standard for describing rest API resources.
Using this format, we can specify the properties of an application, their type, sub properties, defaults and validation constraints. [Here](https://github.com/aubm/k8s-app-runner/blob/master/bare-controller-runtime/config/crd.yaml) you can go inspect the full CRD.

Once applied in the cluster, custom resources interact nicely with standard kubectl commands.
For example use `kubectl explain applications.spec` to navigate through the specification and its sub properties.
Or use `kubectl get applications`, even with advanced formatting options like `kubectl get applications -o custom-columns=NAME:.metadata.name`, which outputs:

```
NAME
my-app
```

## Implementing the controller

> For better readibility, code snippets are shortened. The complete working code is accessible [here on Github](https://github.com/aubm/k8s-app-runner/tree/master/bare-controller-runtime). It has no comments and only serves as a reference for the code examples in the article.

Custom resources are not particularly useful by themselves, some logic needs to be implemented in a dedicated controller, which is deployed in the cluster, typically in a dedicated namespace.
Kubernetes ships a bunch of controllers for standard resources like the replication controller or the namespace controller.

Quoting the documentation for [operators in Kubernetes](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/#operators-in-kubernetes).

> You also implement an Operator (that is, a Controller) using any language / runtime that can act as a [client for the Kubernetes API](https://kubernetes.io/docs/reference/using-api/client-libraries/).

I chose to implement the application controller in Go, so I used the [sigs.k8s.io/controller-runtime](https://github.com/kubernetes-sigs/controller-runtime) package which provides _tools to construct Kubernetes-style controllers_.

Let's review how to do that.

### Minimal bootstrap

Below is a minimal code snippet, where I eluded the slightly verbose error management just to focus on the key steps of the controller bootstrap process.

Everything starts by creating a new `Manager`, which is responsible for orchestrating controllers and providing them with their shared dependencies like the API or cache clients. The `NewManager` factory takes a client configuration and a few other options which are left to their defaults here.

> Before talking about the next step, we need to take a quick pause in order to get familiar with a new key concept. The [k8s.io/apimachinery](https://github.com/kubernetes/apimachinery) package provides tools for _encoding, decoding [...] Kubernetes and Kubernetes-like API objects_. Among other things, it has this notion of a scheme, which is a registry of available object kinds. The [sigs.k8s.io/controller-runtime](https://github.com/kubernetes-sigs/controller-runtime) package makes use of a scheme to know which Go type is associated to which Kubernetes kind.

The package **k8s-app-runner.aubm.net/api** contains a type `Application` which is used for encoding/decoding the applications as defined in the CRD. The `AddToScheme` method is used to add the custom type to the manager scheme, which already has references to the built-in Kubernetes kinds (pods, replicasets, namespaces, etc...).
We'll go into more details about the implementation of that function later.

Then `NewControllerManagedBy` is used to create a controller and attach it to the manager. The controlled kind is configured using the `For` method. Here a new controller is created for applications. Finally, a `Reconcilier` is provided to `Complete` the initialization of the controller. The reconcilier is responsible for implementing the business logic.

Finally the manager is started. The controller starts watching for changes on the controlled resources.

```go
import (
	ctrl "sigs.k8s.io/controller-runtime"
	"k8s-app-runner.aubm.net/api"
	"k8s-app-runner.aubm.net/controllers"
)

func main() {
	mgr, _ := ctrl.NewManager(ctrl.GetConfigOrDie(), ctrl.Options{})

	api.AddToScheme(mgr.GetScheme())

	ctrl.NewControllerManagedBy(mgr).
		For(&api.Application{}).
		Complete(&controllers.ApplicationReconciler{})

	mgr.Start(ctrl.SetupSignalHandler())
}
```

### The reconciliation loop

The type `applicationReconciler` implements the `Reconcilier` interface, which is pretty straightforward, it only has one method which is defined as follow.

```go
import "sigs.k8s.io/controller-runtime/pkg/reconcile"

func (r ApplicationReconcilier) Reconcile(request reconcile.Request) (reconcile.Result, error) {
	log.Printf("received reconcile request for %s", request.NamespacedName)

	// do things here

	return reconcile.Result{}, nil
}
```

Each time a creation/update/deletion happens on an application, the controller executes this method. The reconcilier takes the appropriate actions to bring the system state closer than the desired state which is declared in the application specification.

What is done here mainly consists in:
- creating a deployment object, using a shared volume and init containers for downloading the app sources and its dependencies
- creating a service that expose the pods
- creating a horizontal pod autoscaler
- updating the status of the application

[Here](https://github.com/aubm/k8s-app-runner/blob/master/kubebuilder/controllers/application_controller.go) you can go check how I've implemented that part.

If for some reason the method returns an error, the controller will invoke the method again, until it eventually successfully reconciles the resource. Whether or not the method succeeds, it is possible to control if and when to call the reconcilier back by setting custom values in `reconcile.Result.Requeue` (_boolean_) or `reconcile.Result.RequeueAfter` (_standard time.Duration_). No matter what, the reconcilier will be invoked again for any new events on the controlled resources. This whole process is called the reconciliation loop.

### More details about the Application type

Below is the Go definition of the `Application` type. It is used to decode/encode all the fields of a Kubernetes application. As you see, types from `metav1` are used to avoid some boilerplate code for common fields like `apiVersion`, `kind`, `metadata.name`, etc...

```go
import metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

type Application struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   ApplicationSpec   `json:"spec,omitempty"`
	Status ApplicationStatus `json:"status,omitempty"`
}

type ApplicationSpec struct {
	Port        int32  `json:"port"`
	Runtime     string `json:"runtime"`
	MinReplicas int32  `json:"minReplicas"`
	MaxReplicas int32  `json:"maxReplicas"`
	Env         []Env  `json:"env"`
	Entrypoint  string `json:"entrypoint"`
	Source      struct {
		Git struct {
			GitRepositoryURL string `json:"gitRepositoryUrl"`
			Revision         string `json:"revision"`
			Root             string `json:"root,omitempty"`
		} `json:"git"`
	} `json:"source"`
}

type Env struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type ApplicationStatus struct {
	NodePort          []int32 `json:"nodePort,omitempty"`
	AvailableReplicas int32   `json:"availableReplicas"`
	Replicas          int32   `json:"replicas"`
}
```

There is nothing much more to say about the type itself. But how does the controller associate it to the kind `Application` of group `k8s-app-runner.aubm.net/v1`?

We know that the manager makes use of scheme to know what object kinds are available, and what Go types they are associated to.
Remember this instruction from the main function `api.AddToScheme(mgr.GetScheme())`? Now we look at what it does.

As we can see from the code below, `AddToScheme` is actually a reference to `SchemeBuilder.AddToScheme` where `SchemeBuilder`, as the name suggests, well ... builds schemes.
However we are not creating a new scheme here, instead (as mentioned earlier) `AddToScheme` will add the items of an yet-to-be-created scheme in an existing one.
We see the group name and version provided in the `GroupVersion` property, but what about the `Application` kind?

For this, we have to look at the init function, where the `SchemeBuilder.Register` method is called with an instance of `*Application`. Under the hood, `SchemeBuilder` [uses reflection to map the type of the argument to the kind name](https://github.com/kubernetes/apimachinery/blob/v0.18.2/pkg/runtime/scheme.go#L168-L182) (which is automatically determined from the name of the Go type, that is "Application").

```go
import (
	"k8s.io/apimachinery/pkg/runtime/schema"
	"sigs.k8s.io/controller-runtime/pkg/scheme"
)

var (
	SchemeBuilder = &scheme.Builder{GroupVersion: schema.GroupVersion{
		Group:   "k8s-app-runner.aubm.net",
		Version: "v1",
	}}
	AddToScheme = SchemeBuilder.AddToScheme
)

func init() {
	SchemeBuilder.Register(&Application{})
}
```

> If we look closer at `SchemeBuilder.Register`, we see that it only accepts objects of type interface `k8s.io/apimachinery/pkg/runtime.Object`. Two methods must be implemented, the first `GetObjectKind() schema.ObjectKind` is done for free by embedding the `metav1.TypeMeta` into the `Application` type, the second `DeepCopyObject() Object` is relatively boring, we'll see later how we can leverage code generation to avoid implementing this ourselves.

### Validating admission webhooks

The OpenAPI v3 specification supports validation for field values, but it has some limitations.
Let's say that we want to reject a request that attempts to create an application where `minReplicas` is greater than `maxReplicas`.

For that, Kubernetes supports another extension point which is called [_validating admission webhooks_](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook).
A validating webhook is an HTTP callback which is called by the Kubernetes API server before the object is persisted.

Building on the earlier bootstrap example, below is what needs to add in order to automatically register webhook endpoints for applications.
The `NewWebhookManagedBy` method returns a webhook builder. It has a `For` method, which takes a `k8s.io/apimachinery/pkg/runtime.Object` interface. Its [documentation](https://github.com/kubernetes-sigs/controller-runtime/blob/v0.6.0/pkg/builder/webhook.go#L50) states that _if the given object implements the admission.Validator interface, a ValidatingWebhook will be wired for this type_.
What _wired_ means here, is that an actual HTTP server will be started and will listen on port 9443 (which is explicitly specified in `NewManager` options). The path is [automatically determined based on group, version and kind](https://github.com/kubernetes-sigs/controller-runtime/blob/v0.6.0/pkg/builder/webhook.go#L164-L167) of the object type.

```go
import (
	// [...]
	"k8s-app-runner.aubm.net/api"
	ctrl "sigs.k8s.io/controller-runtime"
)

func main() {
	mrg := ctrl.NewManager(ctrl.GetConfigOrDie(), ctrl.Options{Port: 9443})

	// [...]

	ctrl.NewWebhookManagedBy(mgr).
		For(&api.Application{}).
		Complete()

	mgr.Start(ctrl.SetupSignalHandler()
}
```

The `admission.Validator` interface is pretty simple, three methods: `ValidateCreate`, `ValidateUpdate` and `ValidateDelete`, must be implemented and return an error if the configuration is invalid. Here is how it is done for applications.

```go
func (a *Application) ValidateCreate() error { return in.validate() }
func (a *Application) ValidateUpdate(old runtime.Object) error { return in.validate() }
func (a *Application) ValidateDelete() error { return nil }

func (a *Application) validate() error {
	if a.Spec.MinReplicas > a.Spec.MaxReplicas {
		return fmt.Errorf("minReplicas can not be greater than maxReplicas, minReplicas=%v maxReplicas=%v",
			a.Spec.MinReplicas, a.Spec.MaxReplicas)
	}
	return nil
}
```

Now deploying an errored application specification, using `kubectl apply`, will produce an error like the one below (more on deploying webhooks later).

```
Error from server (minReplicas can not be greater than maxReplicas, minReplicas=10 maxReplicas=3): error when creating "my-app.yaml": admission webhook "vapplication.kb.io" denied the request: minReplicas can not be greater than maxReplicas, minReplicas=10 maxReplicas=3
```

### Mutating admission webhooks

Mutating admission webhooks are a second type of webhooks.
They are executed before validation, and are used to patch the resource.
They are typically used to specify default values on created/updated resources.

The implementation is pretty similar to validating webhooks.
From the previous example, there is nothing more to add in the main function. Back in the [documentation for `For`](https://github.com/kubernetes-sigs/controller-runtime/blob/v0.6.0/pkg/builder/webhook.go#L49), _if the given object implements the admission.Defaulter interface, a MutatingWebhook will be wired for this type_. Below is how I implemented the interface so that a new annotation is automatically added to every created/updated application.

```go
func (a *Application) Default() {
	if a.ObjectMeta.Annotations == nil {
		a.ObjectMeta.Annotations = map[string]string{}
	}
	a.ObjectMeta.Annotations["from-application-mutator-with-love"] = "Hello there"
}
```

### Admission webhooks for core objects

In the previous examples, I used `mgr.NewWebhookManagedBy` to register new webhooks in a very convenient way.
This works fine for custom resources, but because you can't add methods to external Go types, you can't use it for creating webhooks on built-in resources.
If I wanted to do the same thing for pods, then I'd need to register a webhook "the hard way". Let's see how to do that by reviewing the below example.

Now, instead of `NewWebhookManagedBy`, I used `GetWebhookServer` to get the server and directly register webhooks to it.
Registering a webhook takes a path (which has to be set manually), and a standard `http.Handler`.
It is possible to implement the handler directly, (the [documentation](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-request-and-response) provides all the details about the API contract), but here I preferred using `sigs.k8s.io/controller-runtime/pkg/webhook.Admission` which implements `http.Handler`, while delegating the core logic to the `Handle` method of `applicationValidator` struct, which is easier to implement.

The rest of it consists in decoding the request object, modifying it and creating a json patch, which is a `[]byte`.
Hopefully the helper function `admission.PatchResponseFromRaw` can help with that.

```go
import (
	// [...]

	"context"
	"encoding/json"

	corev1 "k8s.io/api/core/v1"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/webhook"
	"sigs.k8s.io/controller-runtime/pkg/webhook/admission"
)

func main() {
	mgr := ctrl.NewManager(ctrl.GetConfigOrDie(), ctrl.Options{Port: 9443})
	
	// [...]

	hookServer := mgr.GetWebhookServer()
	hookServer.Register("/mutate-pod", &webhook.Admission{Handler: &podMutator{}})

	mgr.Start(ctrl.SetupSignalHandler())
}

type podMutator struct {
	decoder *admission.Decoder
}

func (m *podMutator) Handle(ctx context.Context, req admission.Request) admission.Response {
	pod := &corev1.Pod{}
	m.decoder.Decode(req, pod)

	if pod.Annotations == nil {
		pod.Annotations = map[string]string{}
	}
	pod.Annotations["from-pod-mutator-with-love"] = "Hello there"

	marshaledPod := json.Marshal(pod)
	return admission.PatchResponseFromRaw(req.Object.Raw, marshaledPod)
}

func (m *podMutator) InjectDecoder(d *admission.Decoder) error {
	m.decoder = d
	return nil
}
```

> Implementating `InjectDecoder(d *admission.Decoder) error` is optional. If it is implemented, an `*admission.Decoder` will be injected automatically. It provides helper method to decode Kubernetes-like API objects.

> Fun fact: in its current implementation, Istio uses a similar approach in order to automatically [inject the `istio-proxy` sidecar container](https://github.com/istio/istio/blob/master/pkg/kube/inject/webhook.go) into pods. It doesn't use `sigs.k8s.io/controller-runtime` though, but `k8s.io/apimachinery/pkg/runtime`, which is used under the hood by `sigs.k8s.io/controller-runtime`.

Finally, manually registering a validating webhook is quite similar to a mutating webhook. Instead the `admission.Response` doesn't contain a json patch, but information about whether or not the resource is ok to be created/updated.

```go
import (
	// [...]
	"sigs.k8s.io/controller-runtime/pkg/webhook"
	"sigs.k8s.io/controller-runtime/pkg/webhook/admission"
)

func main() {
	// [...]

	hookServer.Register("/validate-pod", &webhook.Admission{Handler: &podValidator{}})

	// [...]
}

type podValidator struct {}

func (v *podValidator) Handle(ctx context.Context, req admission.Request) admission.Response {
	if getRandomInt() % 2 != 0 {
		return admission.Errored(http.StatusBadRequest, errors.New("bad karma"))
	}
	return admission.Allowed("")
}
```

Go further by consulting the [documentation](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#write-an-admission-webhook-server). It provides useful information and more examples for writing an admission webhook server.

## Deploying the controller

At this point, we know more about how to build a controller and run it on a local machine.
But in real life, a controller runs as a pod in the cluster.
To make that happen, we still have to setup a few things.

Once available as a base container image, controllers are generally deployed in their own namespace, typically using a `Deployment`object. Based on that, here is what we need.

> If you want to go and directly review the manifests, you can find them [here](https://github.com/aubm/k8s-app-runner/blob/master/bare-controller-runtime/config/target/manifests.yaml).

### A service

For the Kubernetes API server to be able to successfully contact the webhooks, we need to expose our controller pod with a clusterIP service. Nothing special about that service, I chosed port 443, and the target port should be the one configured in manager options, that is 9443.

### TLS configuration

The Kubernetes API server uses HTTPS when it needs to call the webhooks.
For the deployment to support that, a SSL certificate (`tls.crt`) and key (`tls.key`) must be provisioned in the `/tmp/k8s-webhook-server/serving-certs` folder in the controller pod.

> This is the default path. It can be changed by setting `CertDir` in the manager options.

Convenient solutions exist like [Cert Manager](https://cert-manager.io/docs/installation/kubernetes/) for provisioning SSL certificates. Here I'm just using openssl to manually generate a certificate authority (CA) key pair, and use it to sign a certificate request for the controller. More on managing TLS certificates in a Kubernetes cluster [here](https://kubernetes.io/docs/tasks/tls/managing-tls-in-a-cluster/).

```bash
# Generate a key for the CA, outputs ca.key
openssl genrsa -out ca.key 2048
# Generate a certificate for the CA using ca.key, outputs in ca.crt
openssl req -x509 -new -nodes -key ca.key -subj "/CN=my-ca" -days 10000 -out ca.crt

# Generate a key for the controller, outputs tls.key
openssl genrsa -out tls.key 2048
# Generate a certificate signing request (CSR) for the controller, outputs tls.csr
openssl req -new -key tls.key -subj "/CN=k8s-app-runner-webhook-service.k8s-app-runner-system.svc" -out tls.csr
# Sign tls.csr using the CA key, outputs tls.crt
openssl x509 -req -in tls.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out tls.crt -days 10000
```

> When generating the CSR for the controller, it is important that the CN (common name) associated to the certificate matches the url that the Kubernetes API server will call, that is `<serviceName>.<serviceNamespace>.<svc>`. See the note in https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#configure-admission-webhooks-on-the-fly

Once this is done, you can create a [TLS secret](https://kubernetes.io/docs/concepts/configuration/secret/) and mount it in the controller deployment.

### Webhook configuration objects

We need some way to tell the API server to invoke the webhooks for the appropriate resources and operations.
Kubernetes let us configure this on the fly by creating `MutatingWebhookConfiguration` and `ValidatingWebhookConfiguration` objects.

Examples can be found in the [documentation](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#configure-admission-webhooks-on-the-fly), a couple attention points are worth mentionning.

1) `webhooks[*].clientConfig.service.port` is where you configure the port of the service configured in front of the controller deployment. By default, the API server uses port 443, which is the one I configured ealier.
2) `webhooks[*].clientConfig.caBundle` is where you configure the CA certificate used to sign the controller CSR. It must be a base64 encoding of the certificate in pem format. Based on the previous commands, you can get it by running the below commands.

```bash
openssl x509 -in ca.crt -out ca.crt.pem
cat ca.crt.pem | base64
```

> One more thing, if you've taken a look at the complete manifests, you may have noticed [this extra configuration](https://github.com/aubm/k8s-app-runner/blob/master/bare-controller-runtime/config/target/manifests.yaml#L194-L199). This is done to prevent the pod mutating webhook from intercepting its own creation, which would result in a deadlock. More on that [here](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#avoiding-deadlocks-in-self-hosted-webhooks).

### RBAC configuration

When running outside of the cluster, the controller uses the local [kubeconfig](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/).
When running in the cluster, the controller must be granted the appropriate permissions to create/update/delete/list/watch the desired resources.

You can consult the [documentation](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) to get more information about role based access control (RBAC) in Kubernetes, or you can check the [configured cluster role and cluster role binding for our example controller](https://github.com/aubm/k8s-app-runner/blob/master/bare-controller-runtime/config/target/manifests.yaml#L211-L259).

## Go faster with controller-gen

Now we are all set! You might think that it took quite a lot of work to get there.
Writing the CRD, the RBAC configuration and the webhooks configuration is indeed really time consuming, especially given the fact that you have to keep them in sync with the actual code. Besides, if you remember the backstory, the whole point of this was to write less yaml!

Fortunately, you don't have to do this all by hand, instead you can use code generation. [This Github repository here](https://github.com/kubernetes-sigs/controller-tools) hosts a tool called **controller-gen**. It uses comment markers to extract information from the code, and automatically generate yaml files, or even some boilerplate code.

You can install controller-gen by running the below command. Also make sure to add `"$(go env GOPATH)/bin"` to your system `PATH`.

```bash
GO111MODULE=on go get -v sigs.k8s.io/controller-tools/cmd/controller-gen
controller-gen --version
```

### The runtime.Object interface

If you remember earlier, I mentionned a way to generate the `DeepCopyObject` method, required by the `Application` type to implement the `runtime.Object` interface. Here is how to do it using controller-gen.

In the file where `Application` is declared, annotate `Application` with the comment marker `// +kubebuilder:object:root=true` placed on top of the type declaration. Because of this annotation, controller-gen understands that the type is meant to be used as a `runtime.Object` and so it will add the `DeepCopyObject` method to it. Because of the way controller-gen implements the method, additional methods also must be added on non-scalar `Application` properties and their sub-properties. To make that happen, each type declaration can be annotation with a `// +kubebuilder:object:generate=true` comment marker, alternatively a single one can be placed at package level, as in the example below.

```go
// +kubebuilder:object:generate=true
package api

// [...]

// +kubebuilder:object:root=true
type Application struct {
	// [...]
}

// [...]
```

Now run `controller-gen object paths="."` and let controller-gen generate the boilerplate code for you.

> One can [use `go generate`](https://blog.golang.org/generate) or a tool like [make](https://www.gnu.org/software/make/manual/make.html) in order to integrate it more naturally in the build process.

The content is generated in a file named `zz_generated.deepcopy.go` (which of course should not be edited), go check the result [here](https://github.com/aubm/k8s-app-runner/blob/master/bare-controller-runtime/api/zz_generated.deepcopy.go) to see what it looks like.

More details about Object/DeepCopy markers in the documentations [here](https://book.kubebuilder.io/reference/markers/object.html).

### Generate CRDs

CRDs can be generated by controller-gen. But first, some minor adjustments need to be made in the `Application` type declaration.
Because CRDs generation with controller-gen [doesn't support nested fields with anonymous type](https://github.com/kubernetes-sigs/controller-tools/blob/v0.3.0/pkg/crd/schema.go#L322-L324), `Application` needs to be broken down as follow:

```go
type ApplicationSpec struct {
	// [...]
	Source      ApplicationSource `json:"source"`
}

type ApplicationSource struct {
	Git ApplicationSourceGit `json:"git"`
}

type ApplicationSourceGit struct {
	GitRepositoryURL string `json:"gitRepositoryUrl"`
	Revision         string `json:"revision"`
	Root             string `json:"root,omitempty"`
}
```

Then comment markers must be added at package level in order to specify the group and version.

```
// +groupName=k8s-app-runner.aubm.net
// +versionName=v1
package api
```

> If not specified, versionName will use the go package name by default. A good pattern consists in structuring the code under a tree like `api/v1/types.go`. That way, it is easier to add new versions, and a bit less configuration is required for generating CRDs.

Now from the root directory, run `controller-gen crd paths="./..."` and get the CRDs generated under the `config` directory.
Get more options (like CRDs version, or output path) by checking `controller-gen --help`, also go and read the documentation to learn how to customise CRDs by adding validation rules or short names:

- https://book.kubebuilder.io/reference/markers/crd.html
- https://book.kubebuilder.io/reference/markers/crd-validation.html
- https://book.kubebuilder.io/reference/markers/crd-processing.html

### Generate RBAC

Generating RBAC works the same way, documentation for markers is available [here](https://book.kubebuilder.io/reference/markers/rbac.html). Generally a good idea is to place them next to the controller code, that needs the permissions. The example below will add permissions to get, list, watch, update, patch and delete applications, and also get, update and patch an application's status.

Generate a `ClusterRole` named `manager-role` by running `controller-gen rbac:roleName=manager-role paths="./..."`.

```go
// +kubebuilder:rbac:groups=k8s-app-runner.aubm.net,resources=applications,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=k8s-app-runner.aubm.net,resources=applications/status,verbs=get;update;patch

func (r ApplicationReconcilier) Reconcile(request reconcile.Request) (reconcile.Result, error) {
	// [...]
}
```

### Webhooks

Finally, controller-gen has support for generating webhooks definition files. There again, documentation is available [here](https://book.kubebuilder.io/reference/markers/webhook.html). In the example below you can see how to write a marker to generate a `MutatingWebhookConfiguration` with the command `controller-gen webhook paths="./..."`.

```go
// +kubebuilder:webhook:path=/mutate-k8s-app-runner-aubm-net-v1-application,mutating=true,failurePolicy=fail,groups=k8s-app-runner.aubm.net,resources=applications,verbs=create;update,versions=v1,name=mapplication.kb.io

func (a *Application) Default() {
	// [...]
}
```

## Kubebuilder

And that's about it! You've seen everything you need to start creating your own operator.
Congratulations and thank you for making it through here!

Before you go, you might want to hear about [Kubebuilder](https://github.com/kubernetes-sigs/kubebuilder).
Kuberbuilder is a framework for extending the Kubernetes API with custom resources and controllers.
You really want to consider using it for your next operator.
What it does essentially, is scaffolding a project with all the pieces from **controller-runtime** and **controller-gen** put together, so that you can get started right away with coding.

Take a look at the documentation [here](https://book.kubebuilder.io/) and don't hesitage to join the very welcoming community on the _#kubebuilder_ channel on [kubernetes.slack.com](https://kubernetes.slack.com/)!

## What else can an operator do?

The [Kubernetes documentation](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/#example) mention a few examples of what an operator can do.

From deploying an application on demand to orchestrating distributed stateful systems like [Elasticsearch](https://www.elastic.co/fr/elasticsearch) or [Apache Spark](https://spark.apache.org/), operators can do a lot.
Projects like [Istio](https://istio.io/) or [Knative](https://knative.dev/) are great examples, but more can be found on [OperatorHub.io](https://operatorhub.io/), which is a dedicated portal for reusable operators.

## Useful resources

- [Google Cloud Blog - Best practices for building Kubernetes Operators and stateful apps](https://cloud.google.com/blog/products/containers-kubernetes/best-practices-for-building-kubernetes-operators-and-stateful-apps)
- [Kubebuilder book](https://book.kubebuilder.io/)
- [KubeCon NA 2019 - Writing a Kubernetes Operator: the Hard Parts - Sebastien Guilloux, Elastic](https://www.youtube.com/watch?v=wMqzAOp15wo)
