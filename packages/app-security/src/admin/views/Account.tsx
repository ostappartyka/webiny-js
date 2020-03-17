import React, { useState, useReducer, useEffect } from "react";
import gql from "graphql-tag";
import { omit } from "lodash";
import { get } from "dot-prop-immutable";
import { useApolloClient } from "react-apollo";
import { useHandler } from "@webiny/app/hooks/useHandler";
import { i18n } from "@webiny/app/i18n";
import { Form } from "@webiny/form";
import { getPlugin } from "@webiny/plugins";
import { Input } from "@webiny/ui/Input";
import { ButtonPrimary } from "@webiny/ui/Button";
import { useSnackbar } from "@webiny/app-admin/hooks/useSnackbar";
import { CircularProgress } from "@webiny/ui/Progress";
import AvatarImage from "./Components/AvatarImage";
import { validation } from "@webiny/validation";
import { useSecurity } from "@webiny/app-security/hooks/useSecurity";
import { CollapsibleList, SimpleListItem, ListItemMeta } from "@webiny/ui/List";
// import { CollapsibleList } from "@rmwc/list";
import { IconButton } from "@webiny/ui/Button";

import {
    SimpleForm,
    SimpleFormHeader,
    SimpleFormFooter,
    SimpleFormContent
} from "@webiny/app-admin/components/SimpleForm";

import { SecurityViewUserAccountFormPlugin } from "@webiny/app-security/types";

const t = i18n.ns("app-security/admin/account-form");

const GET_CURRENT_USER = gql`
    {
        security {
            getCurrentUser {
                data {
                    id
                    email
                    firstName
                    lastName
                    avatar {
                        id
                        src
                    }
                }
                error {
                    code
                    message
                }
            }
        }
    }
`;

const UPDATE_CURRENT_USER = gql`
    mutation updateMe($data: SecurityCurrentUserInput!) {
        security {
            updateCurrentUser(data: $data) {
                data {
                    id
                    email
                    avatar {
                        id
                        src
                    }
                }
            }
        }
    }
`;

const UserAccountForm = () => {
    const auth = getPlugin<SecurityViewUserAccountFormPlugin>("security-view-user-account-form");

    if (!auth) {
        throw Error(
            `You must register a "security-view-user-account-form" plugin to render Account form!`
        );
    }

    const [{ loading, user }, setState] = useReducer((prev, next) => ({ ...prev, ...next }), {
        loading: true,
        user: { data: {} }
    });

    const client = useApolloClient();
    const { showSnackbar } = useSnackbar();
    const security = useSecurity();

    const onSubmit = useHandler(null, () => async formData => {
        setState({ loading: true });
        const { data: response } = await client.mutate({
            mutation: UPDATE_CURRENT_USER,
            variables: { data: omit(formData, ["id"]) }
        });
        const { error } = response.security.updateCurrentUser;
        setState({ loading: false });
        if (error) {
            return showSnackbar(error.message, {
                action: "Close"
            });
        }

        security.refreshUser();
        showSnackbar("Account saved successfully!");
    });

    useEffect(() => {
        client.query({ query: GET_CURRENT_USER }).then(({ data }) => {
            setState({ loading: false, user: get(data, "security.getCurrentUser") });
        });
    }, []);

    const [tokens, setTokens] = useState(
        user.data.tokens ||
            (user.data.tokens = [
                "sdhgsahgasighsdgssdhgsahgasighsdgssdhgsahgasighsdgs",
                "fhdiasjhdfjiohfdijfhdiasjhdfjiohfdijfhdiasjhdfjiohf"
            ])
    );
    const TokenListItem = ({ value }) => (
        <SimpleListItem text={value}>
            <ListItemMeta>
                <IconButton onClick={() => deleteToken(value)} icon="X" label="Rate this!" />
            </ListItemMeta>
        </SimpleListItem>
    );

    const deleteToken = removedValue => {
        setTokens(tokens.filter(token => token !== removedValue));
    };

    const generateToken = () => {
        const base =
            "hbdfspbgmdfpibgiopfdgkpfasdiocmiosaioasfasiwqpwqkoperpoerkqwoprkewfpokedweidjosgajiwgfiosjfgiosjifosoihgfiweahfowiogfweiogfwohgfiohaihgfiowhoigfawhgiohwioohoieawhgiowoiweahgoiwghiow";
        const index = Math.floor(Math.random() * (base.length - 51));
        setTokens([...tokens, base.slice(index, index + 51)]);
    };

    return (
        <Form data={user.data} onSubmit={onSubmit}>
            {({ data, form, Bind }) => (
                <SimpleForm>
                    {loading && <CircularProgress />}
                    <SimpleFormHeader title={"Account"} />
                    <SimpleFormContent>
                        {React.createElement(auth.view, {
                            Bind,
                            data,
                            fields: {
                                firstName: (
                                    <Bind
                                        name="firstName"
                                        validators={validation.create("required")}
                                    >
                                        <Input label={t`First Name`} />
                                    </Bind>
                                ),
                                lastName: (
                                    <Bind
                                        name="lastName"
                                        validators={validation.create("required")}
                                    >
                                        <Input label={t`Last Name`} />
                                    </Bind>
                                ),
                                avatar: (
                                    <Bind name="avatar">
                                        <AvatarImage />
                                    </Bind>
                                ),
                                email: (
                                    <Bind name="email" validators={validation.create("required")}>
                                        <Input label={t`E-mail`} />
                                    </Bind>
                                ),
                                tokens: (
                                    <Bind name="tokens">
                                        <div>
                                            <CollapsibleList
                                                handle={<SimpleListItem text="Tokens" />}
                                            >
                                                {tokens.map(token =>
                                                    TokenListItem({ value: token })
                                                )}
                                                <ButtonPrimary onClick={() => generateToken()}>
                                                    Generate
                                                </ButtonPrimary>
                                            </CollapsibleList>
                                        </div>
                                    </Bind>
                                )
                            }
                        })}
                    </SimpleFormContent>
                    <SimpleFormFooter>
                        <ButtonPrimary onClick={form.submit}>{t`Update account`}</ButtonPrimary>
                    </SimpleFormFooter>
                </SimpleForm>
            )}
        </Form>
    );
};

export default UserAccountForm;
