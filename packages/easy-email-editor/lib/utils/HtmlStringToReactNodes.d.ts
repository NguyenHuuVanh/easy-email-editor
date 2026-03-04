import React from "react";
export declare function getChildSelector(selector: string, index: number): string;
export interface HtmlStringToReactNodesOptions {
    enabledMergeTagsBadge: boolean;
}
export declare function HtmlStringToReactNodes(content: string, option: HtmlStringToReactNodesOptions): React.JSX.Element;
