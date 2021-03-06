// Copyright 2015-2018 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: MIT

import React, { Component } from 'react';
import { chainName$ } from '@parity/light.js';
import debounce from 'lodash/debounce';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';

import light from '../hoc';
import NewTokenItem from './NewTokenItem';

@light({
  chainName: chainName$
})
@inject('tokensStore')
@observer
class Settings extends Component {
  state = {
    db: null,
    dbMap: null,
    matches: this.props.tokensStore.tokensArrayWithoutEth,
    search: ''
  };

  calculateMatches = debounce(() => {
    const { tokensStore: { tokensArrayWithoutEth } } = this.props;
    const { db, search } = this.state;

    if (search.length <= 1) {
      this.setState({ matches: tokensArrayWithoutEth });
      return;
    }

    const matches = db
      ? db.filter(
        ({ name, symbol }) =>
          name.toLowerCase().includes(search.toLowerCase()) ||
            symbol.toLowerCase().includes(search.toLowerCase())
      )
      : [];
    this.setState({ matches });
  }, 500);

  componentDidMount () {
    if (this.props.chainName) {
      this.fetchTokensDb();
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.chainName && !prevProps.chainName) {
      this.fetchTokensDb();
    }
  }

  fetchTokensDb = async () => {
    if (this.state.db) {
      // Don't fetch again if it's already fetched
      return;
    }

    // We only fetch this huge json if the user visits this NewToken page. We
    // try to avoid it as much as possible. All other tokens info (used in the
    // homepage) are stored in localStorage.
    let db;
    try {
      db = await import(`../assets/tokens/${this.props.chainName}.json`);
    } catch (e) {
      db = await import(`../assets/tokens/foundation.json`);
    }

    // We create a address=>token mapping here
    const dbMap = {};
    db.forEach(token => (dbMap[token.address] = token));

    // Commit this into the state
    this.setState({ db, dbMap });
  };

  handleSearch = ({ target: { value } }) => {
    this.setState({ search: value });
    this.calculateMatches();
  };

  handleClear = () => {
    this.setState({ search: '' });
    this.calculateMatches();
  };

  render () {
    const { matches, search } = this.state;

    return (
      <div>
        <nav className='header-nav'>
          <div className='header-nav_left'>
            <Link to='/tokens' className='icon -close'>
              Close
            </Link>
          </div>
          <div className='header-nav_title'>
            <h1>
              Edit token whitelist
            </h1>
          </div>
          <div className='header-nav_right' />
        </nav>

        <div className='window_content'>
          <div className='box -padded'>
            <div className='search-form'>
              <input
                onChange={this.handleSearch}
                placeholder='Find token by name or symbol'
                value={search}
                type='text'
              />
              <button
                onClick={this.handleClear}
                className='button -icon -clear'
                disabled={!search.length}
              >
                Clear
              </button>
            </div>
          </div>
          <div className='box -scroller'>
            <ul className='list -tokens'>
              {matches.map(token =>
                <NewTokenItem key={token.address} token={token} />
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default Settings;
