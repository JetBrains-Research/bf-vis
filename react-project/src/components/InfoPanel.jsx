/** @format */

import React from "react";

function InfoButton(props) {
  return (
    <i
      className="bi bi-info-circle-fill"
      data-bs-toggle="offcanvas"
      data-bs-target={"#" + props.target}></i>
  );
}

function OffCanvasSideBar(props) {
  return (
    <>
      <div
        className="offcanvas offcanvas-start"
        data-bs-scroll="true"
        tabIndex="-1"
        id={props.divName}
        aria-labelledby={props.divName + "Label"}>
        <div className="offcanvas-header">
          <h5
            className="offcanvas-title"
            id={props.divName + "Label"}>
            {props.header}?
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"></button>
        </div>
        <div className="offcanvas-body"><p style={{
          textAlign:"justify"
        }} className="fs-6 fw-normal">{ props.body }</p></div>
      </div>
    </>
  );
}

export function InfoPanel(props) {
  return (
    <>
      <InfoButton target={props.divName}></InfoButton>
      <OffCanvasSideBar
        divName={props.divName}
        header={props.header}
        body={props.body}></OffCanvasSideBar>
    </>
  );
}
