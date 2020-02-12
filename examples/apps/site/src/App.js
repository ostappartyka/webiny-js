import { hot } from "react-hot-loader";
import React from "react";
import { registerPlugins, getPlugins } from "@webiny/plugins";
import { PageBuilderProvider } from "@webiny/app-page-builder/contexts/PageBuilder";
import { UiProvider } from "@webiny/app/contexts/Ui";
import { Routes } from "@webiny/app/components";
import plugins from "./plugins";
import { GenericNotFoundPage, GenericErrorPage } from "./pageBuilder";
import { I18NProvider } from "@webiny/app-i18n/contexts/I18N";
import "./App.scss";

registerPlugins(plugins);

// Execute `init` plugins, they may register more plugins dynamically
getPlugins("webiny-init").forEach(plugin => plugin.callback());

const defaults = {
    pages: {
        notFound: GenericNotFoundPage,
        error: GenericErrorPage
    }
};

const App = () => {
    return (
        <I18NProvider>
            <UiProvider>
                <PageBuilderProvider defaults={defaults}>
                    <Routes />
                </PageBuilderProvider>
            </UiProvider>
        </I18NProvider>
    );
};

export default hot(module)(App);
