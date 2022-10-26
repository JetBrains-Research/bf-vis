import { filter } from "d3";
import React from "react";
import { useSelector } from "react-redux";
import { CONSTANTS } from "../config";
import { selectAllFilters } from "../reducers/filterSlice";


function FilterWithInput(props) {
    const dispatch = props.dispatch;
    const filterPropertyType = props.filterPropertyType;
    const addFunction = props.addFunction;
    const removeFunction = props.removeFunction;
    const [currentFilterInput, setFilterInput] = React.useState("");
    const currentFilters = useSelector(selectAllFilters);

    const clickableTagStyle = {
        cursor: "pointer",
    }

    const pillStyle = {
        backgroundColor: CONSTANTS.general.colors.jetbrains.darkRed
    }

    const handleTextChange = (event) => {
        if (event.target.value) {
            let filterValue = String(event.target.value).trim();
            if (filterValue.length > 1) {
                setFilterInput(filterValue);
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
            dispatch(addFunction([currentFilterInput,]));
        }
    }

    const handleFilterExtensionRemoval = (extension) => {
        if (extension) {
            dispatch(removeFunction([extension,]));
        }
    }

    return (
        <>
            <h5>{ filterPropertyType }</h5> 
            <div className="input-group">
                <input type="text"
                    className="form-control"
                    placeholder={filterPropertyType}
                    aria-label={filterPropertyType}
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
                {currentFilters.exclusion.extensions.map(extension =>
                    <div className="d-inline-flex"
                        key={extension}
                        extensionid={extension}
                        style={clickableTagStyle}
                        onClick={() => handleFilterExtensionRemoval(extension)}>
                        <span
                            className="badge rounded-pill m-1"
                            style={pillStyle}>
                            {extension}
                            <i className="m-1 bi bi-x-circle"></i>
                        </span>
                    </div>)}
            </div>
        </>
    )

}

export default FilterWithInput;