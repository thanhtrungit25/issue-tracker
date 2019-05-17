import React, { Component } from 'react';
import { Table, Panel } from 'react-bootstrap';

import IssueFilter from './IssueFilter.jsx';
import Toast from './Toast.jsx';

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

export default class IssueReport extends Component {
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
      toastVisible: false,
      toastMessage: '',
      toastStyle: 'success',
    };
    this.setFilter = this.setFilter.bind(this);
    this.dismissToast = this.dismissToast.bind(this);
    this.showError = this.showError.bind(this);
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
  dismissToast() {
    this.setState({ dismissToast: false });
  }
  showError(message) {
    this.setState({ toastVisible: true, toastMessage: message, toastStyle: 'danger' });
  }
  loadData() {
    IssueReport.dataFetcher({ location: this.props.location })
      .then(data => {
        this.setState({ stats: data.IssueReport });
      })
      .catch(err => {
        this.showError(`Error in feching data from server: ${err}`);
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
        <Toast
          onDismiss={this.dismissToast}
          message={this.state.toastMessage}
          showing={this.state.toastVisible}
          bsStyle={this.state.toastStyle}
        />
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
};
