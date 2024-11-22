---
layout: post
current: post
cover: images/posts/2024/11/rspec.png
navigation: True
title: When to use request or system specs when testing Rails applications
date: 2023-11-03T11:50:58
tags: 
class: post-template
subclass: 'post'
---

I have an admission, I have completely over used system specs in my time as a Rails dev - which is a long time now!

For various reasons I have always reached for the system spec as my hammer of choice for testing browser interaction, redirects, page content and probably other things that I can’t even remember right now. 

On my last greenfield project I decided I’d try and learn a bit more and try to do it “right”. 

The rough set of rules I’ve come up with now are:

* Page redirection (successful form submission): request specs 
* HTTP status checks (unauthorized etc.): request specs
* Page content: system specs 
* Page interaction (JS/CSS dynamic updates): system specs 

Even though system specs will let you test page redirections, content and page interaction you do pay quite a time and resource penalty with often spinning up a headless browser when it’s not required. In the pre-Turbo (or even TurboLinks) days you could get away with using the rack driver for a lot which didn’t incur quite as much of a penalty. Now however you really need to run a full headless browser to ensure that you’re testing even close to a similar interaction as a site visitor would be carrying out. 

One reason for using system specs for everything is that you do have a single place for testing the entire stack top to bottom. On certain codebases or team sizes that could be a big advantage and is worth the time/resource penalty that comes with a headless browser. 

On a small codebase with either a single developer or very well defined conventions I think that you can be a bit more nuanced with your approach to testing. 

Testing redirects with a request spec are very very fast and can make it easier to test the results of various types of form submissions, for example. The same goes for HTTP response handling with request specs. Depending on what you want to get from your tests, quickly testing the response type and having another test elsewhere for testing how the browser handles the response codes (with an error page, for example) can start to add up to quite a bit of time savings. 

I’ve just started dipping my toes into the world of view specs and I'm starting to get the hang of them a bit now, they seem to be helping me think of partials in particualr as components due to the way you need to stub out the inputs to them. More on that in a later post!