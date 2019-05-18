import React, { Component } from 'react';
import { Table, Panel } from 'react-bootstrap';

import IssueFilter from './IssueFilter.jsx';
import withToast from './withToast.jsx';

const statuses = ['New', 'Open', 'Assigned', 'Fixed', 'Verified', 'Closed'];

const StatRow = (props) => (
  <tr>
    <td>{props.owner}</td>
    {statuses.map((status, index) => <td key={index}>{props.count[status]}</td>)}
  </tr>
);

StatRow.propTypes = {
  owner: React.PropTypes.string.isRequired,
  count: React.PropTypes.object.isRequired,
};

class IssueReport extends Component {
  static dataFetcher({ location, urlBase }) {
    const search = location.search ? `${location.search}&_summary` : '?_summary';
    return fetch(`${urlBase || ''}/api/issues${search}`).then(response => {
      if (!response.ok) {
        return response.json().then(error => Promise.reject(error));
      }
      return response.json().then(data => Promise.resolve({ IssueReport: data }));
    });
  }
  constructor(props, context) {
    super(props, context);
    const stats = context.initialState.IssueReport ? context.initialState.IssueReport : {};
    this.state = {
      stats,
    };
    this.setFilter = this.setFilter.bind(this);
  }
  componentDidMount() {
    this.loadData();
  }
  componentDidUpdate(prevProps) {
    const oldQuery = prevProps.location.query;
    const newQuery = this.props.location.query;
    if (oldQuery.status === newQuery.status
      && oldQuery.effort_gte === newQuery.effort_gte
      && oldQuery.effort_lte === newQuery.effort_lte) {
      return;
    }
    this.loadData();
  }
  setFilter(query) {
    this.props.router.push({ pathname: this.props.location.pathname, query });
  }
  loadData() {
    IssueReport.dataFetcher({ location: this.props.location })
      .then(data => {
        this.setState({ stats: data.IssueReport });
      })
      .catch(err => {
        this.props.showError(`Error in feching data from server: ${err}`);
      });
  }
  render() {
    return (
      <div>
        <Panel collapsible header="Filter">
          <IssueFilter setFilter={this.setFilter} initFilter={this.props.location.query} />
        </Panel>
        <Table bordered condensed hover responsive>
          <thead>
            <tr>
              <th></th>
              {statuses.map((status, index) => <td key={index}>{status}</td>)}
            </tr>
          </thead>
          <tbody>
            {Object.keys(this.state.stats).map((owner, index) =>
              <StatRow key={index} owner={owner} count={this.state.stats[owner]} />
            )}
          </tbody>
        </Table>
      </div>
    );
  }
}

IssueReport.contextTypes = {
  initialState: React.PropTypes.object,
};

IssueReport.propTypes = {
  location: React.PropTypes.object,
  router: React.PropTypes.object,
  showError: React.PropTypes.func.isRequired,
};

const IssueReportWithToast = withToast(IssueReport);
IssueReportWithToast.dataFetcher = IssueReport.dataFetcher;

export default IssueReportWithToast;
