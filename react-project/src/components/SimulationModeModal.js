import * as d3 from 'd3';
import { useState } from 'react';

function SimulationModeModal(props) {
    const formatPercentage = d3.format(",.1%");
    const formatSI = d3.format(".3s");

    const nodeData = props.data;
    const authorsList = ("users" in nodeData) ? [...nodeData.users] : undefined;

    let authorsListContributionPercentage = undefined;
    const [nameFilterValue, setNameFilterValue] = useState('');

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
    }

    const handleSearchTextChange = (event) => {
        if (event.target.value) {
            let filterValue = String(event.target.value).trim();
            if (filterValue.length > 1) {
                setNameFilterValue(filterValue);
            }
            else {
                setNameFilterValue("");
            }
        }
        else {
            setNameFilterValue("");
        }
    }

    return (
        <div id="simulation-mode-container" className='row panel-right mt-2 pt-2 pb-2'>
            <h4>Simulation Mode <i className='bi bi-info-circle-fill'></i></h4>
            <div>
                <p className="small">Using this mode, we can highlight if the bus factor changes if a certain author leaves</p>
                <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                    Configure Simulation
                </button>
            </div>

            {/* Modal */}
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Modal title</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="col-auto">
                                <div className="input-group">
                                    <input type="text"
                                        className="form-control"
                                        onChange={handleSearchTextChange}
                                        aria-describedby="input-file-extension"
                                    >
                                    </input>

                                    <button
                                        className="btn btn-dark"
                                        type="button"
                                        id="button-filter-add"
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>
                            <table className="table table-striped">

                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Included?</th>
                                        <th>Email</th>
                                        <th>Authorship</th>
                                        <th>Relative Contribution (to current location)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        (authorsList && authorsListContributionPercentage) ? authorsListContributionPercentage.filter((element) => element["email"].includes(nameFilterValue)).map((authorScorePair, index) =>
                                            <tr key={authorScorePair["email"]}>
                                                <td>
                                                    {index + 1}
                                                </td>
                                                <td>
                                                    <i className="bi bi-check2-circle"></i>
                                                </td>
                                                <td>{authorScorePair["email"]}</td>
                                                <td> {formatSI(authorScorePair["authorship"])}</td>
                                                <td>{formatPercentage(authorScorePair["relativeScore"])}</td>
                                            </tr>) : null
                                    }
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary">Apply configuration</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SimulationModeModal;