import React from "react";
import {
    addExclusionExtensionsFilter,
    removeExclusionExtensionsFilter,
    addExclusionFilenamePrefixesFilter,
    removeExclusionFilenamePrefixesFilter,
    addExclusionFilenameFilter,
    removeExclusionFilenameFilter,
    selectExclusionExtensionFilters,
    selectExclusionFileNamesFilters,
    selectExclusionFileNamePrefixFilters,
}
    from "../reducers/filterSlice";
import { returnTreemapHome } from "../reducers/treemapSlice";
import FilterWithInput from "./FilterWithInput";

function Navigator(props) {
    const dispatch = props.dispatch;
    const currentPath = props.path;
    const setPathFunc = props.setPathFunc;
    const [checked, setChecked] = React.useState(false);

    const handleDotFilterSwitch = (event) => {
        setChecked(!checked);

        if (event.target.checked) {
            dispatch(addExclusionFilenamePrefixesFilter(['.',]));
        }

        else if (!event.target.checked) {
            dispatch(removeExclusionFilenamePrefixesFilter(['.',]));
        }
    }

    const generateBreadcrumb = (i, currentPath) => {
        return i < currentPath.split('/').length ?
            currentPath.split('/').slice(0, i + 1).join('/') :
            currentPath.split('/')[0]
    }

    return (
        <div className='col p-1' id='controls'>

            <div className="row pt-2 pb-2 mb-3 panel-left">
                <h4>Current Path:</h4>

                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        {currentPath.split('/').map(
                            (pathElement, i) =>
                                <li className={i < currentPath.split('/').length - 1 ? "btn btn-link breadcrumb-item p-1" : "btn btn-link breadcrumb-item active p-1"}
                                    key={pathElement}
                                    onClick={() => setPathFunc(generateBreadcrumb(i, currentPath))}>
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
                        id="back" onClick={() => currentPath.split('/').length > 0 ? setPathFunc(currentPath.split('/').slice(0, -1).join('/')) : setPathFunc(".")}>Back</button>
                    <button type="button" className="btn" style={{
                        backgroundColor: "#FE2857",
                        color: "white"

                    }} id="reset" onClick={() => dispatch(returnTreemapHome())}>Reset</button>
                </div>

            </div>

            <div className="row pt-2 pb-2 mb-3 panel-left">
                <h4>Filters</h4>
                <FilterWithInput key="File extension" filterPropertyType="File extension" addFunction={addExclusionExtensionsFilter} removeFunction={removeExclusionExtensionsFilter} selector={selectExclusionExtensionFilters} dispatch={dispatch} addDefaultPrefix="." >
                </FilterWithInput>

                <FilterWithInput key="File name" filterPropertyType="File name" addFunction={addExclusionFilenameFilter} removeFunction={removeExclusionFilenameFilter} selector={selectExclusionFileNamesFilters} dispatch={dispatch}> </FilterWithInput>
                
                <FilterWithInput key="File name prefix" filterPropertyType="File name prefix" addFunction={addExclusionFilenamePrefixesFilter} removeFunction={removeExclusionFilenamePrefixesFilter} selector={selectExclusionFileNamePrefixFilters} dispatch={dispatch}> </FilterWithInput>

                <div className="col ps-5 form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked={checked} onChange={handleDotFilterSwitch}></input>
                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Filter nodes starting with '.'</label>
                </div>
            </div>
        </div>

    )
}

export default Navigator;