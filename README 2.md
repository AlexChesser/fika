# Netlify Functions TypeScript template

TypeScript template for Netlify Functions. Prints "Hello, World" in the browser.

## If you're forking this template from GitHub

- Run `npm install` to install all node dependencies.
- Install Netlify CLI globally using the command `npm install netlify-cli -g`.
- To run this function locally, you'll need to link your Netlify site with your repository. Easiest way is to create a `.netlify` folder and inside that, create a `state.json` file with the following contents. Get your site id or API id from the site settings and paste it here. Then run the command `netlify link`.

```json
{
	"siteId": "PASTE YOUR API ID HERE"
}
```

- Run `netlify build` to build your code and generate a function. This command uses the settings in the `netlify.toml` file to run a build command. The build command compiles TypeScript files into JavaScript and automatically creates the required `netlify/functions` folder for you and places the `index.js` function file inside this folder.
- Run `netlify dev` to start a local development server to test your function. If the local server starts at port 8888, then the URL to access this function is `http://localhost:8888/.netlify/functions/index`.
