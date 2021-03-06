import * as React from "react";
import ReactDOM from "react-dom";
import FileManagerView from "./FileManager/FileManagerView";
import pick from "lodash/pick";
import { FileManagerProvider } from "./FileManager/FileManagerContext";

type FileManagerProps = {
    onChange?: Function;
    images?: boolean;
    multiple?: boolean;
    accept?: Array<string>;
    children: ({ showFileManager: Function }) => React.ReactNode;
    maxSize?: number | string;
    multipleMaxCount?: number;
    multipleMaxSize?: number | string;
    onClose?: Function;
};

type FileManagerPortalProps = Omit<FileManagerProps, "children">;

const { useState } = React;

class FileManagerPortal extends React.Component<FileManagerPortalProps> {
    container: Element;
    constructor(props) {
        super(props);

        if (!window) {
            return;
        }

        this.container = window.document.getElementById("file-manager-container");

        if (!this.container) {
            this.container = document.createElement("div");
            this.container.setAttribute("id", "file-manager-container");
            const container = this.container;
            document.body && document.body.appendChild(container);
        }
    }

    render() {
        const {
            onChange,
            onClose,
            accept,
            multiple,
            images,
            maxSize,
            multipleMaxCount,
            multipleMaxSize
        } = this.props;

        const container = this.container;

        const props = {
            onChange: files => {
                const fields = ["id", "name", "src", "size", "type"];
                if (Array.isArray(files)) {
                    onChange(files.map(file => pick(file, fields)));
                } else {
                    onChange(pick(files, fields));
                }
            },
            onClose,
            accept,
            multiple,
            maxSize,
            multipleMaxCount,
            multipleMaxSize
        };

        if (images) {
            props.accept = ["image/jpg", "image/jpeg", "image/gif", "image/png", "image/svg+xml"];
        }

        // Let's pass "permanent" / "persistent" / "temporary" flags as "mode" prop instead.
        return ReactDOM.createPortal(
            <FileManagerProvider {...props}>
                <FileManagerView {...props} />
            </FileManagerProvider>,
            container
        );
    }
}

export function FileManager({ children, ...rest }: FileManagerProps) {
    const [show, setShow] = useState(false);
    return (
        <>
            {show && <FileManagerPortal onClose={() => setShow(false)} {...rest} />}
            {children({
                showFileManager: () => setShow(true)
            })}
        </>
    );
}
