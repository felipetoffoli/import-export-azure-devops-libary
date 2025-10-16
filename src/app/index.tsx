import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";
import { App } from "./App";

SDK.init({ loaded: false, applyTheme: true });

SDK.ready().then(() => {
  ReactDOM.render(<App />, document.getElementById("root"));
  SDK.notifyLoadSucceeded();
});
