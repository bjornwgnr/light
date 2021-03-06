// Copyright 2015-2018 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: MIT

import { action, computed, observable } from 'mobx';
import { chainName$, defaultAccount$ } from '@parity/light.js';
import { combineLatest } from 'rxjs';
import store from 'store';

import ethereumIcon from '../assets/img/tokens/ethereum.png';
import LS_PREFIX from './utils/lsPrefix';

const LS_KEY = `${LS_PREFIX}::tokens`;

class TokensStore {
  @observable tokens = new Map();

  constructor () {
    combineLatest(chainName$(), defaultAccount$()).subscribe(
      ([chainName, defaultAccount]) =>
        // Refetch token from localStorage everytime we have a new chainName
        // (shouldn't happen) or the user selects a new account
        this.fetchTokensFromDb(chainName, defaultAccount)
    );
  }

  @action
  addToken = (address, token) => {
    this.tokens.set(address, token);
    this.updateLS();
  };

  @action
  fetchTokensFromDb = async (chainName, defaultAccount) => {
    // Set the localStorage key, we have one key per chain per account, in this
    // format: __paritylight::tokens::0x123::kovan
    this.lsKey = `${LS_KEY}::${defaultAccount}::${chainName}`;

    // Now we fetch the tokens from the localStorage
    const tokens = store.get(this.lsKey);

    if (!tokens) {
      // If there's nothing in the localStorage, we add be default only
      // Ethereum. We consider Ethereum as a token, with address 'ETH'
      this.tokens.replace({
        ETH: {
          address: 'ETH',
          logo: ethereumIcon,
          name: 'Ethereum',
          symbol: 'ETH'
        }
      });
    } else {
      this.tokens.replace(tokens);
    }
  };

  @action
  removeToken = address => {
    this.tokens.delete(address);
    this.updateLS();
  };

  @computed
  get tokensArray () {
    return Array.from(this.tokens.values());
  }

  @computed
  get tokensArrayWithoutEth () {
    return Array.from(this.tokens.values()).filter(
      ({ address }) => address !== 'ETH' // Ethereum is the only token without address, has 'ETH' instead
    );
  }

  updateLS = () => {
    if (!this.lsKey) {
      return;
    }
    store.set(this.lsKey, this.tokens);
  };
}

export default new TokensStore();
