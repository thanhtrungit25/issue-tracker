const validIssueStatus = {
  New: true,
  Open: true,
  Assigned: true,
  Fixed: true,
  Verified: true,
  Closed: true,
};

const issueFieldType = {
  status: 'required',
  title: 'required',
  owner: 'required',
  effort: 'optinal',
  created: 'required',
  completionDate: 'optional',
};

function cleanupIssue(issue) {
  const cleanUpIssue = {};
  Object.keys(issueFieldType).forEach(field => {
    if (issueFieldType[field]) cleanUpIssue[field] = issue[field];
  });
  return cleanUpIssue;
}

function validateIssue(issue) {
  const errors = [];
  Object.keys(issueFieldType).forEach(field => {
    if (issueFieldType[field] === 'required' && !issue[field]) {
      errors.push(`Missing mandatory field: ${field}`);
    }
  });

  if (!validIssueStatus[issue.status]) {
    errors.push(`${issue.status} is not a valid status.`);
  }

  return errors.length ? errors.join('; ') : null;
}

export default {
  validateIssue,
  cleanupIssue,
};
