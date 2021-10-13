# fika
The fika slackbot

# About the Project

Currently a work in progress / Proof of concept

Intention of this project is to automatically generate small personal 1:1 meetings among members of a slack community, while not disrupting the primary purpose of the channel itself, and respecting a rate-of-enagagement that the user is comfortable with.

The current available functionality allows:
- a user to add `/fika add` or remove `/fika remove` themselves from a channel in slack.
- a user to view the current list of subscriptions `/fika list`
- automaticaly create pairings via an endpoint `/index/assign-groups`

Future enhancements:
- generate pairings based on preferences (channel/frequency)


## Built With
- NodeJS (Node version 12 as Netlify only supports Node 12)
- MongoDB using mongoose
- Free-tier hosting on netlify


# Getting Started
To get a local copy up and running follow these steps.

## Prerequistes
- npm
```
npm install npm@latest -g
```
- netlify
```
npm install netlify-cli --global
```

## Installation

### Slack Account Setup
* Create a workspace on slack.com where you are the admin
* Create new app using the manifest `slack.manifest.yml` file
* Copy Signing Secret
	* Basic Information > App Credentials > Signing Secret
	* Setup Netlify environment variable described below
* Copy Bot User OAuth Token
	* OAuth & Permissions > OAuth Tokens for Your Workspace > Bot User OAuth Token
	* Setup Netlify environment variable described below


### MongoDB Account Setup
* Create an account on mongodb.com
* Create a new Database cluster
* Create a user account with read/write permissions for readWriteAnyDatabase
* Create network access to be open to public (Super gross, unfortunately.  So create temprorary access while in development)
* Copy the database connection string.
	* Databases > Cluster > Connect > Connect your Application
		* Choose Driver: Node.jS
		* Version: 4.0 or later
	* Setup Netlify environment variable described below


### Netlify Account Setup
* Create account on netlify.com
* Get started with Netlify by following this [guide](
https://www.netlify.com/blog/2016/09/29/a-step-by-step-guide-deploying-on-netlify/).
* Create environment variables for netlify:
	* MONGODB_URI: Copied from MongoDB Setup
	* SLACK_BOT_TOKEN: Copied from Slack Setup
	* SLACK_SIGNING_SECRET: Copied from Slack Setup



### Local Environment
1. Clone the repo
```
git clone https://github.com/github_username/repo_name.git
```
2. Install NPM packages
```
npm install
```
3. Build project
```
npm run build
```
4. Run netlify in dev mode
```
netlify dev --live
```
5. Update Slack command endpoint to point to generated netlify url


### Assign Groups Scheduled Task
* There is a github action set for a scheduled task.  Currently it is set to run every minute, however, github changes that frequency to every 10 minutes or so.
* To setup the github action, create an environment variable ASSIGN_GROUPS_ENDPOINT pointing to the netlify endpoint for assign groups.


# External Resources
* [Get Started on Netlify](https://www.netlify.com/blog/2016/09/29/a-step-by-step-guide-deploying-on-netlify/)
* [Netlify and MongoDB Connection](https://stephencook.dev/blog/netlify-mongodb/)


