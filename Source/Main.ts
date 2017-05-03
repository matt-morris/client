// "static" imports
import "babel-polyfill";
import "webpack-runtime-require";
//import {Require} from "webpack-runtime-require";
import "./Frame/General/Start_0";
import "./Frame/General/CE";
import "./Frame/General/Start_1";
import "./Server/Server";
import "codemirror";
import "codemirror/addon/scroll/simplescrollbars";

import * as ReactDOM from "react-dom";
import {Store} from "redux";
import {RootState} from "./Store/index";
import {FirebaseApp} from "./Frame/Database/DatabaseHelpers";
import {CurrentUrl, URL} from "./Frame/General/URLs";
import * as Raven from "raven-js";
import * as injectTapEventPlugin from "react-tap-event-plugin";
//import Promise from "bluebird";

// startup (non-hot)
// ==========

//g.Extend({Promise});
/*function PromiseWrapper(...args) {
	//let promise = Promise.apply(this, ...args);
	let promise = new Promise(...args);

	//promise._setAsyncGuaranteed(false);
    //this._bitField = this._bitField | 134217728;
    promise._bitField = promise._bitField & (~134217728);
	return promise;
}
for (var key in Promise)
	PromiseWrapper[key] = Promise[key];
g.Extend({React, Promise: PromiseWrapper});*/

// Tap Plugin
injectTapEventPlugin();

let startURL = URL.Current();
declare global { export var startURL: URL; } g.Extend({startURL});

//let {version, env, devEnv, prodEnv, testEnv} = __DEV__ ? require("./BakedConfig_Dev") : require("./BakedConfig_Prod");
let env = __PROD__ ? "production" : "development";
if (startURL.GetQueryVar("env") && startURL.GetQueryVar("env") != "null") {
	env = startURL.GetQueryVar("env");
	//alert("Using env: " + env);
	console.log("Using env: " + env);
}
g.Extend({env}); declare global { var env: string; }

let env_short = env == "production" ? "prod" : "dev";
let devEnv = env == "development";
let prodEnv = env == "production";
let testEnv = env == "test";
g.Extend({env_short, devEnv, prodEnv, testEnv}); declare global { var env_short: string, devEnv: boolean, prodEnv: boolean, testEnv: boolean; }

//let {version} = require("../../../package.json");
// Note: Use two BakedConfig files, so that dev-server can continue running, with its own baked-config data, even while prod-deploy occurs.
// Note: Don't reference the BakedConfig files from anywhere but here (in runtime code) -- because we want to be able to override it, below.
let {version, dbVersion, firebaseConfig} = devEnv ? require("./BakedConfig_Dev") : require("./BakedConfig_Prod");
g.Extend({version, dbVersion, firebaseConfig}); declare global { var version: string, dbVersion: number, firebaseConfig; }

if (prodEnv) {
	Raven.config("https://40c1e4f57e8b4bbeb1e5b0cf11abf9e9@sentry.io/155432", {
		release: version,
		environment: env,
	}).install();
}

// You know what? It's better to just disable this until you specifically want to use it... (causes too many seemingly-false-positives otherwise)
/*if (devEnv) {
	// this logs warning if a component doesn't have any props or state change, yet is re-rendered
	const {whyDidYouUpdate} = require("why-did-you-update");
	whyDidYouUpdate(React, {
		exclude: new RegExp(
			`connect|Connect|Link`
			+ `|Animate|Animation|Dot|ComposedDataDecorator|Chart|Curve|Route|ReferenceLine|Text` // from recharts
			+ `|Div` // from ScrollView (probably temp)
			+ `|Button` // from react-social-button>react-bootstrap
			+ `|VReactMarkdown`
		),
	});
}*/

// hot-reloading
// ==========

/*let hotReloading = false;
G({hotReloading}); declare global { let hotReloading: boolean; }*/
g.hotReloading = false;
declare global { let hotReloading: boolean; }

// this code is excluded from production bundle
if (__DEV__) {
	/*if (window.devToolsExtension)
		window.devToolsExtension.open();*/
	if (module.hot) {
		// setup hot module replacement
		module.hot.accept("./Main_Hot", () => {
			hotReloading = true;
			setTimeout(()=> {
				ReactDOM.unmountComponentAtNode(document.getElementById("root"));
				LoadHotModules();
			});
		});
	}
}

function LoadHotModules() {
	//Log("Reloading hot modules...");
	require("./Main_Hot");
}

//setTimeout(()=>LoadHotModules());
LoadHotModules();