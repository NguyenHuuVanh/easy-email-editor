"use client";

import React from "react";
import { Provider } from "react-redux";
import store from "@demo/store";
import Page from "@demo/components/Page";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <Page>{children as React.ReactElement}</Page>
    </Provider>
  );
}
