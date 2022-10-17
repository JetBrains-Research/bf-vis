import React from "react";
import { useSelector } from "react-redux";
import { reset, scopeOut, addExtensionExcludeFilter, removeExtensionExcludeFilter, selectFilters, scopeIn, addFileNamePrefixExcludeFilter, removeFileNamePrefixExcludeFilter } from '../reducers/defaultSlice';

function Navigator(props) {
    const dispatch = props.dispatch;
    const currentPath = props.path;
    const currentFilters = useSelector(selectFilters);
    const [currentFilterInput, setFilterInput] = React.useState("");
    const [checked, setChecked] = React.useState(false);

    const clickableTagStyle = {
        cursor: "pointer"
    }

    const handleTextChange = (event) => {
        if (event.target.value) {
            let filterExtension = String(event.target.value).trim();
            if (filterExtension.length > 1) {
                setFilterInput(`.${filterExtension}`);
            }
            else {
                setFilterInput("");
            }
        }
        else {
            setFilterInput("");
        }
    }

    const handleFilterExtensionSubmit = (event) => {
        event.preventDefault()
        if (currentFilterInput.startsWith('.') && currentFilterInput.length > 1) {
            dispatch(addExtensionExcludeFilter({
                filters: {
                    exclude: {
                        extensions: [currentFilterInput]
                    }
                }
            }));
        }
    }

    const handleFilterExtensionRemoval = (extension) => {
        if (extension) {
            dispatch(removeExtensionExcludeFilter({
                filters: {
                    exclude: {
                        extensions: [extension,]
                    }
                }
            }))
        }
    }


    const handleDotFilterSwitch = (event) => {
        // event.preventDefault();
        setChecked(!checked);

        if (event.target.checked) {
            dispatch(
                addFileNamePrefixExcludeFilter(
                    {
                        filters: {
                            exclude: {
                                fileNamePrefix: ['.',]
                            }
                        }
                    }
                ))
        }

        else if (!event.target.checked) {
            dispatch(removeFileNamePrefixExcludeFilter({
                filters: {
                    exclude: {
                        fileNamePrefix: ['.',]
                    }
                }
            }))
        }
    }

    return (
        <div className='col p-1' id='controls'>

            <div className="row pt-2 pb-2 mb-3 panel">
                <h4>Current Path:</h4>

                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        {currentPath.split('/').map(
                            (pathElement, i) =>
                                <li className={i < currentPath.split('/').length - 1 ? "btn btn-link breadcrumb-item p-1" : "btn btn-link breadcrumb-item active p-1"}
                                    key={pathElement}
                                    onClick={() => dispatch(scopeIn({
                                        path: i < currentPath.split('/').length ? currentPath.split('/').slice(0, i + 1).join('/') : currentPath.split('/')[0]
                                    }))}>
                                    {pathElement}
                                </li>
                        )}
                    </ol>
                </nav>

                <div className="btn-group" role="group">
                    <button
                        type="button"
                        className="btn" style={{
                            backgroundColor: "#087CFA",
                            color: "white"

                        }}
                        id="back" onClick={() => dispatch(scopeOut())}>Back</button>
                    <button type="button" className="btn" style={{
                            backgroundColor: "#FE2857",
                            color: "white"

                        }}id="reset" onClick={() => dispatch(reset())}>Reset</button>
                </div>

            </div>

            <div className="row pt-2 pb-2 mb-3 panel">
                <h4>Filters</h4>

                <div className="input-group">
                    <input type="text"
                        className="form-control"
                        placeholder="File extension"
                        aria-label="File extension"
                        aria-describedby="input-file-extension"
                        onChange={handleTextChange}>
                    </input>

                    <button
                        className="btn btn-dark"
                        type="button"
                        id="button-filter-add"
                        onClick={handleFilterExtensionSubmit}>
                        Add
                    </button>

                </div>

                <div className="container mb-3">
                    {currentFilters.exclude.extensions.map(extension =>
                        <div className="d-inline-flex"
                            key={extension}
                            extensionid={extension}
                            style={clickableTagStyle}
                            onClick={() => handleFilterExtensionRemoval(extension)}>
                            <span
                                className="badge text-bg-danger m-1">
                                {extension}
                                <i className="m-1 bi bi-x-circle"></i>
                            </span>
                        </div>)}
                </div>

                <div className="col ps-5 form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked={checked} onChange={handleDotFilterSwitch}></input>
                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Filter nodes starting with '.'</label>
                </div>
            </div>
        </div>

    )
}

export default Navigator;