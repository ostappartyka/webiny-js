import React from "react";
import { getPlugins } from "@webiny/plugins";
import { RoutePlugin } from "@webiny/app/types";
import { Switch } from "@webiny/react-router";

export const Routes = () => {
    const plugins = getPlugins<RoutePlugin>("route");
    const byLength = plugins.sort((a, b) => {
        const aPath = a.route.props.path || "";
        const bPath = b.route.props.path || "";
        return bPath.length - aPath.length;
    });

    return (
        <Switch>
            {byLength.map(pl => React.cloneElement(pl.route, { key: pl.name, exact: true }))}
        </Switch>
    );
};
