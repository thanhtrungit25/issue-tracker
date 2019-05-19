import React, { Component } from 'react';
import { NavItem, Modal, Button, NavDropdown, MenuItem } from 'react-bootstrap';

export default class SignInNavItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showing: false,
      disabled: true,
    };
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.signin = this.signin.bind(this);
    this.signOut = this.signOut.bind(this);
  }
  componentDidMount() {
    window.gapi.load('auth2', () => {
      // Check if not authenticated
      if (!window.gapi.auth2.getAuthInstance()) {
        // Not exist config file
        if (!window.config || !window.config.googleClientId) {
          this.props.showError('Missing Google Client ID  or config file /static/config.js');
        } else {
          // Initial authentication with client id
          window.gapi.auth2.init({ client_id: window.config.googleClientId })
            .then(() => {
              this.setState({ disabled: false });
            });
        }
      }
    });
  }
  signin() {
    this.hideModal();
    const auth2 = window.gapi.auth2.getAuthInstance();
    // authentication with google
    auth2.signIn().then(googleUser => {
      // call api signin with id_token from google api
      fetch('/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: googleUser.getAuthResponse().id_token }),
      }).then(response => {
        if (response.ok) { // show login sucess with username
          response.json().then(user => {
            this.props.onSignin(user.name);
          });
        } else { // show login failed
          response.json().then(error => {
            this.props.showError(`App login failed: ${error}`);
          });
        }
      })
      .catch(err => {
        this.props.showError(`Error posting login to app: ${err}`);
      });
    }, error => {
      this.props.showError(`Error authenticating with Google: ${error}`);
    });
  }
  signOut() {
    const auth2 = window.gapi.auth2.getAuthInstance();
    fetch('/signout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(response => {
      if (response.ok) {
        auth2.signOut().then(() => {
          this.props.showSuccess('Successfully signed out.');
          this.props.onSignout();
        });
      }
    });
  }
  showModal() {
    if (this.state.disabled) {
      this.props.showError('Missing Google Client ID or config file /static/config.js');
    } else {
      this.setState({ showing: true });
    }
  }
  hideModal() {
    this.setState({ showing: false });
  }
  render() {
    if (this.props.user.signedIn) {
      return (
        <NavDropdown title={this.props.user.name} id="user-dropdown">
          <MenuItem onClick={this.signOut}>Sign out</MenuItem>
        </NavDropdown>
      );
    }
    return (
      <NavItem onClick={this.showModal}>Sign in
        <Modal show={this.state.showing} onHide={this.hideModal} bsStyle="sm">
          <Modal.Header closeButton>
            <Modal.Title>Sign In</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button block disabled={this.state.disabled} onClick={this.signin}>
              <img src="/btn_google_signin_dark_normal_web.png" alt="Signin" />
            </Button>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="link" onClick={this.hideModal}>Cancel</Button>
          </Modal.Footer>
        </Modal>
      </NavItem>
    );
  }
}

SignInNavItem.propTypes = {
  showError: React.PropTypes.func.isRequired,
  showSuccess: React.PropTypes.func.isRequired,
  onSignin: React.PropTypes.func.isRequired,
  onSignout: React.PropTypes.func.isRequired,
  user: React.PropTypes.object,
};
