/** @format */

import React from "react";
import { useSelector } from "react-redux";
import { CONFIG } from "../config";
import { InfoPanel } from "./InfoPanel";

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
  };

  const pillStyle = {
    backgroundColor: CONFIG.general.colors.jetbrains.darkRed,
  };

  const handleTextChange = (event) => {
    if (event.target.value) {
      let filterValue = String(event.target.value).trim();
      if (filterValue.length > 1) {
        setFilterInput(filterValue);
      } else {
        setFilterInput("");
      }
    } else {
      setFilterInput("");
    }
  };

  const handleFilterElementSubmit = (event) => {
    let isValid = true;
    event.preventDefault();
    if (currentFilterInput.length > 1) {
      try {
        RegExp(currentFilterInput);
      } catch (e) {
        isValid = false;
      }
      if (!isValid) {
        alert(
          "Invalid regex pattern specified. Please test it out and fix it using https://regexr.com and try again"
        );
      } else {
        dispatch(addFunction([currentFilterInput]));
      }
    }
  };

  const handleFilterElementRemoval = (filterElement) => {
    if (filterElement) {
      dispatch(removeFunction([filterElement]));
    }
  };

  return (
    <div className="mt-3 mb-3">
      <h6>
        {filterPropertyType}{" "}
        {props.infoPanelDetails !== null ? (
          <InfoPanel
            divName={filterPropertyType + "InfoPanel"}
            header={"How does " + filterPropertyType + " work?"}
            body={props.infoPanelDetails}></InfoPanel>
        ) : null}
      </h6>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder={filterPropertyType}
          aria-label={filterPropertyType}
          aria-describedby="input-file-extension"
          onChange={handleTextChange}></input>

        <button
          className="btn btn-dark"
          type="button"
          id="button-filter-add"
          onClick={handleFilterElementSubmit}>
          Add
        </button>
      </div>

      <div className="container mb-3">
        {currentFilters.map((filterElement) => (
          <div
            className="d-inline-flex"
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
          </div>
        ))}
      </div>

      {currentFilters.length > 0 ? (
        <button
          className="btn"
          type="button"
          id="button-filter-remove-all"
          style={{
            backgroundColor: CONFIG.general.colors.jetbrains.brightRed,
            color: "white",
          }}
          onClick={() => dispatch(props.removeAllFunction())}>
          Remove All Filters
        </button>
      ) : null}
    </div>
  );
}

export default FilterWithInput;
