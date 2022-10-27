import React from "react";
import { useSelector } from "react-redux";
import { CONSTANTS } from "../config";


function FilterWithInput(props) {
    const dispatch = props.dispatch;
    const filterPropertyType = props.filterPropertyType;
    const addFunction = props.addFunction;
    const removeFunction = props.removeFunction;
    const selector = props.selector;
    const [currentFilterInput, setFilterInput] = React.useState("");
    const currentFilters = useSelector(selector);

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

    const handleFilterElementSubmit = (event) => {
        event.preventDefault()
        if (currentFilterInput.length > 1) {
            dispatch(addFunction([currentFilterInput,]));
        }
    }

    const handleFilterElementRemoval = (filterElement) => {
        if (filterElement) {
            dispatch(removeFunction([filterElement,]));
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
                    onClick={handleFilterElementSubmit}>
                    Add
                </button>
            </div>

            <div className="container mb-3">
                {currentFilters.map(filterElement =>
                    <div className="d-inline-flex"
                        key={filterElement}
                        extensionid={filterElement}
                        style={clickableTagStyle}
                        onClick={() => handleFilterElementRemoval(filterElement)}>
                        <span
                            className="badge rounded-pill m-1"
                            style={pillStyle}>
                            {filterElement}
                            <i className="m-1 bi bi-x-circle"></i>
                        </span>
                    </div>)}
            </div>
        </>
    )

}

export default FilterWithInput;