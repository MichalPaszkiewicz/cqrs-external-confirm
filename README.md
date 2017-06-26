# cqrs-external-confirm #

[![npm version](https://badge.fury.io/js/cqrs-external-confirm.svg)](https://badge.fury.io/js/cqrs-external-confirm)

cqrs-external-confirm is an add-on for [cqrs-react-router](https://www.npmjs.com/package/cqrs-react-router) that helps you integrate a CQRS/Event Sourcing front end with a back end that may or may not follow these patterns.

It allows super-quick user interaction and an easy way of allowing an offline service.

## typescript support ##
cqrs-external-confirm is written in typescript and therefore will always support typescript

## how to contribute ##
feel free to submit pull requests, just please provide clear notes as to what your update will change.
Pull requests that cause tests to fail will not be accepted.

## how to install ##
you will need npm. 
this project is an extension for [cqrs-react-router](https://www.npmjs.com/package/cqrs-react-router), so you will most likely need both:
```
npm install cqrs-react-router --save
npm install cqrs-external-confirm --save
```

## how to use ##
Once you have installed this project, you just need to register the endpoint to be called for each command name in your project. Then you attach your application service to the ExternalConfirmer and hey presto, you're done!

```javascript
var externalConfirmer = new ExternalConfirmer();
externalConfirmer.registerCommandEndPoints([
    new CommandEndPoint("Hobble around uselessly", "http://zombiehivemind.com/api/inactive"),
    new CommandEndPoint("Chase brains", "http://zombiehivemind.com/brains"),
    new CommandEndPoint("Bite human", "http://zombiehivemind.com/bite"),
])
externalConfirmer.attachToApplicationService(ApplicationService.Instance)
```

## what does it actually do? ##
cqrs-external-confirm attaches to the ApplicationService's onCommandValidated event.

The full state flow for a cqrs-react-router application is now:

Command  
 |  
 |  
 V  
Command Validator  
 |  
 |  
 V  
Command Handler  
 |  
 |---------> cqrs-external-confirm  
 |  
 V  
DomainEvent  
 |  
 |  
 V  
View  
 |  
 |  
 V  
View Subscriber

cqrs-external-confirm calls an external API asynchronously, allowing the browser to continue handling the event as if everything was fine.

If the external system confirmation is successfull, nothing further needs to be done on the browser side, as everything is going as planned.

In the event of a failure, cqrs-external-confirmer will react differently depending on whether it is a server error or client error.

If the server is down temporarily, cqrs-external-confirmer provides a retry policy that will ensure the front end system will reconcile with the server.

If the failure is legitimate, the application will replay the state up to the point of a failure, allowing a smoother reconciliation of the events with the external system.

## updates ##
### 0.0.6 ###
Default number of retries is now 5

`RequestQueue` has method `onEnquiryFailing(stopOnEnquiryFailed: (enquiry, requestQueue) => boolean)` which allows more detailed checks as to what is happening inside the request queue. The return value of the callback should be a boolean, which is to be `true` if the failure has been handled sufficiently so that the `onEnquiryFailed` events don't have to be triggered.

### 0.0.3 ###
RequestQueueOptions specified - you can now set your retry options more specifically.
```javascript
enum RetryPolicy{
    NoRetry,
    Retry,
    RetryExponential
}

var policy = new RequestQueueOptions(RetryPolicy.Retry, startRetryDelay, maxNumberOfRetries);

var externalConfirmer = new ExternalConfirmer(policy);
```
