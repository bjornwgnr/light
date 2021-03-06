// Copyright 2015-2018 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: MIT

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';

import CreateAccountHeader from '../CreateAccountHeader';

@inject('createAccountStore')
@observer
class AccountCopyPhrase extends Component {
  render () {
    const {
      createAccountStore: { phrase },
      location: { pathname }
    } = this.props;
    const currentStep = pathname.slice(-1);

    return (
      <div className='box -padded'>
        <div className='box -card'>
          <CreateAccountHeader />
          <div className='box -card-drawer'>
            <div className='text'>
              <p>Please write your secret phrase on a piece of paper:</p>
            </div>
            <div className='text -code'>
              {phrase}
            </div>
            <nav className='form-nav'>
              <Link to={`/accounts/new/${+currentStep + 1}`}>
                <button className='button'>Next</button>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    );
  }
}

export default AccountCopyPhrase;
