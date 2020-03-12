---
title: "Firebase in action: implementing my Theme snap app"
date: 2020-03-12T21:53:04+01:00
draft: true
tags: [Firebase, Firestore, GoogleCloudPlatform]
---

I recently published a web app named Theme snap. It is a game where players have to take pictures that best match a given theme.
The better the picture matches the theme, the more points the player earns.

This idea was a great opportunity to experiment with new tools. I decided to go with Firebase, because the majority of the platform
capabilities could be turned into features for the app. In this article, I want to present an overview of these capabilities, and
also provide some feedback for those of you who might be interested to start.

## About the app

The theme is selected randomly from a list of predefined keywords that can be anything from "cat" to "landscape".
Everyday, a new theme is selected and players have the opportunity to upload a new picture.
Players can only upload one picture per theme and it can't be a picture from the internet, it has to be an original one.

For each picture upload, a score of relevance is automatically calculated. The score, which is between 0 and 100, is added to the
player's total of points, and this affects the current game ranking. Every month, a new season starts, which means that the current
ranking is archived and a new one is initiated.

## Authentication


## Firestore

### Structuring the data

### Security rules

### Complex queries

TODO: talk about actionnable errors.

## Cloud Functions

### Storage events

### Database changes

### HTTP requests

### Cron

## Storage

### Security rules

### Lifecycle rules

Players upload their picture to the cloud only for the purpose of computing a score out of it.
It is never served back to the users, so the system has no use of keeping it stored on the bucket.

Once the score is calculated, the code in the cloud function could delete the file.
However, because the cloud function could unexpectedly fail, leaving the state dirty, I figured that the most reliable
way of cleaning the expired images was to leverage bucket lifecycle rules.

TBC

## Hosting

## Cloud Messaging

## Local testing
