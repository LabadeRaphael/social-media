"use client";

import { ReactNode } from "react";

import { store } from "@/redux/store";
import { Provider } from "react-redux";
const ReduxProvider=({ children }: { children: ReactNode }) =>{
  return <Provider store={store}>{children}</Provider>;
}
export { ReduxProvider }
