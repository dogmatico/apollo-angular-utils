/**
 * Jasmine Spec
 */
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient, ApolloQueryResult, NetworkStatus } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import graphqlTag from 'graphql-tag';

import { createApolloDataObservable } from './create-apollo-data-observable';

export interface TestQueryResponse {
  test: {
    test: 'TEST',
  };
}

function responseFactory<T>(
  // tslint:disable-next-line:no-any
  data: T, loading: boolean, networkStatus: NetworkStatus = NetworkStatus.ready, error?: any): ApolloQueryResult<T> {
  return {
    data,
    loading,
    errors: error || null,
    networkStatus,
    stale: false,
  };
}

describe('createApolloDataObservable', () => {
  // tslint:disable-next-line:no-any
  let apolloClient: ApolloClient<any>;
  let link: ApolloLink;
  let cache: InMemoryCache;
  let query: DocumentFragment;

  beforeEach(() => {
    // tslint:disable-next-line:no-any
    link = new ApolloLink((operation, forward): any => {
      console.log(`starting request for ${operation.operationName}`);
      if (forward) {
        return forward(operation).map((data) => {
          console.log(`ending request for ${operation.operationName}`);
          return data;
        });
      }
    });
    cache = new InMemoryCache();
    query = graphqlTag`
      query test {
        test
      }
    `;
    // tslint:disable-next-line:no-any
    apolloClient = new ApolloClient<any>({
      cache,
      link,
    });
  });

  it('Should accept basic arguments', () => {
    createApolloDataObservable(apolloClient, {
      query,
      variables: {
        a: '0',
      },
    }, of({a: '1'}));
  });

  it('Should emit any value emitted by the watchQuery query', () => {
    const apolloRes = responseFactory<TestQueryResponse>({ test: {
      test: 'TEST',
    }}, false);
    const response: Observable<ApolloQueryResult<TestQueryResponse>> = of(apolloRes);

    spyOn(apolloClient, 'watchQuery').and.returnValue(response);
    createApolloDataObservable(apolloClient, {
      query,
      variables: {
        a: '0',
      },
    }, of({a: '1'})).subscribe(val => expect(val).toEqual(apolloRes));
  });
});
