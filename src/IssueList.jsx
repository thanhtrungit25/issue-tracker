import React from 'react';
import 'isomorphic-fetch';
import IssueFilter from './IssueFilter.jsx';
import { Link } from 'react-router';
import { Button, Glyphicon, Table, Panel } from 'react-bootstrap';

const IssueRow = props => {
  function onDeleteClick() {
    props.deleteIssue(props.issue._id);
  }
  return (
    <tr>
      <td><Link to={`/issues/${props.issue._id}`}>
        {props.issue._id.substr(-4)}</Link></td>
      <td>{props.issue.status}</td>
      <td>{props.issue.owner}</td>
      <td>{props.issue.created.toDateString()}</td>
      <td>{props.issue.effort}</td>
      <td>
        {props.issue.completionDate
          ? props.issue.completionDate.toDateString()
          : ''}
      </td>
      <td>{props.issue.title}</td>
      <td>
        <Button bsSize="xsmall" onClick={onDeleteClick}><Glyphicon glyph="trash" /></Button>
      </td>
    </tr>
  );
};

IssueRow.propTypes = {
  issue: React.PropTypes.object.isRequired,
  deleteIssue: React.PropTypes.func.isRequired,
};

function IssueTable(props) {
  const issueRows = props.issues.map(issue => (
    <IssueRow key={issue._id} issue={issue} deleteIssue={props.deleteIssue} />
  ));
  return (
    <Table bordered responsive hover condensed>
      <thead>
        <tr>
          <th>Id</th>
          <th>Status</th>
          <th>Owner</th>
          <th>Created</th>
          <th>Effort</th>
          <th>Completion Date</th>
          <th>Title</th>
          <th></th>
        </tr>
      </thead>
      <tbody>{issueRows}</tbody>
    </Table>
  );
}

IssueTable.propTypes = {
  issues: React.PropTypes.array.isRequired,
  deleteIssue: React.PropTypes.func.isRequired,
};

export default class IssueList extends React.Component {
  static dataFetcher({ location, urlBase }) {
    return fetch(`${urlBase || ''}/api/issues${location.search}`)
      .then(response => {
        if (!response.ok) {
          return response.json().then(error => Promise.reject(error));
        }
        return response.json().then(data => Promise.resolve({ IssueList: data }));
      });
  }

  constructor(props, context) {
    super(props, context);
    const issues = context.initialState.IssueList ?
      context.initialState.IssueList.records : [];
    issues.forEach(issue => {
      issue.created = new Date(issue.created);
      if (issue.completionDate) {
        issue.completionDate = new Date(issue.completionDate);
      }
    });

    this.state = {
      issues,
    };

    this.setFilter = this.setFilter.bind(this);
    this.deleteIssue = this.deleteIssue.bind(this);
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
    // fetch(`/api/issues${this.props.location.search}`)
    //   .then(response => {
    //     if (response.ok) {
    //       response.json().then(data => {
    //         data.records.forEach(issue => {
    //           issue.created = new Date(issue.created);
    //           if (issue.completionDate) issue.completionDate = new Date(issue.completionDate);
    //         });
    //         this.setState({ issues: data.records });
    //       });
    //     } else {
    //       response.json().then(error => {
    //         alert(`Failed to fetch issues: ${error.message}`);
    //       });
    //     }
    //   })
    //   .catch(err => {
    //     alert('Error in fetching data from server', err);
    //   });
    IssueList.dataFetcher({ location: this.props.location })
      .then(data => {
        const issues = data.IssueList.records;
        issues.forEach(issue => {
          issue.created = new Date(issue.created);
          if (issue.completionDate) issue.completionDate = new Date(issue.completionDate);
        });
        this.setState({ issues });
      }).catch(err => {
        alert(`Error in fetching data from server: ${err}`);
      });
  }

  deleteIssue(id) {
    fetch(`/api/issues/${id}`, { method: 'DELETE' }).then(response => {
      if (!response.ok) alert('Failed to delete issue');
      else this.loadData();
    });
  }

  render() {
    return (
      <div>
        <Panel collapsible header="Filter">
          <IssueFilter initFilter={this.props.location.query} setFilter={this.setFilter} />
        </Panel>
        <hr />
        <IssueTable issues={this.state.issues} deleteIssue={this.deleteIssue} />
      </div>
    );
  }
}

IssueList.contextTypes = {
  initialState: React.PropTypes.object,
};

IssueList.propTypes = {
  location: React.PropTypes.object.isRequired,
  router: React.PropTypes.object,
};
