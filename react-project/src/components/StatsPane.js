import React, { useState } from "react";
import * as d3 from 'd3';

function StatsPane(props) {
    const formatPercentage = d3.format(",.1%");
    const formatSI = d3.format(".3s");

    const nodeData = props.data;
    const nodeBusFactor = ("busFactor" in nodeData.busFactorStatus) ? nodeData.busFactorStatus.busFactor : "N/A";
    const authorsList = ("users" in nodeData) ? [...nodeData.users] : undefined;
    let topAuthors = undefined;
    let authorsListContributionPercentage = undefined;
    const totalNumOfAuthors = (authorsList) ? authorsList.length : 0;
    const [numOfAuthors, setNumOfAuthors] = useState(0);

    if (authorsList) {
        authorsList.sort((a, b) => b.authorship - a.authorship);
        let cumulativeAuthorship = authorsList.map(element => element.authorship).reduce((prevValue, currentValue) => prevValue + currentValue, 0);

        authorsListContributionPercentage = authorsList.map((authorContributionPair) => {
            return {
                "email": authorContributionPair.email,
                "authorship": authorContributionPair.authorship,
                "relativeScore": authorContributionPair.authorship / cumulativeAuthorship
            }
        });
        topAuthors = authorsListContributionPercentage.slice(0, numOfAuthors);
    }

    return (
        <div id="details-container" className='row panel-right mt-2 pt-2 pb-2'>
            <h4>Stats</h4>
            <div className="col-12" >
                <p className="small">Here are some details about the selected node</p>

                <h5>Bus Factor</h5>
                <p className="small">The bus factor of <span className="fw-italic">{nodeData.name}</span> is: <span
                    className="fw-bold">{nodeBusFactor}</span></p>

                <h5>Author Contribution</h5>
                {
                    (authorsList && topAuthors) ?
                        <>
                            <label htmlFor="authorNumberSelecter" className="form-label">Number of Authors to show: {numOfAuthors} </label>
                            <input type="range" className="form-range" defaultValue={Math.min(totalNumOfAuthors, 3)} onChange={(e) => setNumOfAuthors(e.target.value)} min="0" max={totalNumOfAuthors} id="authorNumberSelecter">
                            </input>
                        </> :
                        <>
                            <p>No author info available</p>
                        </>
                }

                <div className="list-group list-group-flush" style={{
                    "maxHeight": "25vh",
                    "maxWidth": "15vw",
                    "overflowY": "scroll",
                }}>
                    {(authorsList && topAuthors) ? topAuthors.map(
                        (authorScorePair) =>
                            <div className="list-group-item" key={authorScorePair["email"]}>
                                <p className="small text-break text-wrap">
                                    {authorScorePair["email"]}
                                </p>
                                <h6 className="small">{formatSI(authorScorePair["authorship"])}</h6>
                                <span className="small">({formatPercentage(authorScorePair["relativeScore"])})</span>
                            </div>
                    )
                        : <p className="small fw-bold">N/A</p>}
                </div>
            </div>
        </div>
    )
}

export default StatsPane;