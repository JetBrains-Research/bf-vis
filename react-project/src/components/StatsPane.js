import React, { useState } from "react";
import * as d3 from 'd3';
import { min } from "d3";

function StatsPane(props) {
    const formatPercentage = d3.format(",.1%");
    const formatSI = d3.format(".3s");
    
    const nodeData = props.data;
    const nodeBusFactor = ("busFactor" in nodeData.busFactorStatus) ? nodeData.busFactorStatus.busFactor : "N/A";
    const authorsList = ("usersFormatted" in nodeData) ? [...nodeData.usersFormatted] : undefined;
    let topAuthors = undefined;
    let authorsListContributionPercentage = undefined;
    const totalNumOfAuthors = (authorsList) ? authorsList.length : 0;
    const initialNumOfAuthors = min([totalNumOfAuthors, 3]);
    const [numOfAuthors, setNumOfAuthors] = useState(initialNumOfAuthors);

    if (authorsList) {
        authorsList.sort((a, b) => b.contributionScore - a.contributionScore);
        let cumulativeAuthorContributionScore = authorsList.map(element => element.contributionScore).reduce((prevValue, currentValue) => prevValue + currentValue, 0);

        authorsListContributionPercentage = authorsList.map((authorContributionPair) => {
            return {
                "email": authorContributionPair.email,
                "contributionScore": authorContributionPair.contributionScore,
                "relativeScore": authorContributionPair.contributionScore / cumulativeAuthorContributionScore
            }
        });

        topAuthors = authorsListContributionPercentage.slice(0, numOfAuthors);
    }

    return (
        <div id="details-container" className='row panel mt-2 pt-2 pb-2'>
            <h4>Stats</h4>
            <div className="col-12" >
                <p className="small">Here are some details about the selected node</p>
                <h5>Bus Factor</h5>
                <p className="small">The bus factor of <span className="fw-italic">{nodeData.name}</span> is: <span
                    className="fw-bold">{nodeBusFactor}</span></p>
                <h5>Author Contribution</h5>
                <label htmlFor="authorNumberSelecter" className="form-label">Number of Authors to show: {numOfAuthors} </label>
                <input type="range" className="form-range" defaultValue={numOfAuthors} onChange={(e) => setNumOfAuthors(e.target.value)} min="1" max={totalNumOfAuthors} id="authorNumberSelecter"></input>
                <div className="list-group list-group-flush overflow-scroll" style={{
                    "maxHeight": "30vh",
                    "maxWidth": "14vw"
                }}>
                    {(authorsList && topAuthors) ? topAuthors.map(
                        (authorScorePair) =>
                            <div className="list-group-item" key={authorScorePair["email"]}>
                                <p className="small">{authorScorePair["email"]}: {formatSI(authorScorePair["contributionScore"])} ({formatPercentage(authorScorePair["relativeScore"])})</p>
                            </div>
                    )
                        : <p className="small fw-bold">N/A</p>}
                </div>
            </div>
            <div>
                <p>Click the button below to learn more about color and sizing of the treemap tiles</p>
                <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#legendModal">
                    Legend
                </button>
            </div>
        </div>
    )
}

export default StatsPane;