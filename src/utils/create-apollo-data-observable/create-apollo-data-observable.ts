import { ApolloClient, ApolloQueryResult, NetworkStatus, WatchQueryOptions } from 'apollo-client';
import { Observable } from 'rxjs/Observable';

/**
 * Create an Apollo Observable that displays the loading status
 * @param apollo Apollo instance
 * @param options Apollo WatchQuery Options
 * @param variables$ Observable that emits the variables
 */
// tslint:disable-next-line:no-any
export function createApolloDataObservable<T, E>(apolloClient: ApolloClient<any>, options: WatchQueryOptions, variables$: Observable<E>) {
  return new Observable<ApolloQueryResult<T>>(observer => {
    const watchQuery = apolloClient.watchQuery<T>(options);

    const _variablesSubs = variables$
      .subscribe(variables => {
        watchQuery.setVariables(variables)
          .then(res => {
            if (res) {
              observer.next({
                ...res,
                loading: false,
                networkStatus: NetworkStatus.ready,
              });
            }
          })
          .catch(err => observer.error(err));
      });

    const _apolloSubs = watchQuery.subscribe(
      res => observer.next(res),
      err => observer.error(err),
      () => observer.complete(),
    );

    return () => {
      _variablesSubs.unsubscribe();
      _apolloSubs.unsubscribe();
    };
  });
}
